import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Folder, Settings as SettingsIcon, Activity, FileText, FolderGit2, Mail } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useWindowStore } from '@/store/window-store';
import { useSettingsStore } from '@/store/settings-store';
import { APP_REGISTRY } from '@/config/app-registry';

export const Copilot = () => {
    const { windows, activeWindowId, closeWindow, openWindow } = useWindowStore();

    // Prepare context for the AI
    const openWindowsList = Object.values(windows).map(w => `${w.title} (${w.id})`).join(', ');
    const context = `Current open windows: ${openWindowsList || "None"}. Active window: ${activeWindowId || "None"}.`;

    const { messages, input, handleInputChange, handleSubmit, status, addToolResult } = useChat({
        api: '/api/chat',
        body: { context },
        onError: (err: any) => {
            console.error("Copilot Chat Error:", err);
        },
        maxSteps: 5, // Allow multi-step tool calls
    } as any) as any; // Added type assertion for compatibility

    const isLoading = status === 'streaming' || status === 'submitted';
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle client-side tool execution
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.toolInvocations) {
            lastMessage.toolInvocations.forEach((toolInvocation: any) => {
                if (toolInvocation.state !== 'call') return;

                const { toolName, args, toolCallId } = toolInvocation;

                if (toolName === 'openWindow') {
                    let appId = args.appId?.toLowerCase();

                    // Common aliases
                    if (appId === 'filemanager') appId = 'files';
                    if (appId === 'taskmanager') appId = 'task-manager';

                    if (APP_REGISTRY[appId]) {
                        openWindow(appId);
                        addToolResult({ toolCallId, toolName, result: `Opened ${APP_REGISTRY[appId]?.title}` });
                    } else {
                        addToolResult({ toolCallId, toolName, result: `App ${appId} not found` });
                    }
                } else if (toolName === 'closeWindow') {
                    if (args.windowId === 'active') {
                        if (activeWindowId) {
                            closeWindow(activeWindowId);
                            addToolResult({ toolCallId, toolName, result: `Closed active window ${activeWindowId}` });
                        } else {
                            addToolResult({ toolCallId, toolName, result: 'No active window to close' });
                        }
                    } else {
                        closeWindow(args.windowId);
                        addToolResult({ toolCallId, toolName, result: `Closed window ${args.windowId}` });
                    }
                } else if (toolName === 'changeTheme') {
                    const { setting, value } = args;
                    if (setting === 'color') {
                        useSettingsStore.getState().setAccentColor(value);
                        addToolResult({ toolCallId, toolName, result: `Accent color changed to ${value}` });
                    } else if (setting === 'wallpaper') {
                        useSettingsStore.getState().setWallpaper(value);
                        addToolResult({ toolCallId, toolName, result: `Wallpaper changed to ${value}` });
                    }
                }
            });
        }
    }, [messages, openWindow, addToolResult, closeWindow, activeWindowId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-full text-foreground">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <Bot className="h-12 w-12 mb-2" />
                        <p>How can I help you today?</p>
                    </div>
                )}
                {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-2 rounded-lg text-sm ${m.role === 'user'
                                ? 'bg-[rgb(var(--accent-color))] text-black'
                                : 'bg-muted text-foreground border border-border/50'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-2 rounded-lg text-sm animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-muted/20">
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-black/50 border border-[rgba(var(--accent-color),0.3)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-color))] placeholder:text-[rgba(var(--accent-color),0.3)] text-[rgb(var(--accent-color))]"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask Copilot..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-[rgb(var(--accent-color))] text-black rounded-md hover:bg-[rgba(var(--accent-color),0.9)] disabled:opacity-50 transition-opacity"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
