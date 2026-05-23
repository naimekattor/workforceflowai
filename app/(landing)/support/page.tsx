import React from 'react';
import { BookOpen, HelpCircle, LifeBuoy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SupportCenter = () => {
  const supportOptions = [
    {
      title: "Guides",
      description: "Step-by-step walkthroughs for onboarding, quoting, invoicing, and team setup.",
      icon: <BookOpen className="w-6 h-6 text-cyan-600" />,
      linkText: "Browse Guides",
      href: "#"
    },
    {
      title: "FAQ",
      description: "Quick answers to common questions about plans, billing, and workflow automation.",
      icon: <HelpCircle className="w-6 h-6 text-cyan-600" />,
      linkText: "Read FAQs",
      href: "#"
    },
    {
      title: "Direct Help",
      description: "Need immediate assistance? Contact the support team and we will respond promptly.",
      icon: <LifeBuoy className="w-6 h-6 text-cyan-600" />,
      linkText: "Contact Support",
      href: "/contact"
    }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Support Center
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find practical answers quickly and get help when you need it.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportOptions.map((option, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col items-start"
            >
              {/* Icon */}
              <div className="mb-6 p-3 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {option.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-grow">
                {option.description}
              </p>

              {/* Action Link */}
              <Link 
                href={option.href}
                className="flex items-center text-cyan-700 font-semibold hover:text-cyan-800 transition-colors group/link"
              >
                {option.linkText}
                <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportCenter;