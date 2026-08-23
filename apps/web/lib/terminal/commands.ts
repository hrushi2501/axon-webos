import { APP_REGISTRY } from "@/config/app-registry";
import { CommandHandler } from "./types";
import { getFullPath, resolvePath } from "./utils";

const cmdOpen: CommandHandler = ({
  args,
  system: { openWindow },
  currentPathId,
  fileSystem: { files },
}) => {
  if (args.length === 0)
    return {
      output: "usage: open [app_name_or_file]",
      color: "text-yellow-400",
    };

  const target = args[0] || "";
  if (!target)
    return {
      output: "usage: open [app_name_or_file]",
      color: "text-yellow-400",
    };

  const targetLower = target.toLowerCase();

  // Check if it's an app registry key
  const app = APP_REGISTRY[targetLower];
  if (app) {
    openWindow(targetLower);
    return { output: `Opening ${app.title}...` };
  }

  // Check if it's a file in current dir
  const resolvedId = resolvePath(currentPathId, target, files);
  if (resolvedId) {
    const node = files[resolvedId];
    if (!node) {
      return {
        output: `open: ${target}: Application or file not found`,
        color: "text-red-400",
      };
    }

    if (node.type === "file") {
      // Logic to open file (similar to FileManager)
      if (node.appId && APP_REGISTRY[node.appId]) {
        openWindow(node.appId);
        return { output: `Opening ${node.name}...` };
      }
      // Text files -> Editor?
      if (node.name.endsWith(".txt") || node.name.endsWith(".md")) {
        openWindow("text-editor", {
          id: `file-${node.id}`,
          title: node.name,
          data: { fileId: node.id },
        });
        return { output: `Opening ${node.name} in Text Editor...` };
      }

      return { output: `No default application for ${node.name}` };
    }
  }

  return {
    output: `open: ${target}: Application or file not found`,
    color: "text-red-400",
  };
};

export const commands: Record<string, CommandHandler> = {
  help: () => ({
    output: [
      "Available commands:",
      "  ls            List files",
      "  cd [dir]      Change directory",
      "  pwd           Print working directory",
      "  mkdir [name]  Create directory",
      "  touch [name]  Create file",
      "  rm [name]     Remove file/directory",
      "  cat [file]    Read file content",
      "  open [app]    Open app/file",
      "  start [app]   Alias for open",
      "  clear         Clear terminal",
      "  whoami        Display user",
      "  date          Display date",
      "  echo [text]   Print text",
      "  history       Show command history",
      "  reboot        Restart system (reload)",
    ],
  }),

  ls: ({ currentPathId, fileSystem: { getFiles } }) => {
    // Note: removed unused 'files' from distructure
    const children = getFiles(currentPathId);
    if (children.length === 0) return { output: "" };

    const formatted = children.map((f) => {
      return f.type === "folder" ? `${f.name}/` : f.name;
    });

    return { output: formatted.join("  ") };
  },

  cd: ({ args, currentPathId, fileSystem: { files } }) => {
    if (args.length === 0) return { newPathId: "root" };

    const targetPath = args[0];
    if (!targetPath) return { newPathId: "root" };

    const newPathId = resolvePath(currentPathId, targetPath, files);

    if (!newPathId) {
      return {
        output: `cd: ${targetPath}: No such file or directory`,
        color: "text-red-400",
      };
    }

    if (files[newPathId]?.type !== "folder") {
      return {
        output: `cd: ${targetPath}: Not a directory`,
        color: "text-red-400",
      };
    }

    return { newPathId };
  },

  pwd: ({ currentPathId, fileSystem: { files } }) => ({
    output: getFullPath(currentPathId, files),
  }),

  mkdir: ({ args, currentPathId, fileSystem: { createFolder } }) => {
    const name = args[0];
    if (!name)
      return { output: "usage: mkdir [name]", color: "text-yellow-400" };
    createFolder(name, currentPathId);
    return { output: "" };
  },

  touch: ({ args, currentPathId, fileSystem: { createFile } }) => {
    const name = args[0];
    if (!name)
      return { output: "usage: touch [name]", color: "text-yellow-400" };
    createFile(name, currentPathId);
    return { output: "" };
  },

  rm: ({ args, currentPathId, fileSystem: { files, deleteFile } }) => {
    const targetName = args[0];
    if (!targetName)
      return { output: "usage: rm [name]", color: "text-yellow-400" };

    const resolvedId = resolvePath(currentPathId, targetName, files);

    if (!resolvedId) {
      return {
        output: `rm: cannot remove '${targetName}': No such file or directory`,
        color: "text-red-400",
      };
    }

    const node = files[resolvedId];
    if (!node) {
      return {
        output: `rm: cannot remove '${targetName}': No such file or directory`,
        color: "text-red-400",
      };
    }

    if (node.isProtected) {
      return {
        output: `rm: cannot remove '${targetName}': Permission denied`,
        color: "text-red-400",
      };
    }

    deleteFile(resolvedId);
    return { output: "" };
  },

  cat: ({ args, currentPathId, fileSystem: { files } }) => {
    const target = args[0];
    if (!target)
      return { output: "usage: cat [file]", color: "text-yellow-400" };

    const resolvedId = resolvePath(currentPathId, target, files);

    if (!resolvedId) {
      return {
        output: `cat: ${target}: No such file or directory`,
        color: "text-red-400",
      };
    }

    const node = files[resolvedId];
    if (!node) {
      return {
        output: `cat: ${target}: No such file or directory`,
        color: "text-red-400",
      };
    }

    if (node.type === "folder") {
      return {
        output: `cat: ${target}: Is a directory`,
        color: "text-red-400",
      };
    }

    return { output: node.content || "(empty or binary file)" };
  },

  whoami: () => ({ output: "guest" }),

  date: () => ({ output: new Date().toString() }),

  echo: ({ args }) => ({ output: args.join(" ") }),

  history: ({ system: { getCommandHistory } }) => ({
    output: getCommandHistory().map(
      (command, index) => `${index + 1}  ${command}`,
    ),
  }),

  clear: ({ system: { clear } }) => {
    clear();
    return;
  },

  open: cmdOpen,
  start: cmdOpen,

  reboot: () => {
    window.location.reload();
    return { output: "Rebooting..." };
  },
};
