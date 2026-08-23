import React from "react";
import { PROFILE } from "@/lib/data";
import { User, MapPin, Mail, Phone } from "lucide-react";

export const About = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--accent-color))] to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-32 h-32 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden">
          <User className="w-16 h-16 text-white/50" />
          {/* Placeholder for user image if they add one later */}
          {/* <img src="/avatar.jpg" alt="Profile" className="w-full h-full object-cover" /> */}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight neon-text">
          {PROFILE.name}
        </h1>
        <p className="text-lg text-white/60 font-light">{PROFILE.role}</p>
      </div>

      <div className="flex flex-col items-center gap-3 text-sm text-white/50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{PROFILE.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <a
            href={`mailto:${PROFILE.email}`}
            className="hover:text-[rgb(var(--accent-color))] transition-colors"
          >
            {PROFILE.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <a
            href={`tel:${PROFILE.phone}`}
            className="hover:text-[rgb(var(--accent-color))] transition-colors"
          >
            {PROFILE.phone}
          </a>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        {PROFILE.socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-[rgb(var(--accent-color))] transition-all border border-white/5 hover:border-[rgba(var(--accent-color),0.5)]"
          >
            <social.icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </div>
  );
};
