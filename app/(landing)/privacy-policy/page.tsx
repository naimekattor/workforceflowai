import React from "react";
import { Lock, Shield, Scale } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-white min-h-screen py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 text-slate-700 leading-7">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Privacy Policy
          </h1>
          <p>
            This Privacy Policy applies between you, the User of this Website,
            and <strong>WorkforceFlow AI Ltd</strong>, the owner and provider of
            this Website. WorkforceFlow AI Ltd takes the privacy of your
            information very seriously. This Privacy Policy applies to our use
            of any and all Data collected by us or provided by you in relation
            to your use of the Website and our services. Please read this
            Privacy Policy carefully.
          </p>
        </div>

        {/* Definitions */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            1. Definitions
          </h2>

          <p>
            <strong>Data:</strong> Collectively all information that you submit
            to WorkforceFlow AI Ltd via the Website or Services. This definition
            incorporates, where applicable, the definitions provided in
            applicable Data Protection Laws.
          </p>

          <p>
            <strong>Cookies:</strong> A small text file placed on your computer
            or device by this Website when you visit certain parts of the
            Website and/or when you use certain features of the Website.
          </p>

          <div>
            <strong>
              Any applicable law relating to the processing of personal Data
              including, but not limited to
            </strong>
            <ul className="list-disc pl-6">
              <li>UK GDPR</li>
              <li>Data Protection Act 2018</li>
              <li>Privacy and Electronic Communications Regulations (PECR)</li>
              <li>and any successor legislation.</li>
            </ul>
          </div>

          <p>
            <strong>UK GDPR</strong> The retained EU law version of the General
            Data Protection Regulation ((EU) 2016/679) as it forms part of the
            law of England and Wales.
          </p>

          <p>
            <strong>WorkforceFlow AI Ltd, we or us</strong> A company
            incorporated in England and Wales.
          </p>

          <div>
            <strong>User or you</strong> A company Any third party that accesses
            the Website and is not either:
            <ul className="list-disc pl-6">
              <li>
                employed by WorkforceFlow AI Ltd and acting in the course of
                their employment;
              </li>
              <li>
                engaged as a consultant or service provider accessing the
                Website in connection with the provision of services.
              </li>
            </ul>
          </div>

          <p>
            <strong>Website</strong> The website operated by WorkforceFlow AI Ltd
            and any associated sub-domains unless expressly excluded by their
            own terms and conditions.
          </p>
        </section>

        {/* Interpretation */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            2. Interpretation
          </h2>
          <p>In this Privacy Policy, unless the context requires otherwise:</p>
          <ul className="list-disc pl-6">
            <li>Singular includes plural and vice versa</li>
            <li>References to clauses include sub-clauses</li>
            <li>
              references to persons include companies, organisations and
              partnerships;
            </li>
            <li>“Including” means “including without limitation”</li>
            <li>Headings do not form part of this policy</li>
          </ul>
        </section>

        {/* Scope */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Scope of this Privacy Policy
          </h2>
          <p>
            3.This Privacy Policy applies only to the actions of WorkforceFlow
            AI Ltd and Users with respect to this Website and Services.
            WorkforceFlow AI Ltd acts as the data controller under applicable
            Data Protection Laws.
          </p>
          <p>
            4.For the purposes of applicable Data Protection Laws, WorkforceFlow
            AI Ltd is the “data controller”. This means that WorkforceFlow AI
            Ltd determines the purposes for which, and the manner in which, your
            Data is processed.
          </p>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Data We May Collect
          </h2>
          <p>5.We may collect the following Data from you:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Company name</li>
            <li>Job title</li>
            <li>contact information including email addresses and telephone numbers;</li>
            <li>Billing and payment details</li>
            <li>Business profile information</li>
            <li>Account login details</li>
            <li>Usage data</li>
            <li>IP address</li>
            <li>browser type and version;</li>
            <li>operating system;</li>
            <li>pages visited and interaction data;</li>
            <li>marketing and communication preferences</li>
            <li>cookies and tracking information.</li>
          </ul>
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            How We Use Your Data
          </h2>
          <p>6.We may use your Data for the following purposes:</p>
          <ul className="list-disc pl-6">
            <li>providing and managing access to our Services;</li>
            <li>user authentication and account administration;</li>
            <li>generating quotations, invoices and workflows;</li>
            <li>customer support and service communications;</li>
            <li>analytics and service improvement;</li>
            <li>fraud prevention and security monitoring;</li>
            <li>complying with legal and regulatory obligations;</li>
            <li>marketing communications where permitted by law.</li>
          </ul>
        </section>

        {/* Legal Basis */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Legal Basis for Processing
          </h2>
          <p>
            7.We process your Data under one or more of the following legal bases:
          </p>
          <ul className="list-disc pl-6">
            <li>performance of a contract;</li>
            <li>compliance with legal obligations;</li>
            <li>legitimate business interests;</li>
            <li>consent, where require</li>
          </ul>
        </section>

        {/* Marketing */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Marketing Communications
          </h2>
          <p>
            8.Where legally permitted, we may send you marketing communications
            relating to our products and services.
          </p>
          <ul className="list-disc pl-6">
            <li>opt out at any time;</li>
            <li>unsubscribe using links provided in emails;</li>
            <li>contact us directly to withdraw consent.</li>
          </ul>
        </section>

        {/* Sharing */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Sharing Your Data
          </h2>
          <p>9.We may share your Data with:</p>
          <ul className="list-disc pl-6">
            <li>employees, contractors and professional advisers;</li>
            <li>cloud hosting and infrastructure providers;</li>
            <li>payment processors;</li>
            <li>analytics providers;</li>
            <li>customer support providers;</li>
            <li>regulatory authorities where legally required.</li>
          </ul>
          <p>
            We will only share Data where necessary and subject to appropriate safeguards.
          </p>
        </section>

        {/* Cookies (fixed structure only) */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies</h2>

          <p>
            17.This Website uses Cookies and similar technologies to improve user
            experience, provide essential functionality and analyse usage.
          </p>

          <p>18.We may use the following categories of Cookies:</p>

          <div>
            <strong>Strictly Necessary Cookies</strong>
            <p>Required for the operation of the Website and platform functionality.</p>
          </div>

          <div>
            <strong>Analytics Cookies</strong>
            <p>Used to analyse visitor behaviour and improve performance.</p>
          </div>

          <div>
            <strong>Functional Cookies</strong>
            <p>Used to remember preferences and settings.</p>
          </div>

          <div>
            <strong>Marketing Cookies</strong>
            <p>Used to deliver relevant advertising and measure campaign effectiveness</p>
          </div>

          <p>
            19.Before non-essential Cookies are placed on your device, you will
            be presented with a cookie consent mechanism.
          </p>

          <ul className="list-disc pl-6">
            <li>accept Cookies;</li>
            <li>reject non-essential Cookies;</li>
            <li>customise preferences.</li>
          </ul>

          <p>You may withdraw consent at any time.</p>
        </section>

        {/* Contact */}
        <section className="border-t pt-4">
          <h2 className="text-xl font-bold">Contact Us</h2>
          <p>
            WorkforceFlow AI Ltd <br />
            Email: <strong>privacy@workforceflow.ai</strong>
          </p>
        </section>

        {/* Cookie Schedule fix only */}
        <section>
          <strong>Cookie Schedule</strong>

          <div>
            <strong>Strictly Necessary Cookies</strong>
            <p>Cookie Purpose</p>
            <p>Session Cookie Maintains secure user sessions and authentication</p>
          </div>

          <div>
            <strong>Analytics Cookies</strong>
            <p>Cookie Purpose</p>
            <p>Helps us understand how users interact with the Website</p>
          </div>

          <div>
            <strong>Functional Cookies</strong>
            <p>Cookie Purpose</p>
            <p>Stores user preferences and settings</p>
          </div>

          <div>
            <strong>Marketing Cookies</strong>
            <p>Cookie Purpose</p>
            <p>Delivers relevant advertisements and measures engagement</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;