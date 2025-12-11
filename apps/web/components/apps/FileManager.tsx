import React, { useState } from "react";
import { useFileSystem, FileNode } from "@/store/filesystem-store";
import { useWindowStore } from "@/store/window-store";
import { Folder, FileText, ChevronLeft, FileCode, FileIcon, FolderOpen, FolderPlus, RefreshCw, Monitor, Edit2, Download, Trash2, Maximize2 } from "lucide-react";
import { useContextMenuStore } from "@/store/context-menu-store";
import JSZip from "jszip";
import { APP_REGISTRY } from "@/config/app-registry";

export interface FileManagerProps {
    initialPath?: string;
}

export const FileManager = ({ initialPath }: FileManagerProps) => {
    const { files, getFiles, createFolder, createFile, renameNode, deleteFile, restoreFromTrash, permanentlyDeleteFile, emptyTrash } = useFileSystem();
    const { openWindow } = useWindowStore();
    const { openContextMenu } = useContextMenuStore();
    const [currentPathId, setCurrentPathId] = useState(initialPath || "desktop");

    const currentFolder = files[currentPathId] || files["root"];
    const items = getFiles(currentPathId);

    const [isLoading, setIsLoading] = useState(false);

    const handleNavigate = (id: string) => {
        if (files[id]) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentPathId(id);
                setIsLoading(false);
            }, 150); // Artificial delay for "feeling"
        }
    };

    const handleUp = () => {
        const parentId = currentFolder?.parentId;
        if (parentId) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentPathId(parentId);
                setIsLoading(false);
            }, 150);
        }
    };

    const handleOpen = (file: FileNode) => {
        if (file.type === "folder") {
            handleNavigate(file.id);
        } else if (file.appId && APP_REGISTRY[file.appId]) {
            openWindow(file.appId);
        } else {
            const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.tsx', '.css', '.html', '.rs', '.toml'];
            const isTextFile = textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

            if (isTextFile) {
                openWindow("text-editor", {
                    id: `file-${file.id}`,
                    title: file.name,
                    data: { fileId: file.id }
                });
            } else {
                console.warn(`File type not supported for editing: ${file.name}`);
            }
        }
    };

    const handleDownloadZip = async (folderId: string) => {
        const folder = files[folderId];
        if (!folder || folder.type !== 'folder') return;

        const zip = new JSZip();

        const addFilesToZip = (currentId: string, currentPath: string) => {
            const children = getFiles(currentId);
            children.forEach(child => {
                if (child.type === 'folder') {
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

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const menuItems: any[] = [
            { label: 'Refresh', icon: <RefreshCw className="w-4 h-4" />, action: () => setIsLoading(true) },
        ];

        if (currentPathId === 'trash') {
            menuItems.push({
                label: 'Empty Recycle Bin',
                icon: <Trash2 className="w-4 h-4" />,
                action: () => {
                    if (confirm("Are you sure you want to permanently delete all items?")) {
                        emptyTrash();
                    }
                }
            });
        } else {
            menuItems.push(
                {
                    label: 'New Folder',
                    icon: <FolderPlus className="w-4 h-4" />,
                    action: () => createFolder("New Folder", currentPathId)
                },
                {
                    label: 'New Text File',
                    icon: <FileText className="w-4 h-4" />,
                    action: () => createFile("New Text Document.txt", currentPathId)
                }
            );
        }

        openContextMenu(e.clientX, e.clientY, menuItems);
    };

    const handleItemContextMenu = (e: React.MouseEvent, file: FileNode) => {
        e.preventDefault();
        e.stopPropagation();

        const menuItems: any[] = [];

        if (file.isInTrash) {
            menuItems.push(
                {
                    label: 'Restore',
                    icon: <RefreshCw className="w-4 h-4" />,
                    action: () => restoreFromTrash(file.id)
                },
                {
                    label: 'Delete Permanently',
                    icon: <Trash2 className="w-4 h-4" />,
                    danger: true,
                    action: () => {
                        if (confirm(`Permanently delete ${file.name}?`)) {
                            permanentlyDeleteFile(file.id);
                        }
                    }
                }
            );
        } else {
            menuItems.push({ label: 'Open', icon: <Maximize2 className="w-4 h-4" />, action: () => handleOpen(file) });

            if (!file.isProtected) {
                menuItems.push({
                    label: 'Rename',
                    icon: <Edit2 className="w-4 h-4" />,
                    action: () => {
                        const newName = prompt("Enter new name:", file.name);
                        if (newName) renameNode(file.id, newName);
                    }
                });
            }

            if (file.type === 'folder') {
                menuItems.push({
                    label: 'Download as ZIP',
                    icon: <Download className="w-4 h-4" />,
                    action: () => handleDownloadZip(file.id)
                });
            }

            if (!file.isProtected) {
                menuItems.push({
                    label: 'Delete',
                    icon: <Trash2 className="w-4 h-4" />,
                    danger: true,
                    action: () => deleteFile(file.id)
                });
            }
        }

        openContextMenu(e.clientX, e.clientY, menuItems);
    };

    if (!currentFolder) return <div className="p-4 text-white">Error: Folder not found</div>;

    const sidebarItems = [
        { id: 'desktop', label: 'Desktop', icon: Monitor },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'downloads', label: 'Downloads', icon: Folder },
        { id: 'pictures', label: 'Pictures', icon: Folder },
        { id: 'music', label: 'Music', icon: Folder },
        { id: 'trash', label: 'Recycle Bin', icon: Trash2 },
    ];

    return (
        <div className="flex h-full text-white">
            {/* Sidebar */}
            <div className="w-48 bg-black/20 border-r border-white/5 p-2 flex flex-col gap-1 hidden md:flex">
                <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Favorites</div>
                {sidebarItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentPathId === item.id ? 'bg-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))] border border-[rgba(var(--accent-color),0.2)]' : 'text-[rgba(var(--accent-color),0.7)] hover:bg-[rgba(var(--accent-color),0.1)] hover:text-[rgb(var(--accent-color))]'}`}
                    >
                        <item.icon className="h-4 w-4 opacity-70" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <button
                        onClick={handleUp}
                        disabled={!currentFolder.parentId}
                        className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-sm font-medium px-3 py-1.5 bg-black/40 rounded-lg flex-1 flex items-center gap-2 border border-[rgba(var(--accent-color),0.2)]">
                        <Folder className="h-4 w-4 text-[rgb(var(--accent-color))]" />
                        <span className="opacity-40 text-[rgb(var(--accent-color))]">/</span>
                        <span className="text-[rgba(var(--accent-color),0.9)]">{currentFolder.name}</span>
                    </div>
                </div>

                {/* File Grid */}
                <div
                    className={`flex-1 p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 content-start overflow-auto transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                    onContextMenu={handleContextMenu}
                >
                    {items.map(item => (
                        <button
                            key={item.id}
                            onDoubleClick={() => handleOpen(item)}
                            onContextMenu={(e) => handleItemContextMenu(e, item)}
                            className="flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-white/10 group transition-all duration-200 focus:bg-white/10 outline-none hover:scale-105 border border-transparent hover:border-white/5"
                        >
                            <div className="h-14 w-14 flex items-center justify-center group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
                                {item.type === "folder" ? (
                                    <Folder className="h-full w-full fill-[rgba(var(--accent-color),0.2)] text-[rgb(var(--accent-color))]" />
                                ) : (
                                    <FileIcon className="h-12 w-12 text-[rgba(var(--accent-color),0.4)] group-hover:text-[rgba(var(--accent-color),0.8)] transition-colors" />
                                )}
                            </div>
                            <span className="text-xs text-center break-all line-clamp-2 w-full text-[rgba(var(--accent-color),0.6)] group-hover:text-[rgb(var(--accent-color))] font-medium transition-colors">
                                {item.name}
                            </span>
                        </button>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center h-64 text-white/20 gap-4">
                            <FolderOpen className="h-16 w-16 opacity-20" />
                            <span className="text-sm italic">
                                {currentPathId === 'trash' ? 'Recycle Bin is empty' : 'This folder is empty'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
