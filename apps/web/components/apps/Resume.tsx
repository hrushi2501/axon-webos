import React from "react";
import { EDUCATION, SKILLS, EXPERIENCE, ACHIEVEMENTS } from "@/lib/data";
import { GraduationCap, Code, Briefcase, Trophy } from "lucide-react";

const skillGroups = [
  { title: "Programming Languages", values: SKILLS.programmingLanguages },
  { title: "Software Development", values: SKILLS.softwareDevelopment },
  { title: "Web Technologies", values: SKILLS.webTechnologies },
  { title: "Databases", values: SKILLS.databases },
  { title: "AI / Machine Learning", values: SKILLS.aiMachineLearning },
];

export const Resume = () => {
  return (
    <div className="h-full p-6 space-y-8 overflow-y-auto custom-scrollbar">
      {/* Education Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[rgb(var(--accent-color))] border-b border-white/10 pb-2">
          <GraduationCap className="w-5 h-5" />
          <h2 className="text-xl font-semibold tracking-wide">Education</h2>
        </div>
        <div className="grid gap-4">
          {EDUCATION.map((edu, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white">{edu.institution}</h3>
                <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                  {edu.period}
                </span>
              </div>
              <p className="text-white/80">{edu.degree}</p>
              <div className="flex justify-between mt-2 text-sm text-white/50">
                <span>{edu.location}</span>
                <span className="text-[rgb(var(--accent-color))]">
                  CGPA: {edu.gpa}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[rgb(var(--accent-color))] border-b border-white/10 pb-2">
          <Code className="w-5 h-5" />
          <h2 className="text-xl font-semibold tracking-wide">Skills</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.values.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs rounded bg-[rgba(var(--accent-color),0.1)] text-[rgb(var(--accent-color))] border border-[rgba(var(--accent-color),0.2)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[rgb(var(--accent-color))] border-b border-white/10 pb-2">
          <Briefcase className="w-5 h-5" />
          <h2 className="text-xl font-semibold tracking-wide">Experience</h2>
        </div>
        <div className="space-y-6">
          {EXPERIENCE.map((exp, idx) => (
            <div key={idx} className="relative pl-6 border-l border-white/10">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[rgb(var(--accent-color))]" />
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white">{exp.role}</h3>
                <span className="text-xs text-white/50">{exp.period}</span>
              </div>
              <p className="text-sm text-white/70 mb-2">{exp.organization}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[rgb(var(--accent-color))] border-b border-white/10 pb-2">
          <Trophy className="w-5 h-5" />
          <h2 className="text-xl font-semibold tracking-wide">Achievements</h2>
        </div>
        <div className="grid gap-3">
          {ACHIEVEMENTS.map((ach, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5"
            >
              <span className="font-medium text-white">{ach.title}</span>
              <span className="text-sm text-white/60">{ach.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
