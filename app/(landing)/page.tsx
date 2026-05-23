"use client"
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Users,
  CreditCard,
  Briefcase,
  Clock,
  Shield,
  Zap,
  Check,
  Star,
  Menu,
  X,
  ArrowRight,
  Paintbrush,
  Hammer,
  Wrench,
  Sparkles,
  Settings,
  Home,
  Lock,
  Database,
  TrendingUp,
  MessageSquare,
  FileCheck,
  Mail,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function App() {

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="hero">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Simplify Quotes, Invoices & Jobs <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">All in One Platform</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Create quotes faster, get paid sooner, and manage jobs effortlessly. The complete workflow management solution for service businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="/signup" className="bg-gradient-to-r from-cyan-400 to-teal-400 text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center gap-2 group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                14-day free trial
              </div>
            </div>
          </div>
          <div className="relative lg:ml-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100 to-teal-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 relative">
              <img 
                src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Dashboard Preview" 
                className="rounded-xl w-full h-auto object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
              {/* Floating Elements */}
              <div className="absolute top-6 -left-6 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Quote Sent</p>
                  <p className="text-[10px] text-slate-500">2 min ago</p>
                </div>
              </div>
              <div className="absolute bottom-10 -right-6 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Payment Received</p>
                  <p className="text-[10px] text-slate-500">£2,450</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-extrabold text-slate-900 mb-2">3x Faster</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Quote Creation</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-extrabold text-slate-900 mb-2">50% Sooner</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Payment Collection</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-extrabold text-slate-900 mb-2">100% Automated</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Job Creation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Manual Workflows Slow Down Your Business</h2>
          <p className="text-lg text-slate-600">Running a service business shouldn't mean drowning in paperwork and spreadsheets</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, title: "Messy Spreadsheets", desc: "Lost quotes and disorganized customer data", color: "text-rose-500", bg: "bg-rose-50" },
            { icon: Clock, title: "Delayed Payments", desc: "Waiting weeks to get paid for completed work", color: "text-orange-500", bg: "bg-orange-50" },
            { icon: Briefcase, title: "Disconnected Jobs", desc: "Manual job tracking across multiple tools", color: "text-amber-500", bg: "bg-amber-50" },
            { icon: Users, title: "Poor Team Sync", desc: "Staff working with outdated information", color: "text-red-500", bg: "bg-red-50" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-400 to-teal-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform, Complete Workflow</h2>
            <p className="text-cyan-50 text-lg">From customer inquiry to job completion — all in one seamless system</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            {[
              { icon: Users, label: "Customer" },
              { icon: FileText, label: "Quote" },
              { icon: CheckCircle2, label: "Accept" },
              { icon: FileCheck, label: "Invoice" },
              { icon: CreditCard, label: "Payment" },
              { icon: Briefcase, label: "Job" }
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-cyan-50">{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-cyan-200 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Run Your Service Business</h2>
          <p className="text-lg text-slate-600">Powerful features designed specifically for service-based businesses</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Customer Management", desc: "Manage all customer details, service history, and records in one organized place" },
            { icon: FileText, title: "Smart Quote Builder", desc: "Create professional quotes with line items, taxes, and pricing breakdowns in minutes" },
            { icon: Mail, title: "Secure Quote Sharing", desc: "Send quotes directly via email with simple customer-friendly review links" },
            { icon: CheckCircle2, title: "Quote Accept/Reject", desc: "Let customers review and accept or reject quotes with a single click" },
            { icon: Zap, title: "Auto Invoice Generation", desc: "Instantly convert accepted quotes into professional invoices automatically" },
            { icon: CreditCard, title: "Stripe Payment Collection", desc: "Collect payments securely through integrated online payment processing" },
            { icon: Briefcase, title: "Auto Job Creation", desc: "System automatically creates jobs once payment is completed — zero manual work" },
            { icon: Settings, title: "Team Collaboration", desc: "Allow business owners and staff to work together under one account" },
            { icon: Activity, title: "Activity Tracking", desc: "Track quote, invoice, payment, and job progress in one unified dashboard" }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-5 group-hover:bg-cyan-500 transition-colors">
                <feature.icon className="w-6 h-6 text-cyan-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple 5-step process from customer to completed job</p>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            {/* Continuous Vertical Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-300 -translate-x-1/2"></div>

            <div className="space-y-12 md:space-y-16">
              {[
                { num: 1, title: "Add Customer", desc: "Create customer profiles with contact details and service history", icon: Users },
                { num: 2, title: "Create & Send Quote", desc: "Build professional quotes with our smart builder and send via email", icon: FileText },
                { num: 3, title: "Customer Accepts", desc: "Customer reviews and accepts the quote with one simple click", icon: CheckCircle2 },
                { num: 4, title: "Get Paid via Invoice", desc: "Invoice is auto-generated and payment collected through Stripe", icon: CreditCard },
                { num: 5, title: "Job Created Automatically", desc: "Once payment completes, the system creates the job automatically", icon: Briefcase }
              ].map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10">
                  {i % 2 === 0 ? (
                    <>
                      <div className="flex-1 text-center md:text-right w-full">
                        <div className="flex items-center justify-center md:justify-end gap-4 mb-3">
                          <span className="w-8 h-8 rounded-full bg-cyan-400 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-cyan-200">
                            {step.num}
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900">{step.title}</h3>
                        </div>
                        <p className="text-slate-600 md:pl-20 text-base md:text-lg">{step.desc}</p>
                      </div>
                      <div className="flex-1 w-full">
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-center h-40 md:h-48 transition-transform hover:-translate-y-1">
                          <step.icon className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 w-full order-2 md:order-1">
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-center h-40 md:h-48 transition-transform hover:-translate-y-1">
                          <step.icon className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left w-full order-1 md:order-2">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                          <span className="w-8 h-8 rounded-full bg-cyan-400 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-cyan-200">
                            {step.num}
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900">{step.title}</h3>
                        </div>
                        <p className="text-slate-600 md:pr-20 text-base md:text-lg">{step.desc}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for Service Businesses</h2>
          <p className="text-lg text-slate-600">Perfect for any service-based business that creates quotes and manages jobs</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Paintbrush, label: "Painters", color: "text-purple-500" },
            { icon: Hammer, label: "Contractors", color: "text-orange-500" },
            { icon: Wrench, label: "Repair Services", color: "text-slate-500" },
            { icon: Sparkles, label: "Cleaning", color: "text-amber-600" },
            { icon: Settings, label: "Maintenance", color: "text-blue-500" },
            { icon: Home, label: "Home Services", color: "text-emerald-500" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white hover:shadow-md transition-all cursor-default">
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="text-sm font-bold text-slate-900 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team Collaboration */}
      <section className="py-24 bg-cyan-50/50 border-y border-cyan-100/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built for Teams, Not Just Individuals</h2>
              <p className="text-lg text-slate-600 mb-8">
                Collaborate seamlessly with your team members. Add staff, assign roles, and keep everyone on the same page.
              </p>
              <ul className="space-y-4">
                {[
                  "Multiple staff under one business account",
                  "Shared visibility across quotes, jobs, and invoices",
                  "Better internal coordination and handoffs",
                  "Role-based permissions for security"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200 to-teal-100 rounded-3xl transform -rotate-3 scale-105 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Team Collaboration" 
                className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-cyan-500" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise-Grade Security</h2>
        <p className="text-lg text-slate-600 mb-16 max-w-2xl mx-auto">Your business data is protected with bank-level security</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Lock, title: "Data Isolation", desc: "Each business account has completely isolated and secure data" },
            { icon: Database, title: "Encrypted Storage", desc: "All customer records and financial data are encrypted at rest" },
            { icon: CheckCircle2, title: "Secure Payments", desc: "PCI-compliant payment processing through Stripe integration" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Measurable Results for Your Business</h2>
            <p className="text-lg text-slate-600">See real improvements in efficiency and revenue</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Send Quotes Faster", desc: "3x faster quote creation and delivery" },
              { icon: TrendingUp, title: "Get Paid Sooner", desc: "50% reduction in payment delays" },
              { icon: Clock, title: "Save Admin Time", desc: "10+ hours saved per week on paperwork" },
              { icon: CheckCircle2, title: "Reduce Follow-ups", desc: "Automated notifications and reminders" },
              { icon: Briefcase, title: "Stay Organized", desc: "All data in one centralized system" },
              { icon: Users, title: "Better Customer Experience", desc: "Professional, seamless client journey" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <item.icon className="w-6 h-6 text-cyan-500 mb-4" />
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by Service Business Owners</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "This platform cut our quote creation time by 70%. We can now send professional quotes in minutes instead of hours.",
              name: "Sarah Johnson",
              role: "Painting Contractor",
              img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            },
            {
              quote: "Getting paid used to take weeks. Now with automated invoicing and payments, we get paid in days. Game changer!",
              name: "Michael Chen",
              role: "HVAC Services",
              img: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            },
            {
              quote: "Managing our team and customer data was a nightmare. This system brought everything together beautifully.",
              name: "Emma Williams",
              role: "Cleaning Business",
              img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-cyan-50/50 p-8 rounded-3xl border border-cyan-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={testimonial.img} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Choose the plan that fits your business. All plans include 14-day free trial.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
            {/* Free */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-sm text-slate-500 mb-6">Best for testing</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">£0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 10 customers', '5 quotes per month', 'Basic Invoicing', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-auto w-full py-3 px-4 rounded-xl font-semibold text-white bg-cyan-400 hover:bg-cyan-500 transition-colors">
                Get Started
              </button>
            </div>

            {/* Starter */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-sm text-slate-500 mb-6">Best for solo professionals</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">£29</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 50 customers', 'Unlimited quotes', 'Payment collection', 'Basic job management', '1 team member'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-auto block text-center w-full py-3 px-4 rounded-xl font-semibold text-white bg-cyan-400 hover:bg-cyan-500 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Professional (Most Popular) */}
            <div className="bg-gradient-to-b from-cyan-400 to-teal-400 p-8 rounded-3xl shadow-xl relative z-10 flex flex-col transform lg:scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <p className="text-sm text-cyan-50 mb-6">Best for growing businesses</p>
              <div className="mb-6 text-white">
                <span className="text-4xl font-extrabold">£79</span>
                <span className="text-cyan-100">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 500 customers', 'Unlimited quotes & invoices', 'Payment collection', 'Advanced job management', 'Up to 5 team members', 'Activity tracking', 'Custom branding'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-cyan-200 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-auto block text-center w-full py-3 px-4 rounded-xl font-bold text-cyan-600 bg-white hover:bg-slate-50 transition-colors shadow-lg">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-sm text-slate-500 mb-6">Best for established businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">£149</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited customers', 'Unlimited everything', 'Advanced features', 'Unlimited team members', 'API access', 'Dedicated support', 'Custom integrations'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-auto block text-center w-full py-3 px-4 rounded-xl font-semibold text-white bg-cyan-400 hover:bg-cyan-500 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {[
            { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade your plan at any time from your account settings." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards securely processed through Stripe." },
            { q: "Is there a setup fee?", a: "No setup fees, no hidden costs. The price you see is what you pay." },
            { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime with no penalties. Your data remains accessible for 30 days after cancellation." }
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
            <Shield className="w-4 h-4" />
            30-day money-back guarantee on all plans
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-gradient-to-br from-cyan-400 to-teal-400 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Simplify Your Service Business Workflow?
          </h2>
          <p className="text-xl text-cyan-50 mb-10">
            Join hundreds of service businesses already saving time and getting paid faster
          </p>
          <Link href="/signup" className="bg-white text-cyan-600 px-8 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 mx-auto group w-fit">
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-cyan-100 font-medium">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      
    </div>
  );
}
