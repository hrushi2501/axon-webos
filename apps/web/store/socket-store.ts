import { create } from 'zustand';

interface SystemStats {
    cpu_usage: number;
    memory_usage: number;
    total_memory: number;
}

interface SocketStore {
    isConnected: boolean;
    stats: SystemStats | null;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (msg: string) => void;
    registerTerminalCallback: (cb: (output: string) => void) => void;
    unregisterTerminalCallback: () => void;
    sendTerminalCommand: (command: string) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => {
    let socket: WebSocket | null = null;
    let terminalCallback: ((output: string) => void) | null = null;

    return {
        isConnected: false,
        stats: null,

        connect: () => {
            if (socket) return;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const wsUrl = `${protocol}//${host}:3001/ws`;

            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                set({ isConnected: true });
                console.log('Connected to backend');

                // Clear simulation if it exists
                const existingInterval = (get() as any).simulationInterval;
                if (existingInterval) {
                    clearInterval(existingInterval);
                    (get() as any).simulationInterval = null;
                }
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type_ === 'stats') {
                        set({
                            stats: {
                                cpu_usage: data.cpu_usage,
                                memory_usage: data.memory_usage,
                                total_memory: data.total_memory
                            }
                        });
                    } else if (data.type_ === 'terminal_output') {
                        if (terminalCallback) {
                            terminalCallback(data.output);
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse message', e);
                }
            };

            socket.onerror = (error) => {
                console.warn('WebSocket error:', error);
                // Don't close here, let onclose handle the cleanup and reconnection
            };

            socket.onclose = () => {
                set({ isConnected: false });
                socket = null;
                console.log("WebSocket closed. Switching to simulation mode...");

                // Start simulation if not already running
                if (!(get() as any).simulationInterval) {
                    const interval = setInterval(() => {
                        if (socket && socket.readyState === WebSocket.OPEN) {
                            clearInterval(interval);
                            (get() as any).simulationInterval = null;
                            return;
                        }
                        set({
                            stats: {
                                cpu_usage: 15 + Math.random() * 30, // 15-45%
                                memory_usage: 4 * 1024 * 1024 * 1024 + Math.random() * 500 * 1024 * 1024, // ~4GB
                                total_memory: 16 * 1024 * 1024 * 1024 // 16GB
                            },
                            isConnected: false // Keep as false to show UI indicator if desired
                        });
                    }, 1000);
                    (get() as any).simulationInterval = interval;
                }

                // Exponential backoff or simple retry
                setTimeout(() => {
                    console.log("Attempting to reconnect...");
                    get().connect();
                }, 3000);
            };

        },

        disconnect: () => {
            if (socket) {
                socket.close();
                socket = null;
                set({ isConnected: false });
            }
        },

        sendMessage: (msg: string) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(msg);
            }
        },

        registerTerminalCallback: (cb: (output: string) => void) => {
            terminalCallback = cb;
        },

        unregisterTerminalCallback: () => {
            terminalCallback = null;
        },

        sendTerminalCommand: (command: string) => {
            const { sendMessage } = get();
            sendMessage(JSON.stringify({ type: 'command', command }));
        }
    };
});
