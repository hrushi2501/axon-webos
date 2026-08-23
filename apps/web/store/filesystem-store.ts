import { create } from "zustand";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string; // For text files
  appId?: string; // App to open this file with
  children?: string[]; // IDs of children if folder
  parentId: string | null;
  isProtected?: boolean; // If true, cannot be deleted
  isInTrash?: boolean;
  originalParentId?: string;
}

interface FileSystemStore {
  files: Record<string, FileNode>;
  rootId: string;
  currentPath: string;
  createFile: (name: string, parentId: string, appId?: string) => void;
  createFolder: (name: string, parentId: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameNode: (id: string, newName: string) => void;
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  permanentlyDeleteFile: (id: string) => void;
  deleteFile: (id: string) => void;
  getFiles: (parentId: string) => FileNode[];
}

const INITIAL_FILES: Record<string, FileNode> = {
  root: {
    id: "root",
    name: "My PC",
    type: "folder",
    children: ["desktop", "documents", "downloads", "pictures", "music"],
    parentId: null,
    isProtected: true,
  },
  desktop: {
    id: "desktop",
    name: "Desktop",
    type: "folder",
    children: ["resume-pdf", "projects-folder", "task-manager"],
    parentId: "root",
    isProtected: true,
  },
  documents: {
    id: "documents",
    name: "Documents",
    type: "folder",
    children: ["notes-txt"],
    parentId: "root",
    isProtected: true,
  },
  downloads: {
    id: "downloads",
    name: "Downloads",
    type: "folder",
    children: [],
    parentId: "root",
    isProtected: true,
  },
  pictures: {
    id: "pictures",
    name: "Pictures",
    type: "folder",
    children: ["wallpaper-png"],
    parentId: "root",
    isProtected: true,
  },
  music: {
    id: "music",
    name: "Music",
    type: "folder",
    children: [],
    parentId: "root",
    isProtected: true,
  },
  trash: {
    id: "trash",
    name: "Recycle Bin",
    type: "folder",
    children: [],
    parentId: null,
    isProtected: true,
  },

  "resume-pdf": {
    id: "resume-pdf",
    name: "Resume.pdf",
    type: "file",
    appId: "resume",
    parentId: "desktop",
    isProtected: true,
  },
  "projects-folder": {
    id: "projects-folder",
    name: "Projects",
    type: "folder",
    children: ["project-1"],
    parentId: "desktop",
    isProtected: true,
  },
  "project-1": {
    id: "project-1",
    name: "Portfolio.url",
    type: "file",
    appId: "projects",
    parentId: "projects-folder",
    isProtected: true,
  },
  "notes-txt": {
    id: "notes-txt",
    name: "Notes.txt",
    type: "file",
    content: "Meeting notes...",
    parentId: "documents",
  },
  "wallpaper-png": {
    id: "wallpaper-png",
    name: "Wallpaper.png",
    type: "file",
    parentId: "pictures",
    isProtected: true,
  },
  "task-manager": {
    id: "task-manager",
    name: "Task Manager",
    type: "file",
    appId: "task-manager",
    parentId: "desktop",
    isProtected: true,
  },
};

const collectDescendantIds = (
  files: Record<string, FileNode>,
  rootId: string,
): string[] => {
  const visited = new Set<string>();

  const visit = (id: string) => {
    if (visited.has(id) || !files[id]) return;

    visited.add(id);
    files[id]?.children?.forEach(visit);
  };

  visit(rootId);
  return [...visited];
};

export const useFileSystem = create<FileSystemStore>((set, get) => ({
  files: INITIAL_FILES,
  rootId: "root",
  currentPath: "root",

  createFile: (name: string, parentId: string, appId?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newFile: FileNode = { id, name, type: "file", parentId, appId };

    set((state) => {
      const parent = state.files[parentId];
      if (!parent || parent.type !== "folder") return state;

      return {
        files: {
          ...state.files,
          [id]: newFile,
          [parentId]: { ...parent, children: [...(parent.children || []), id] },
        },
      };
    });
  },

  createFolder: (name: string, parentId: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newFolder: FileNode = {
      id,
      name,
      type: "folder",
      parentId,
      children: [],
    };

    set((state) => {
      const parent = state.files[parentId];
      if (!parent || parent.type !== "folder") return state;

      return {
        files: {
          ...state.files,
          [id]: newFolder,
          [parentId]: { ...parent, children: [...(parent.children || []), id] },
        },
      };
    });
  },

  updateFileContent: (id: string, content: string) => {
    set((state) => {
      const file = state.files[id];
      if (!file || file.type !== "file") return state;

      return {
        files: {
          ...state.files,
          [id]: { ...file, content },
        },
      };
    });
  },

  renameNode: (id: string, newName: string) => {
    set((state) => {
      const file = state.files[id];
      if (!file) return state;

      return {
        files: {
          ...state.files,
          [id]: { ...file, name: newName },
        },
      };
    });
  },

  deleteFile: (id: string) => {
    get().moveToTrash(id);
  },

  moveToTrash: (id) => {
    const file = get().files[id];
    if (!file || file.isProtected || !file.parentId) return;

    const previousParentId = file.parentId;

    set((state) => {
      const parent = state.files[previousParentId];
      const trash = state.files["trash"];

      if (!parent || !trash) return state;

      const updatedFiles = { ...state.files };
      collectDescendantIds(state.files, id).forEach((nodeId) => {
        const node = state.files[nodeId];
        if (!node) return;

        updatedFiles[nodeId] = {
          ...node,
          isInTrash: true,
          originalParentId:
            nodeId === id ? previousParentId : node.originalParentId,
        };
      });

      return {
        files: {
          ...updatedFiles,
          // Remove from parent
          [previousParentId]: {
            ...parent,
            children: parent.children?.filter((c) => c !== id),
          },
          // Add to trash
          ["trash"]: { ...trash, children: [...(trash.children || []), id] },
          // Move the root folder or file into Trash while keeping any nested structure intact.
          [id]: { ...updatedFiles[id]!, parentId: "trash" },
        },
      };
    });
  },

  restoreFromTrash: (id) => {
    set((state) => {
      const file = state.files[id];
      if (!file || !file.isInTrash) return state;

      const trash = state.files["trash"];

      // Try to restore to original parent, otherwise Desktop, otherwise Root
      let targetFolderId = file.originalParentId || "desktop";
      if (!state.files[targetFolderId]) {
        targetFolderId = "root";
      }

      const targetFolder = state.files[targetFolderId];

      if (!trash || !targetFolder) return state;

      const updatedFiles = { ...state.files };
      collectDescendantIds(state.files, id).forEach((nodeId) => {
        const node = state.files[nodeId];
        if (!node) return;

        updatedFiles[nodeId] = {
          ...node,
          isInTrash: false,
          originalParentId: undefined,
        };
      });

      return {
        files: {
          ...updatedFiles,
          // Remove from trash
          ["trash"]: {
            ...trash,
            children: trash.children?.filter((c) => c !== id),
          },
          // Add to target
          [targetFolderId]: {
            ...targetFolder,
            children: [...(targetFolder.children || []), id],
          },
          // Update file
          [id]: { ...updatedFiles[id]!, parentId: targetFolderId },
        },
      };
    });
  },

  permanentlyDeleteFile: (id) => {
    set((state) => {
      const file = state.files[id];
      if (!file || !file.isInTrash) return state;

      const newFiles = { ...state.files };
      collectDescendantIds(state.files, id).forEach(
        (nodeId) => delete newFiles[nodeId],
      );

      const parent = file.parentId ? state.files[file.parentId] : undefined;
      if (parent) {
        newFiles[parent.id] = {
          ...parent,
          children: parent.children?.filter((childId) => childId !== id),
        };
      }

      return {
        files: newFiles,
      };
    });
  },

  emptyTrash: () => {
    set((state) => {
      const trash = state.files["trash"];
      if (!trash || !trash.children) return state;

      const newFiles = { ...state.files };
      trash.children.forEach((childId) => {
        collectDescendantIds(state.files, childId).forEach(
          (nodeId) => delete newFiles[nodeId],
        );
      });

      return {
        files: {
          ...newFiles,
          ["trash"]: { ...trash, children: [] },
        },
      };
    });
  },

  getFiles: (parentId: string) => {
    const state = get();
    const parent = state.files[parentId];
    if (!parent || !parent.children) return [];
    return parent.children
      .map((id) => state.files[id])
      .filter((f): f is FileNode => !!f);
  },
}));
