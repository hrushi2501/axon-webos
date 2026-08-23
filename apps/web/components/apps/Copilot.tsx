import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { Bot, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { APP_REGISTRY } from "@/config/app-registry";
import {
  ACCENT_COLORS,
  WALLPAPERS,
  useSettingsStore,
} from "@/store/settings-store";
import { useWindowStore } from "@/store/window-store";

type AxonTools = {
  openWindow: {
    input: { appId: string; title: string };
    output: string;
  };
  closeWindow: {
    input: { windowId: string };
    output: string;
  };
  changeTheme: {
    input: { setting: "wallpaper" | "color"; value: string };
    output: string;
  };
};

type AxonMessage = UIMessage<unknown, never, AxonTools>;

const normalizeAppId = (value: string): string => {
  const appId = value.toLowerCase();
  if (appId === "filemanager") return "files";
  if (appId === "taskmanager") return "task-manager";
  return appId;
};

export const Copilot = () => {
  const { windows, activeWindowId, closeWindow, openWindow } = useWindowStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledToolCalls = useRef(new Set<string>());
  const transport = useMemo(
    () => new DefaultChatTransport<AxonMessage>({ api: "/api/chat" }),
    [],
  );

  const openWindowsList = Object.values(windows)
    .map((window) => `${window.title} (${window.id})`)
    .join(", ");
  const context = `Current open windows: ${openWindowsList || "None"}. Active window: ${activeWindowId || "None"}.`;

  const { messages, sendMessage, status, addToolOutput, error } =
    useChat<AxonMessage>({
      transport,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onError: (chatError) => {
        console.error("Copilot chat error:", chatError);
      },
    });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const executeToolCalls = async () => {
      const lastMessage = messages.at(-1);
      if (!lastMessage) return;

      for (const part of lastMessage.parts) {
        if (
          !isToolUIPart(part) ||
          part.state !== "input-available" ||
          handledToolCalls.current.has(part.toolCallId)
        ) {
          continue;
        }

        handledToolCalls.current.add(part.toolCallId);

        if (part.type === "tool-openWindow") {
          const appId = normalizeAppId(part.input.appId);
          const app = APP_REGISTRY[appId];
          const output = app ? `Opened ${app.title}` : `App ${appId} not found`;

          if (app) openWindow(appId);
          await addToolOutput({
            tool: "openWindow",
            toolCallId: part.toolCallId,
            output,
          });
        } else if (part.type === "tool-closeWindow") {
          const requestedId = part.input.windowId;
          const windowId =
            requestedId === "active" ? activeWindowId : requestedId;
          const output = windowId
            ? `Closed window ${windowId}`
            : "No active window to close";

          if (windowId) closeWindow(windowId);
          await addToolOutput({
            tool: "closeWindow",
            toolCallId: part.toolCallId,
            output,
          });
        } else if (part.type === "tool-changeTheme") {
          const { setting, value } = part.input;
          const isValid =
            setting === "color"
              ? ACCENT_COLORS.some((color) => color.id === value)
              : WALLPAPERS.some((wallpaper) => wallpaper.id === value);
          const output = isValid
            ? `Changed ${setting} to ${value}`
            : `Unknown ${setting} value: ${value}`;

          if (isValid && setting === "color") {
            useSettingsStore.getState().setAccentColor(value);
          } else if (isValid) {
            useSettingsStore.getState().setWallpaper(value);
          }

          await addToolOutput({
            tool: "changeTheme",
            toolCallId: part.toolCallId,
            output,
          });
        }
      }
    };

    void executeToolCalls();
  }, [activeWindowId, addToolOutput, closeWindow, messages, openWindow]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setInput("");
    void sendMessage({ text: message }, { body: { context } });
  };

  return (
    <div className="flex h-full flex-col text-foreground">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
            <Bot className="mb-2 h-12 w-12" />
            <p>How can I help you today?</p>
          </div>
        )}

        {messages.map((message) => {
          const text = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");

          if (!text) return null;

          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2 text-sm ${
                  message.role === "user"
                    ? "bg-[rgb(var(--accent-color))] text-black"
                    : "border border-border/50 bg-muted text-foreground"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-lg bg-muted p-2 text-sm">
              Thinking...
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error.message}</p>}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border/50 bg-muted/20 p-4"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-[rgba(var(--accent-color),0.3)] bg-black/50 px-3 py-2 text-sm text-[rgb(var(--accent-color))] placeholder:text-[rgba(var(--accent-color),0.3)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-color))]"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Copilot..."
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
            className="rounded-md bg-[rgb(var(--accent-color))] p-2 text-black transition-opacity hover:bg-[rgba(var(--accent-color),0.9)] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
