import { FileNode } from "@/store/filesystem-store";

export const resolvePath = (
  currentPathId: string,
  pathStr: string,
  files: Record<string, FileNode>,
): string | null => {
  if (!pathStr || pathStr === ".") return currentPathId;
  if (pathStr === "/") return "root";
  if (pathStr === "~") return "desktop"; // Alias ~ to desktop for convenience

  let startNodeId = currentPathId;

  // Handle absolute paths
  if (pathStr.startsWith("/")) {
    startNodeId = "root";
    pathStr = pathStr.substring(1);
  }

  const parts = pathStr.split("/").filter((p) => p && p !== ".");
  let currentNodeId = startNodeId;

  for (const part of parts) {
    if (part === "..") {
      const parent = files[currentNodeId]?.parentId;
      if (parent) {
        currentNodeId = parent;
      }
      // If no parent (root), stay at root
      continue;
    }

    const currentNode = files[currentNodeId];
    if (!currentNode || currentNode.type !== "folder") return null;

    const children = currentNode.children || [];
    const childId = children.find((id) => files[id]?.name === part);

    if (childId) {
      currentNodeId = childId;
    } else {
      return null;
    }
  }

  return currentNodeId;
};

export const getFullPath = (
  nodeId: string,
  files: Record<string, FileNode>,
): string => {
  const pathParts: string[] = [];
  let currentId: string | null = nodeId;

  // Safety counter to prevent infinite loops
  let depth = 0;
  const MAX_DEPTH = 50;

  while (currentId && files[currentId] && depth < MAX_DEPTH) {
    const node: FileNode = files[currentId]!;
    if (node.id === "root") {
      // We reached root
      return "/" + pathParts.join("/");
    }

    // Unshift to add to front
    pathParts.unshift(node.name);
    currentId = node.parentId;
    depth++;
  }

  return "/" + pathParts.join("/");
};
