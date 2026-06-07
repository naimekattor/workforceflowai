import React from 'react';
import { Target, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  Reveal,
  RevealSection,
  Stagger,
  StaggerItem,
} from '@/components/landing/MotionReveal';

const AboutUs = () => {
  const reasons = [
    {
      icon: <Target className="w-5 h-5 text-cyan-500" />,
      title: "End-to-end workflow clarity",
      description: "Connect customer records, quotes, invoices, and jobs in a single timeline."
    },
    {
      icon: <Users className="w-5 h-5 text-cyan-500" />,
      title: "Designed for real teams",
      description: "Owners and staff can collaborate without missing key updates or approvals."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />,
      title: "Reliable operations",
      description: "Use consistent templates and structured processes to reduce errors."
    }
  ];

  return (
    <RevealSection className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Column: Content */}
        <Reveal className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium border border-cyan-100">
            <Sparkles className="w-4 h-4" />
            About WorkforceFlow AI
          </div>
          
          <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Built for businesses that need to move from quote to payment faster.
          </h2>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            WorkforceFlow AI helps service teams replace disconnected spreadsheets and manual follow-ups with one clear workflow. From customer setup to quote approval, invoicing, and job tracking, everything stays synchronized.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href={"/signup"}>
            <button className="px-8 py-4 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            </Link>
            <Link href={"/contact"}>
            <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              Talk to Sales
            </button>
            </Link>
          </div>
        </Reveal>

        {/* Right Column: Feature Card */}
        <Reveal className="flex-1 w-full max-w-xl" delay={0.12} y={18}>
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 lg:p-12 shadow-2xl shadow-cyan-100/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Why teams choose WorkforceFlow AI
            </h3>
            
            <Stagger className="space-y-6" stagger={0.07}>
              {reasons.map((reason, idx) => (
                <StaggerItem key={idx} className="flex gap-5 p-6 rounded-2xl border border-slate-50 bg-slate-50/30">
                  <div className="shrink-0 p-3 bg-white rounded-xl shadow-sm h-fit">
                    {reason.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 leading-tight">
                      {reason.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>

      </div>
    </RevealSection>
  );
};

export default AboutUs;
