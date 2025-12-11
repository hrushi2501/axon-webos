import React from "react";
import { PROJECTS } from "@/lib/data";
import { FolderGit2, ExternalLink } from "lucide-react";

export const Projects = () => {
    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROJECTS.map((project, idx) => (
                    <div
                        key={idx}
                        className="group flex flex-col h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[rgba(var(--accent-color),0.5)] hover:shadow-[0_0_20px_rgba(var(--accent-color),0.2)] transition-all duration-300"
                    >
                        {/* Header */}
                        <div className="p-4 bg-white/5 border-b border-white/5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="p-2 rounded-lg bg-[rgba(var(--accent-color),0.1)] text-[rgb(var(--accent-color))]">
                                    <FolderGit2 className="w-5 h-5" />
                                </div>
                                {project.event && (
                                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/10 text-white/60">
                                        {project.event.split(' ')[0]}
                                    </span>
                                )}
                            </div>
                            <h3 className="mt-3 text-lg font-bold text-white group-hover:text-[rgb(var(--accent-color))] transition-colors">
                                {project.title}
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2">
                                {project.stack.map(tech => (
                                    <span key={tech} className="text-xs px-2 py-1 rounded bg-black/40 text-white/50 border border-white/5">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <ul className="space-y-2 text-sm text-white/60 flex-1">
                                {project.description.map((desc, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-[rgb(var(--accent-color))] mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                                        <span>{desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                View Details <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
