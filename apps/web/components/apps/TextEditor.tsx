import React, { useState, useEffect } from "react";
import { useFileSystem } from "@/store/filesystem-store";

export interface TextEditorProps {
  fileId?: string;
}

export const TextEditor = ({ fileId }: TextEditorProps) => {
  const { files, updateFileContent } = useFileSystem();
  const file = fileId ? files[fileId] : null;
  const [content, setContent] = useState(file?.content || "");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (file) setContent(file.content || "");
  }, [file]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (fileId) {
        updateFileContent(fileId, content);
        setIsSaved(true);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]/90 text-white/90 font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs select-none">
        <span className="opacity-70">{file ? file.name : "Untitled"}</span>
        <span
          className={
            isSaved ? "text-[rgb(var(--accent-color))]" : "text-yellow-400"
          }
        >
          {isSaved ? "Saved" : "Unsaved"}
        </span>
      </div>
      <textarea
        className="flex-1 w-full h-full bg-transparent p-4 outline-none resize-none text-sm leading-relaxed selection:bg-white/20"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type here..."
        autoFocus
      />
    </div>
  );
};
