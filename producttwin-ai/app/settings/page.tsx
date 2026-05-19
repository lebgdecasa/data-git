"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/lib/profile-store";
import {
  Database, Download, Upload, Trash2, User, FileJson, AlertTriangle, Check,
} from "lucide-react";

type Tab = "profile" | "data" | "account";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const profile = useProfileStore((s) => s.profile);
  const audit = useProfileStore((s) => s.audit);
  const auditHistory = useProfileStore((s) => s.auditHistory);
  const kpiHistory = useProfileStore((s) => s.kpiHistory);
  const actionItems = useProfileStore((s) => s.actionItems);
  const savedScenarios = useProfileStore((s) => s.savedScenarios);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const loadDemo = useProfileStore((s) => s.loadDemo);
  const resetWelcome = useProfileStore((s) => s.resetWelcome);

  const handleExport = () => {
    const data = {
      profile, audit, auditHistory, kpiHistory, actionItems, savedScenarios,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nika-${(profile.productName || "workspace").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (parsed.profile) {
          setProfile(parsed.profile);
          setImportMsg("Profile imported successfully.");
          setTimeout(() => setImportMsg(""), 3000);
        } else {
          setImportMsg("Invalid file — no profile data found.");
        }
      } catch {
        setImportMsg("Could not parse file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    clearProfile();
    setConfirmReset(false);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage your workspace profile, export and import data, and reset everything to start over."
      />

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.06]">
          {(["profile", "data", "account"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-violet-400 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="space-y-4 fade-up">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Current workspace</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  This is the product currently loaded in your NIKA workspace.
                </p>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 space-y-2">
                  <Row label="Product name" value={profile.productName || "(not set)"} />
                  <Row label="Industry" value={profile.industry || "(not set)"} />
                  <Row label="Type" value={profile.productType || "(not set)"} />
                  <Row label="MRR" value={profile.mrr ? `$${profile.mrr.toLocaleString()}` : "(not set)"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Load demo data</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Replace your current profile with the NutriFlow demo product. Useful for exploring features without entering your own data.
                </p>
                <Button onClick={loadDemo} variant="outline">
                  <Database className="h-3.5 w-3.5" />
                  Load NutriFlow demo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data tab */}
        {tab === "data" && (
          <div className="space-y-4 fade-up">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Storage summary</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Everything below is stored in your browser's localStorage. No data leaves your device.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Stat label="Audits" value={auditHistory.length} />
                  <Stat label="KPI snapshots" value={kpiHistory.length} />
                  <Stat label="Action items" value={actionItems.length} />
                  <Stat label="Saved scenarios" value={savedScenarios.length} />
                  <Stat label="Profile" value={profile.productName ? "Set" : "Empty"} />
                  <Stat label="Current audit" value={audit ? "Yes" : "—"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Export workspace</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Download a JSON file with your profile, audits, KPI history, action items, and saved scenarios.
                </p>
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  Export as JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Import workspace</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Load a previously exported workspace file. This will replace your current profile.
                </p>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="application/json"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImport(f);
                      e.currentTarget.value = "";
                    }}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-3.5 w-3.5" />
                      Choose JSON file
                    </span>
                  </Button>
                </label>
                {importMsg && (
                  <p className="text-xs text-emerald-300 mt-2 flex items-center gap-1.5">
                    <Check className="h-3 w-3" />
                    {importMsg}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-rose-500/20">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Reset workspace</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Permanently delete profile, audits, KPIs, action items, and saved scenarios. Cannot be undone.
                </p>
                {!confirmReset ? (
                  <Button onClick={() => setConfirmReset(true)} variant="outline">
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset everything
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/[0.05]">
                    <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0" />
                    <p className="text-sm text-rose-100 flex-1">Are you sure? This cannot be undone.</p>
                    <Button onClick={() => setConfirmReset(false)} variant="ghost" size="sm">Cancel</Button>
                    <Button onClick={handleReset} variant="destructive" size="sm">Yes, reset</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account tab */}
        {tab === "account" && (
          <div className="space-y-4 fade-up">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Guest workspace</p>
                    <p className="text-xs text-zinc-400">No account · data stored locally in this browser</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  NIKA currently runs without user accounts. Your workspace is anonymous and tied to this browser.
                  Use Export to back up your data and Import to move to another browser.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Plan</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-300">Free</p>
                    <p className="text-xs text-zinc-500">Single workspace · localStorage only</p>
                  </div>
                  <Badge className="bg-violet-500/20 text-violet-200 border border-violet-500/40 text-[10px]">
                    Current
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Paid plans with multi-workspace, integrations (Stripe / Mixpanel / Segment), and team collaboration are on the roadmap.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-white mb-1">Restart welcome tour</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Show the first-run welcome modal again next time you visit with an empty profile.
                </p>
                <Button onClick={resetWelcome} variant="outline">
                  <FileJson className="h-3.5 w-3.5" />
                  Reset welcome state
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm text-white tabular-numeric truncate">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">{label}</p>
      <p className="text-sm font-bold text-white tabular-numeric mt-0.5">{value}</p>
    </div>
  );
}
