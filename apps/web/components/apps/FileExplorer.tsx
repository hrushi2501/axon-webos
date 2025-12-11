import React, { useState } from "react";
import { fileSystem, FileSystemItem } from "@/lib/filesystem";
import { Folder, FileText, ArrowLeft } from "lucide-react";

export const FileExplorer = () => {
    const [currentPath, setCurrentPath] = useState<FileSystemItem[]>([]);
    const rootFolder = fileSystem[0];
    const currentFolder = currentPath.length > 0 ? currentPath[currentPath.length - 1] : rootFolder;

    const handleNavigate = (item: FileSystemItem) => {
        if (item.type === "folder") {
            setCurrentPath([...currentPath, item]);
        } else {
            alert(`Opening file: ${item.name}`);
        }
    };

    const handleBack = () => {
        if (currentPath.length > 0) {
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    return (
        <div className="flex flex-col h-full text-foreground">
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-border/50 p-2 bg-muted/20">
                <button
                    onClick={handleBack}
                    disabled={currentPath.length === 0}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-mono opacity-70">
                    ~/
                    {currentPath.map((p) => p.name).join("/")}
                </div>
            </div>

            {/* Grid View */}
            <div className="flex-1 p-4 grid grid-cols-4 gap-4 content-start overflow-auto">
                {currentFolder?.children?.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigate(item)}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                        {item.type === "folder" ? (
                            <Folder className="h-12 w-12 text-yellow-400 fill-yellow-400/20 group-hover:scale-110 transition-transform" />
                        ) : (
                            <FileText className="h-12 w-12 text-blue-400 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-xs text-center truncate w-full">{item.name}</span>
                    </button>
                ))}
                {(!currentFolder?.children || currentFolder.children.length === 0) && (
                    <div className="col-span-4 text-center text-muted-foreground text-sm italic">
                        Empty folder
                    </div>
                )}
            </div>
        </div>
    );
};
