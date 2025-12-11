export type FileType = "folder" | "file";

export interface FileSystemItem {
    id: string;
    name: string;
    type: FileType;
    content?: string; // For files
    children?: FileSystemItem[]; // For folders
}

export const fileSystem: FileSystemItem[] = [
    {
        id: "root",
        name: "Root",
        type: "folder",
        children: [
            {
                id: "projects",
                name: "Projects",
                type: "folder",
                children: [
                    { id: "p1", name: "Portfolio.md", type: "file", content: "# Portfolio\nThis is my portfolio." },
                    { id: "p2", name: "WebOS.md", type: "file", content: "# WebOS\nArchitecture details." },
                ],
            },
            {
                id: "about",
                name: "About",
                type: "folder",
                children: [
                    { id: "resume", name: "Resume.pdf", type: "file", content: "PDF Content Placeholder" },
                    { id: "bio", name: "Bio.txt", type: "file", content: "I am a full stack developer." },
                ],
            },
            {
                id: "skills",
                name: "Skills",
                type: "folder",
                children: [
                    { id: "frontend", name: "Frontend.md", type: "file", content: "- React\n- Next.js\n- Tailwind" },
                    { id: "backend", name: "Backend.md", type: "file", content: "- Rust\n- Node.js\n- Postgres" },
                ]
            },
            { id: "contact", name: "Contact.txt", type: "file", content: "Email: me@example.com" },
        ],
    },
];
