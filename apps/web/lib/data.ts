import { Mail, Phone } from "lucide-react";

export const PROFILE = {
  name: "Hrushi Bhanvadiya",
  role: "Computer Science Student | Full-Stack & AI Developer",
  location: "Ahmedabad, Gujarat, India",
  email: "hrushibhanvadiya@gmail.com",
  phone: "+91 87802 23077",
  socials: [
    { name: "Email", url: "mailto:hrushibhanvadiya@gmail.com", icon: Mail },
    { name: "Phone", url: "tel:+918780223077", icon: Phone },
  ],
};

export const EDUCATION = [
  {
    institution: "Nirma University",
    location: "Ahmedabad, Gujarat",
    degree: "B.Tech. in Computer Science and Engineering",
    gpa: "8.73/10",
    period: "July 2023 – Present",
  },
];

export const SKILLS = {
  programmingLanguages: ["Python", "C++", "Java", "SQL", "C"],
  softwareDevelopment: [
    "SDLC",
    "CI/CD",
    "Git",
    "REST APIs",
    "Software Testing",
    "Debugging",
    "QA",
  ],
  webTechnologies: ["React", "Next.js", "TypeScript", "Node.js", "Express.js"],
  databases: ["MongoDB", "Supabase"],
  aiMachineLearning: [
    "Machine Learning",
    "XGBoost",
    "LLMs",
    "RAG",
    "NLP",
    "Embeddings",
    "Prompt Engineering",
    "RLHF",
  ],
};

export const PROJECTS = [
  {
    title: "Axon OS",
    event: "May 2025 – Jul 2025",
    stack: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express.js",
      "WebSockets",
    ],
    description: [
      "Built a browser-based portfolio operating-system simulation with desktop icons, virtual file management, and window-based interaction.",
      "Implemented draggable, resizable application windows and a browser-safe virtual terminal using React, TypeScript, and Zustand.",
      "Developed Node.js and Express services with REST health and telemetry endpoints plus WebSocket workflows for real-time server metrics.",
    ],
  },
  {
    title: "AI HR Interview System",
    event: "HackNUthon-5.0 Participant",
    stack: ["Python", "OpenAI API", "MongoDB", "Svelte"],
    description: [
      "Developed an AI-driven interview platform using GPT-based models for automated candidate evaluation.",
      "Integrated structured feedback and scoring algorithms to enhance recruitment efficiency.",
      "Designed an interactive Svelte frontend for seamless candidate experience.",
    ],
  },
  {
    title: "Dynamic Bandwidth Allocation Simulator",
    stack: ["React.js (TypeScript)", "Tailwind CSS", "MongoDB"],
    description: [
      "Engineered a simulation platform for dynamic bandwidth allocation with multiple algorithms and network types.",
      "Implemented real-time packet tracer and terminal interface for visualizing network data flow.",
      "Developed progress bars and charts to display metrics like fairness and utilization.",
      "Stored simulation logs and configurations in MongoDB for retrospective analysis.",
    ],
  },
  {
    title: "Process Scheduling Algorithms Simulator",
    stack: ["JavaScript", "HTML", "Tailwind CSS", "Flask"],
    description: [
      "Simulated CPU scheduling algorithms (FCFS, SJF, SRTN, HRRN) with dynamic process arrival.",
      "Generated Gantt charts and process logs reflecting CPU time allocation and idle periods.",
      "Enabled live process input during simulation with on-the-fly queue modifications.",
    ],
  },
];

export const EXPERIENCE = [
  {
    role: "Joint Secretary",
    organization: "CSI, Nirma University",
    period: "Aug 2025 – Present",
    description: [
      "Spearheading society initiatives by fostering collaboration among 200+ students and faculty members.",
      "Driving interdisciplinary projects and hackathons, ensuring impactful participation and innovation.",
      "Strengthened team dynamics through mentorship, leadership, and effective coordination across committees.",
    ],
  },
  {
    role: "Core Committee Member",
    organization: "CUBIX’25 and HackNUthon 6.0, Nirma University",
    period: "Jan 2025 - Mar 2025",
    description: [
      "Directed all the graphic design efforts and coordinated event logistics for a major technical events.",
      "Collaborated with peers and sponsors to ensure smooth execution of multiple technical events and hackathons.",
    ],
  },
];

export const ACHIEVEMENTS = [
  { title: "LeetCode", value: "Rating: 1798 (Hrushi2501)" },
  { title: "Codeforces", value: "Rating: 1217 – Pupil (Hrushi2501)" },
  {
    title: "NSO 2023",
    value: "International Rank - 81 (Science Olympiad Foundation)",
  },
];
