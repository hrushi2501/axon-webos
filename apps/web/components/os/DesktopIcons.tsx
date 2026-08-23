import React from "react";
import { useWindowStore } from "@/store/window-store";
import { useSound } from "@/components/providers/sound-context";
import { useFileSystem, type FileNode } from "@/store/filesystem-store";
import {
  useContextMenuStore,
  type ContextMenuItem,
} from "@/store/context-menu-store";
import {
  Monitor,
  Folder,
  FileText,
  FolderGit2,
  Activity,
  Maximize2,
  Edit2,
  Download,
  Trash2,
} from "lucide-react";
import { APP_REGISTRY } from "@/config/app-registry";
import JSZip from "jszip";

interface DesktopIconsProps {
  isRefreshing: boolean;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ isRefreshing }) => {
  const { openWindow } = useWindowStore();
  const { playSound } = useSound();
  const { getFiles, renameNode, deleteFile, files } = useFileSystem();
  const { openContextMenu } = useContextMenuStore();

  const desktopFiles = getFiles("desktop");

  const handleDownloadZip = async (folderId: string) => {
    const folder = files[folderId];
    if (!folder || folder.type !== "folder") return;

    const zip = new JSZip();

    const addFilesToZip = (currentId: string, currentPath: string) => {
      const children = getFiles(currentId);
      children.forEach((child) => {
        if (child.type === "folder") {
          addFilesToZip(child.id, `${currentPath}${child.name}/`);
        } else {
          zip.file(`${currentPath}${child.name}`, child.content || "");
        }
      });
    };

    addFilesToZip(folderId, "");

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenFile = (fileId: string) => {
    const file = desktopFiles.find((f) => f.id === fileId);
    if (!file) return;

    if (file.type === "folder") {
      openWindow("files", { data: { initialPath: file.id } });
    } else if (file.appId && APP_REGISTRY[file.appId]) {
      openWindow(file.appId);
    } else {
      // Default file opener (Text Editor)
      openWindow("text-editor", {
        id: `file-${file.id}`,
        title: file.name,
        data: { fileId: file.id },
      });
    }
  };

  const handleIconContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const file = files[fileId];
    if (!file) return;

    const items: ContextMenuItem[] = [
      {
        label: "Open",
        icon: <Maximize2 className="w-4 h-4" />,
        action: () => handleOpenFile(fileId),
      },
      {
        label: "Rename",
        icon: <Edit2 className="w-4 h-4" />,
        action: () => {
          const newName = prompt("Enter new name:", file.name);
          if (newName) renameNode(fileId, newName);
        },
      },
    ];

    if (file.type === "folder") {
      items.push({
        label: "Download as ZIP",
        icon: <Download className="w-4 h-4" />,
        action: () => handleDownloadZip(fileId),
      });
    }

    if (!file.isProtected) {
      items.push({
        label: "Delete",
        icon: <Trash2 className="w-4 h-4" />,
        danger: true,
        action: () => deleteFile(fileId),
      });
    }

    openContextMenu(e.clientX, e.clientY, items);
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === "folder")
      return (
        <Folder className="h-full w-full fill-[rgba(var(--accent-color),0.2)] stroke-[rgb(var(--accent-color))] stroke-[1.5px]" />
      );
    if (file.appId === "resume")
      return (
        <FileText className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px] stroke-[rgb(var(--accent-color))]" />
      );
    if (file.appId === "projects")
      return (
        <FolderGit2 className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px] stroke-[rgb(var(--accent-color))]" />
      );
    if (file.appId === "task-manager")
      return (
        <Activity className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px] stroke-[rgb(var(--accent-color))]" />
      );
    return (
      <FileText className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px] stroke-[rgb(var(--accent-color))]" />
    );
  };

  return (
    <div
      className={`absolute inset-0 z-5 p-6 flex flex-col flex-wrap content-start gap-4 pointer-events-none transition-opacity duration-200 ${isRefreshing ? "opacity-0" : "opacity-100"}`}
    >
      {/* My PC (Always present) */}
      <button
        onClick={() => openWindow("files")}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu(e.clientX, e.clientY, [
            {
              label: "Open",
              icon: <Maximize2 className="w-4 h-4" />,
              action: () => openWindow("files"),
            },
          ]);
        }}
        onMouseEnter={() => playSound("hover")}
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[rgba(var(--accent-color),0.1)] group transition-all duration-200 w-24 pointer-events-auto border border-transparent hover:border-[rgba(var(--accent-color),0.2)] hover:backdrop-blur-sm active:scale-95"
      >
        <div className="h-14 w-14 flex items-center justify-center text-[rgb(var(--accent-color))] group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
          <Monitor className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px]" />
        </div>
        <span className="text-xs text-center text-[rgb(var(--accent-color))] font-medium drop-shadow-md tracking-wide group-hover:text-[rgb(var(--accent-color))] transition-colors line-clamp-2 neon-text">
          My PC
        </span>
      </button>

      {/* Recycle Bin */}
      <button
        onClick={() => openWindow("files", { data: { initialPath: "trash" } })}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu(e.clientX, e.clientY, [
            {
              label: "Open",
              icon: <Maximize2 className="w-4 h-4" />,
              action: () =>
                openWindow("files", { data: { initialPath: "trash" } }),
            },
            {
              label: "Empty Recycle Bin",
              icon: <Trash2 className="w-4 h-4" />,
              action: () => {
                if (confirm("Empty Trash?"))
                  useFileSystem.getState().emptyTrash();
              },
            },
          ]);
        }}
        onMouseEnter={() => playSound("hover")}
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[rgba(var(--accent-color),0.1)] group transition-all duration-200 w-24 pointer-events-auto border border-transparent hover:border-[rgba(var(--accent-color),0.2)] hover:backdrop-blur-sm active:scale-95"
      >
        <div className="h-14 w-14 flex items-center justify-center text-[rgb(var(--accent-color))] group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
          <Trash2 className="h-full w-full fill-[rgba(var(--accent-color),0.05)] stroke-[1.5px]" />
        </div>
        <span className="text-xs text-center text-[rgb(var(--accent-color))] font-medium drop-shadow-md tracking-wide group-hover:text-[rgb(var(--accent-color))] transition-colors line-clamp-2 neon-text">
          Recycle Bin
        </span>
      </button>

      {/* Dynamic Files */}
      {desktopFiles.map((file) => (
        <button
          key={file.id}
          onClick={() => handleOpenFile(file.id)}
          onContextMenu={(e) => handleIconContextMenu(e, file.id)}
          onMouseEnter={() => playSound("hover")}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[rgba(var(--accent-color),0.1)] group transition-all duration-200 w-24 pointer-events-auto border border-transparent hover:border-[rgba(var(--accent-color),0.2)] hover:backdrop-blur-sm active:scale-95"
        >
          <div className="h-14 w-14 flex items-center justify-center text-[rgb(var(--accent-color))] group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
            {getFileIcon(file)}
          </div>
          <span className="text-xs text-center text-[rgb(var(--accent-color))] font-medium drop-shadow-md tracking-wide group-hover:text-[rgb(var(--accent-color))] transition-colors line-clamp-2 neon-text">
            {file.name}
          </span>
        </button>
      ))}
    </div>
  );
};
