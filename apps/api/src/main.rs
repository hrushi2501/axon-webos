mod state;
mod socket;

use axum::{
    routing::get,
    Router,
};
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sysinfo::System;
use state::{AppState, SystemStats};
use socket::ws_handler;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "webos_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (tx, _rx) = broadcast::channel(100);
    
    // Initialize system info
    let mut sys = System::new_all();
    sys.refresh_all();
    let system = Arc::new(Mutex::new(sys));

    let app_state = Arc::new(AppState { 
        tx: tx.clone(),
        _system: system.clone(),
    });

    // Background task to broadcast system stats
    let tx_clone = tx.clone();
    let sys_clone = system.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(1)).await;
            
            let mut sys = sys_clone.lock().unwrap();
            sys.refresh_cpu();
            sys.refresh_memory();

            let stats = SystemStats {
                type_: "stats".to_string(),
                cpu_usage: sys.global_cpu_info().cpu_usage(),
                memory_usage: sys.used_memory(),
                total_memory: sys.total_memory(),
            };

            if let Ok(json) = serde_json::to_string(&stats) {
                let _ = tx_clone.send(json);
            }
        }
    });

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Routes
    let app = Router::new()
        .route("/", get(root))
        .route("/ws", get(ws_handler))
        .layer(cors)
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Sovereign Stack API is running."
}


