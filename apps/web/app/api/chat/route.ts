import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { generateMasterPrompt } from '@/lib/master-prompt';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, context } = await req.json();

    // Check for API key and ensure SDK compatibility
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
        process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return new Response("Gemini API Key not found. Please set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env.local", { status: 500 });
    }

    const systemMessage = generateMasterPrompt(context);

    const result = streamText({
        model: google('gemini-2.5-flash'),
        messages,
        system: systemMessage,
        tools: {
            openWindow: tool({
                description: 'Open an application window',
                parameters: z.object({
                    appId: z.string().describe('The ID of the app to open (e.g., "files", "settings", "about", "resume", "projects", "contact", "task-manager")'),
                    title: z.string().describe('The title of the window'),
                }),
                execute: async ({ appId, title }: { appId: string, title: string }) => {
                    return `Opening ${title} (${appId})...`;
                },
            } as any),
            closeWindow: tool({
                description: 'Close a specific window or the active window',
                parameters: z.object({
                    windowId: z.string().describe('The ID of the window to close, or "active" for the currently focused window'),
                }),
                execute: async ({ windowId }: { windowId: string }) => {
                    return `Closing window: ${windowId}...`;
                },
            } as any),
            changeTheme: tool({
                description: 'Change system appearance settings (wallpaper or accent color)',
                parameters: z.object({
                    setting: z.enum(['wallpaper', 'color']).describe('The setting to change'),
                    value: z.string().describe('The value ID (e.g., "blue", "red", "matrix", "neon-sunset")'),
                }),
                execute: async ({ setting, value }: { setting: 'wallpaper' | 'color', value: string }) => {
                    return `Changed ${setting} to ${value}...`;
                },
            } as any),
        },
    });

    return result.toTextStreamResponse();
}
