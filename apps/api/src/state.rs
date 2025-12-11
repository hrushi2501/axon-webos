use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use sysinfo::System;
use serde::Serialize;

pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub _system: Arc<Mutex<System>>,
}

#[derive(Serialize, Clone)]
pub struct SystemStats {
    pub type_: String, // "stats"
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub total_memory: u64,
}
