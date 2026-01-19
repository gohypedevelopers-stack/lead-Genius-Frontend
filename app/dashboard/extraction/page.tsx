"use client";

import Link from "next/link";
import { Globe, FileSearch, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import AddLeads from "./social-engagement/AddLeads";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  linkedin_url: string;
  title?: string;
  company?: string;
  email?: string;
  score: number;
  status: string;
  source: string;
  enrichment_status: string;
  created_at: string;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

interface LeadStats {
  total: number;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  by_enrichment: Record<string, number>;
  avg_score: number;
}

export default function LeadExtractionPage() {
  const [showAddLeads, setShowAddLeads] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch leads and stats
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Fetch leads
      const leadsRes = await api.get<LeadsResponse>(`/api/leads?page=${page}&limit=10`);
      if (!leadsRes.error && leadsRes.data) {
        setLeads(leadsRes.data.leads || []);
        setTotal(leadsRes.data.total || 0);
      }

      // Fetch stats
      const statsRes = await api.get<LeadStats>("/api/leads/stats");
      if (!statsRes.error && statsRes.data) {
        setStats(statsRes.data);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [page]);

  const enrichedCount = stats?.by_enrichment?.completed || 0;
  const enrichmentRate = stats?.total ? Math.round((enrichedCount / stats.total) * 100) : 0;

  return (
    <div className="relative h-full w-full bg-background text-foreground transition-colors duration-300">
      {showAddLeads && <AddLeads onClose={() => setShowAddLeads(false)} />}

      <div className="h-full w-full overflow-y-auto p-6">

        {/* Breadcrumb */}
        <div className="text-xs text-muted-foreground">
          Home <span className="px-1">/</span>{" "}
          <span className="text-blue-500">Lead Extraction</span>
        </div>

        {/* Header */}
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Lead Extraction
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your lead sourcing campaigns and choose your preferred
              extraction methods.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
            <span className="text-lg leading-none">+</span>
            New Campaign
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <StatCard
            title="Total Leads Extracted"
            value={isLoading ? "..." : (stats?.total?.toLocaleString() || "0")}
            sub={`${stats?.by_source?.linkedin || 0} from LinkedIn`}
            subColor="text-emerald-500"
            iconRight={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M7 12c2.76 0 5-2.24 5-5S9.76 2 7 2 2 4.24 2 7s2.24 5 5 5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M2 22v-2c0-2.2 1.8-4 4-4h2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M14 22v-2c0-1.8 1.2-3.4 2.9-3.9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <StatCardProgress
            title="Email Validity Rate"
            value={isLoading ? "..." : `${enrichmentRate}%`}
            iconRight={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            progress={enrichmentRate}
          />

          <StatCard
            title="Active Jobs"
            value={isLoading ? "..." : String(stats?.by_status?.new || 0)}
            sub="Processing now"
            subColor="text-emerald-400"
            iconRight={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 3v3M17 3v3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M4 7h16v14H4V7Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>

        {/* Select Method */}
        <div className="mt-10">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="text-blue-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v5M12 17v5M2 12h5M17 12h5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M7 7l3 3M14 14l3 3M7 17l3-3M14 10l3-3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Select Extraction Method
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MethodCard
              icon={<ThumbIcon />}
              title="Social Engagement"
              desc="Extract leads interacting with specific influencers or posts. Target likes, comments, and followers."
              buttonText="Start Extraction"
              // href="/dashboard/extraction/social-engagement" 
              onClick={() => setShowAddLeads(true)}
            />

            <MethodCard
              icon={<UsersIcon />}
              title="Groups Scraper"
              desc="Scrape member lists from industry-specific professional groups and communities automatically."
              buttonText="Start Extraction"
              href="/dashboard/extraction/group-engagement"
            />

            <MethodCard
              icon={<Globe size={22} />}
              title="Web Engagement"
              desc="Find leads using boolean search, specific job titles, location data, and industry filters."
              buttonText="Start Extraction"
              href="/dashboard/extraction/lead-sourcing"
            />

            <MethodCard
              icon={<FileSearch size={22} />}
              title="Basic Search & CSV"
              desc="Enrich your existing data. Upload a list of domains or names for deep analysis."
              buttonText="Start Extraction"
              href="/dashboard/extraction/lead-sourcing"
            />
          </div>
        </div>

        {/* Recent Activity - Now showing real leads */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Leads
            </h2>
            <Link href="/dashboard/crm" className="text-sm font-semibold text-blue-500 hover:text-blue-400">
              View All
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4 transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3">NAME</th>
                    <th className="py-3">COMPANY</th>
                    <th className="py-3">SOURCE</th>
                    <th className="py-3">SCORE</th>
                    <th className="py-3">STATUS</th>
                  </tr>
                </thead>

                <tbody className="text-foreground/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No leads found. Start extracting leads!
                      </td>
                    </tr>
                  ) : (
                    leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-muted-foreground">{lead.title || "No title"}</div>
                        </td>
                        <td className="py-3">{lead.company || "-"}</td>
                        <td className="py-3 capitalize">{lead.source}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold ${lead.score >= 70 ? "text-emerald-500" : lead.score >= 40 ? "text-amber-500" : "text-red-400"}`}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${lead.status === "qualified" ? "bg-emerald-500/10 text-emerald-500" :
                              lead.status === "contacted" ? "bg-blue-500/10 text-blue-500" :
                                "bg-gray-500/10 text-gray-400"
                            }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur transition-colors hover:border-blue-500/30">
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  subColor,
  iconRight,
}: {
  title: string;
  value: string;
  sub: string;
  subColor: string;
  iconRight?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">
            {value}
          </div>
          <div className={["mt-2 text-xs", subColor].join(" ")}>{sub}</div>
        </div>

        <div className="rounded-xl bg-blue-600/10 p-2 text-blue-500 ring-1 ring-blue-500/15">
          {iconRight}
        </div>
      </div>
    </Card>
  );
}

function StatCardProgress({
  title,
  value,
  progress,
  iconRight,
}: {
  title: string;
  value: string;
  progress: number;
  iconRight?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">
            {value}
          </div>
        </div>

        <div className="rounded-xl bg-blue-600/10 p-2 text-blue-500 ring-1 ring-blue-500/15">
          {iconRight}
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}

function MethodCard({
  icon,
  title,
  desc,
  buttonText,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card p-5 backdrop-blur transition-colors hover:border-blue-500/30 hover:bg-accent/50">
      <div className="text-blue-500">{icon}</div>

      <div className="mt-4 text-base font-semibold text-foreground">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{desc}</p>

      {href ? (
        <Link
          href={href}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          {buttonText}
        </Link>
      ) : (
        <button
          onClick={onClick}
          className="mt-5 h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

function Row({
  name,
  method,
  date,
  leads,
  status,
  statusColor,
}: {
  name: string;
  method: string;
  date: string;
  leads: string;
  status: string;
  statusColor: "green" | "blue";
}) {
  const badge =
    statusColor === "green"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : "bg-blue-500/10 text-blue-600 border-blue-500/20";

  return (
    <tr className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/50">
      <td className="py-4 font-semibold text-foreground">{name}</td>
      <td className="py-4 text-muted-foreground">{method}</td>
      <td className="py-4 text-muted-foreground">{date}</td>
      <td className="py-4 text-foreground">{leads}</td>
      <td className="py-4">
        <span
          className={[
            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
            badge,
          ].join(" ")}
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
          {status}
        </span>
      </td>
    </tr>
  );
}

/* ---------------- Icons ---------------- */

function ThumbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 9V4a2 2 0 0 0-2-2l-4 9v11h10a2 2 0 0 0 2-1.6l1-7A2 2 0 0 0 19 9h-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M7 11H4v11h3V11Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 12c2.2 0 4-1.8 4-4S10.2 4 8 4 4 5.8 4 8s1.8 4 4 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M2 22v-2c0-2 1.6-3.6 3.6-3.6H10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 22v-2c0-1.8 1.2-3.4 2.9-3.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
