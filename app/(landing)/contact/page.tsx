"use client"
import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const ContactSection = () => {
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
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                <MessageSquare size={18} />
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;