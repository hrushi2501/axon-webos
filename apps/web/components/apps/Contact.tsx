import React, { useState } from "react";
import { PROFILE } from "@/lib/data";
import { Mail, Phone, Copy, Check, Send } from "lucide-react";

export const Contact = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [formState, setFormState] = useState<"idle" | "opened">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Portfolio message from ${formData.name}`,
    );
    const body = encodeURIComponent(
      `${formData.message}\n\nReply to: ${formData.email}`,
    );

    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    setFormState("opened");
    setTimeout(() => setFormState("idle"), 3000);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 p-6 overflow-y-auto custom-scrollbar">
      {/* Contact Info Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 neon-text">
            Get In Touch
          </h2>
          <p className="text-white/50 max-w-sm mx-auto">
            I&apos;m currently looking for new opportunities. Whether you have a
            question or just want to say hi, I&apos;ll try my best to get back
            to you!
          </p>
        </div>

        <div className="grid gap-4 w-full max-w-sm">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[rgba(var(--accent-color),0.5)] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[rgba(var(--accent-color),0.1)] text-[rgb(var(--accent-color))]">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-white font-medium">{PROFILE.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(PROFILE.email, "email")}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              {copied === "email" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[rgba(var(--accent-color),0.5)] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[rgba(var(--accent-color),0.1)] text-[rgb(var(--accent-color))]">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-white font-medium">{PROFILE.phone}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(PROFILE.phone, "phone")}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              {copied === "phone" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Compose a Message
          </h3>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-white/60">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[rgba(var(--accent-color),0.5)] transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-white/60">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[rgba(var(--accent-color),0.5)] transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm text-white/60">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[rgba(var(--accent-color),0.5)] transition-colors resize-none"
              placeholder="Your message here..."
            />
          </div>

          <button
            type="submit"
            disabled={formState === "opened"}
            className="w-full py-2.5 rounded-lg bg-[rgba(var(--accent-color),0.1)] text-[rgb(var(--accent-color))] font-medium hover:bg-[rgba(var(--accent-color),0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {formState === "idle" && (
              <>
                Open Email Draft <Send className="w-4 h-4" />
              </>
            )}
            {formState === "opened" && (
              <>
                Draft Opened <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
