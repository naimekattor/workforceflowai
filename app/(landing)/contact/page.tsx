"use client";

import axios from "axios";
import React, { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { showError, showSuccess } from "@/lib/ui/alerts";

type SupportEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SupportEmailError = {
  detail?: string;
  message?: string;
  name?: string[];
  email?: string[];
  subject?: string[];
};

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
}

function getSupportEmailError(error: unknown): string {
  if (axios.isAxiosError<SupportEmailError>(error)) {
    const data = error.response?.data;

    return (
      firstMessage(data?.name) ||
      firstMessage(data?.email) ||
      firstMessage(data?.subject) ||
      firstMessage(data?.message) ||
      firstMessage(data?.detail) ||
      "Failed to send your message. Please try again."
    );
  }

  return "Failed to send your message. Please try again.";
}

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: SupportEmailPayload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setIsSubmitting(true);

    try {
      await apiClient.post<SupportEmailPayload>("/api/support/email/", payload);
      form.reset();
      await showSuccess("Your message has been sent to support.");
    } catch (error) {
      await showError(getSupportEmailError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-white py-32 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Contact Us
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Have questions about workforceflow ai? Reach out and our team will help you
            choose the best setup for your business.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Contact Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Get in touch</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="text-cyan-500">
                  <Mail size={20} />
                </div>
                <a href="mailto:support@revboostai.com" className="hover:text-cyan-600 transition-colors">
                  info@revboostai.net
                </a>
              </div>

              

              <div className="flex items-center gap-4 text-slate-600">
                <div className="text-cyan-500">
                  <MapPin size={20} />
                </div>
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Message our team</h3>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <input
                  name="subject"
                  type="text"
                  placeholder="Subject"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="How can we help?"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 disabled:shadow-none text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                <MessageSquare size={18} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
