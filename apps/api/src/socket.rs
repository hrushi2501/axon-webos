use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State},
    response::IntoResponse,
};
use std::sync::Arc;
use futures::{sink::SinkExt, stream::StreamExt};
use crate::state::AppState;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();
    
    // Channel for sending messages from the receive task to the send task (Unicast)
    let (internal_tx, mut internal_rx) = tokio::sync::mpsc::channel::<String>(32);

    // Initialize CWD to current directory
    let mut cwd = std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));

    // Task to send messages to this client (Both Broadcast and Unicast)
    let mut send_task = tokio::spawn(async move {
        loop {
            tokio::select! {
                // Handle global broadcasts (System Stats)
                Ok(msg) = rx.recv() => {
                    if sender.send(Message::Text(msg)).await.is_err() {
                        break;
                    }
                }
                // Handle internal messages (Terminal Output)
                Some(msg) = internal_rx.recv() => {
                    if sender.send(Message::Text(msg)).await.is_err() {
                        break;
                    }
                }
            }
        }
    });

    // Task to receive messages from this client
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(text) = msg {
                // Try to parse as command
                if let Ok(cmd_json) = serde_json::from_str::<serde_json::Value>(&text) {
                    if cmd_json["type"] == "command" {
                        if let Some(cmd_str) = cmd_json["command"].as_str() {
                            let parts: Vec<&str> = cmd_str.trim().split_whitespace().collect();
                            if parts.is_empty() { continue; }
                            
                            let command = parts[0];
                            let args = &parts[1..];
                            
                            let output = match command {
                                "pwd" => cwd.display().to_string(),
                                "whoami" => whoami::username(),
                                "ls" => {
                                    match std::fs::read_dir(&cwd) {
                                        Ok(entries) => {
                                            let mut files = Vec::new();
                                            for entry in entries {
                                                if let Ok(entry) = entry {
                                                    if let Ok(name) = entry.file_name().into_string() {
                                                        files.push(name);
                                                    }
                                                }
                                            }
                                            files.join("  ")
                                        },
                                        Err(e) => format!("Error listing directory: {}", e),
                                    }
                                },
                                "cd" => {
                                    if args.is_empty() {
                                        "Usage: cd <path>".to_string()
                                    } else {
                                        let new_path = cwd.join(args[0]);
                                        if new_path.exists() && new_path.is_dir() {
                                            match new_path.canonicalize() {
                                                Ok(p) => {
                                                    cwd = p;
                                                    String::new()
                                                },
                                                Err(e) => format!("Error resolving path: {}", e),
                                            }
                                        } else {
                                            format!("cd: {}: No such file or directory", args[0])
                                        }
                                    }
                                },
                                _ => format!("bash: {}: command not found", command),
                            };

                            if !output.is_empty() {
                                let response = serde_json::json!({
                                    "type_": "terminal_output",
                                    "output": output
                                });
                                
                                if let Ok(json_str) = serde_json::to_string(&response) {
                                    if internal_tx.send(json_str).await.is_err() {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // If any one of the tasks exit, abort the other
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
