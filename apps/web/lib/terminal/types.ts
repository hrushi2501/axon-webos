export type TerminalColor =
    | 'text-gray-300'
    | 'text-red-400'
    | 'text-green-400'
    | 'text-yellow-400'
    | 'text-blue-400'
    | 'text-purple-400'
    | 'text-cyan-400'
    | 'text-white';

export interface TerminalOutput {
    id: string;
    text: string;
    color?: TerminalColor;
    isCommand?: boolean;
    path?: string;
}

export interface CommandContext {
    args: string[];
    currentPathId: string;
    fileSystem: {
        files: Record<string, any>;
        getFiles: (id: string) => any[];
        createFile: (name: string, parentId: string) => void;
        createFolder: (name: string, parentId: string) => void;
        deleteFile: (id: string) => void;
        renameNode: (id: string, name: string) => void;
    };
    system: {
        openWindow: (id: string, data?: any) => void;
        clear: () => void;
        setHistory: (cb: (prev: TerminalOutput[]) => TerminalOutput[]) => void;
    };
}

export interface CommandResult {
    output?: string | string[];
    newPathId?: string;
    color?: TerminalColor;
}

export type CommandHandler = (ctx: CommandContext) => Promise<CommandResult | void> | CommandResult | void;
