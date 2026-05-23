import React from "react";
import CollaboratorList from "@/components/dashboard/CollaboratorList";

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Team Management</h1>
        <p className="text-slate-500 text-sm">Manage your team members and contractors</p>
      </div>

      <CollaboratorList />
    </div>
  );
}
