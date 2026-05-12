"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  adminActivity,
  adminBroadcast,
  adminDeleteUser,
  adminLogin,
  adminPayments,
  adminSetPlan,
  adminStats,
  adminSystem,
  adminUserDetail,
  adminUsers,
  adminVerifyUser,
  adminExportUsersUrl,
  type AdminActivityItem,
  type AdminStats,
  type AdminSystemPayload,
  type AdminUserDetail,
  type AdminUserRow,
} from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";

const ADMIN_TOKEN_KEY = "kish_admin_token";

type PageKey = "dashboard" | "users" | "payments" | "activity" | "system";

export function AdminClient() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);

  const [page, setPage] = useState<PageKey>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, pages: 1 });
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userPlan, setUserPlan] = useState("all");

  const [payments, setPayments] = useState<
    Array<{ reference: string; email: string; amount: number; method: string; status: string; createdAt: string }>
  >([]);
  const [paysMeta, setPaysMeta] = useState({ total: 0, pages: 1 });
  const [paysPage, setPaysPage] = useState(1);
  const [payMethod, setPayMethod] = useState("all");
  const [payStatus, setPayStatus] = useState("all");

  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [system, setSystem] = useState<AdminSystemPayload | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<AdminUserDetail | null>(null);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastFilter, setBroadcastFilter] = useState("all");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastErr, setBroadcastErr] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) return;
    setToken(t);
    void adminStats(t)
      .then(() => {
        // token OK
      })
      .catch(() => {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
      });
  }, []);

  const authed = Boolean(token);

  const doLogin = async () => {
    setLoginErr(null);
    try {
      const d = await adminLogin(email.trim(), password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, d.token);
      setToken(d.token);
    } catch (e) {
      setLoginErr(e instanceof Error ? e.message : "Login failed");
    }
  };

  const doLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  };

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const s = await adminStats(token);
      setStats(s);
      const act = await adminActivity(token, 8);
      setActivity(act.activity);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }, [token]);

  const loadUsers = useCallback(
    async (forcedPage?: number) => {
      if (!token) return;
      const pageNum = forcedPage ?? userPage;
      try {
        const data = await adminUsers(token, {
          search: userSearch,
          plan: userPlan,
          page: pageNum,
          limit: 15,
        });
        setUsers(data.users);
        setUsersMeta({ total: data.total, pages: data.pages });
      } catch (e) {
        toast("error", e instanceof Error ? e.message : "Failed to load users");
      }
    },
    [token, userSearch, userPlan, userPage],
  );

  const loadPayments = useCallback(
    async (forcedPage?: number) => {
      if (!token) return;
      const pageNum = forcedPage ?? paysPage;
      try {
        const data = await adminPayments(token, {
          method: payMethod,
          status: payStatus,
          page: pageNum,
          limit: 15,
        });
        setPayments(data.payments);
        setPaysMeta({ total: data.total, pages: data.pages });
      } catch (e) {
        toast("error", e instanceof Error ? e.message : "Failed to load payments");
      }
    },
    [token, payMethod, payStatus, paysPage],
  );

  const loadActivity = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminActivity(token, 100);
      setActivity(data.activity);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to load activity");
    }
  }, [token]);

  const loadSystem = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminSystem(token);
      setSystem(data);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to load system");
    }
  }, [token]);

  useEffect(() => {
    if (!authed) return;
    if (page === "dashboard") void loadDashboard();
    if (page === "users") void loadUsers();
    if (page === "payments") void loadPayments();
    if (page === "activity") void loadActivity();
    if (page === "system") void loadSystem();
  }, [authed, page, loadDashboard, loadUsers, loadPayments, loadActivity, loadSystem]);

  const openUser = async (uemail: string) => {
    if (!token) return;
    setDrawerOpen(true);
    setDrawerUser(null);
    try {
      const u = await adminUserDetail(token, uemail);
      setDrawerUser(u);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to load user");
    }
  };

  const exportUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(adminExportUsersUrl(), { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kish-users-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "Users exported");
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Export failed");
    }
  };

  const sendBroadcast = async () => {
    if (!token) return;
    setBroadcastErr(null);
    if (!broadcastSubject.trim() || !broadcastMsg.trim()) {
      setBroadcastErr("Subject and message required.");
      return;
    }
    if (!window.confirm(`Send email to ${broadcastFilter} verified users?`)) return;
    try {
      const data = await adminBroadcast(token, {
        subject: broadcastSubject.trim(),
        message: broadcastMsg.trim(),
        planFilter: broadcastFilter,
      });
      setBroadcastOpen(false);
      toast("success", `Sent to ${data.sent} users`);
    } catch (e) {
      setBroadcastErr(e instanceof Error ? e.message : "Broadcast failed");
    }
  };

  const pageTitle = useMemo(() => {
    const map: Record<PageKey, string> = {
      dashboard: "Dashboard",
      users: "Users",
      payments: "Payments",
      activity: "Activity Log",
      system: "System Health",
    };
    return map[page];
  }, [page]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060a12] px-6">
        <div className="w-full max-w-sm rounded-2xl border border-amber-400/30 bg-[#0d1421] p-10 text-center">
          <div className="text-3xl font-extrabold tracking-wide text-white">
            KISH <span className="text-amber-400">AI</span>
          </div>
          <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-slate-600">ADMIN CONTROL PANEL</div>
          <div className="mt-8 space-y-3 text-left">
            <div>
              <div className="mb-2 font-mono text-[11px] text-slate-400">Admin Email</div>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-amber-400/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
              />
            </div>
            <div>
              <div className="mb-2 font-mono text-[11px] text-slate-400">Password</div>
              <input
                type="password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-amber-400/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void doLogin()}
              />
            </div>
            {loginErr ? <div className="font-mono text-xs text-red-400">{loginErr}</div> : null}
            <Button variant="primary" className="w-full bg-gradient-to-br from-amber-400 to-amber-600 py-3 text-black" onClick={() => void doLogin()}>
              Access Control Panel →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#060a12] text-slate-100">
      <aside className="w-[220px] shrink-0 border-r border-amber-400/10 bg-[#060a12]/95">
        <div className="border-b border-white/5 p-5">
          <div className="text-sm font-bold tracking-wide text-white">KISH ADMIN</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.15em] text-amber-400">CONTROL PANEL v3.0</div>
        </div>
        <div className="px-2 py-3">
          <div className="px-2 pb-2 font-mono text-[9px] tracking-[0.2em] text-slate-600">NAVIGATION</div>
          {(
            [
              ["dashboard", "📊", "Dashboard"],
              ["users", "👥", "Users"],
              ["payments", "💳", "Payments"],
              ["activity", "📋", "Activity Log"],
              ["system", "🔧", "System Health"],
            ] as const
          ).map(([k, icon, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setPage(k)}
              className={cn(
                "mb-1 flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100",
                page === k && "border-amber-400/25 bg-amber-400/10 text-amber-300",
              )}
            >
              <span className="w-5 text-center">{icon}</span>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto space-y-2 px-2 py-4">
          <div className="px-2 pb-2 font-mono text-[9px] tracking-[0.2em] text-slate-600">TOOLS</div>
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5"
            onClick={() => setBroadcastOpen(true)}
          >
            <span className="w-5 text-center">📢</span>
            Broadcast Email
          </button>
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5"
            onClick={() => void exportUsers()}
          >
            <span className="w-5 text-center">📥</span>
            Export CSV
          </button>
          <button type="button" className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300" onClick={doLogout}>
            ↩ Log Out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#060a12]/70 px-7 py-4 backdrop-blur-xl">
          <div className="text-sm text-slate-400">
            Kish AI / <span className="text-amber-300">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-[11px] text-slate-500">System Online</span>
            </div>
            <Button
              variant="ghost"
              className="border border-white/10 px-3 py-2 text-xs"
              onClick={() => {
                if (page === "dashboard") void loadDashboard();
                if (page === "users") void loadUsers();
                if (page === "payments") void loadPayments();
                if (page === "activity") void loadActivity();
                if (page === "system") void loadSystem();
              }}
            >
              ⟳ Refresh
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-7">
          {page === "dashboard" && stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Stat label="TOTAL USERS" value={String(stats.totalUsers)} sub={`+${stats.newThisWeek} this week`} accent="#22d3ee" />
                <Stat label="PRO USERS" value={String(stats.proUsers)} sub={`${stats.freeUsers} on free`} accent="#f59e0b" />
                <Stat label="MONTHLY REVENUE" value={`$${stats.mrr}`} sub={`+KES ${stats.totalRevKES.toLocaleString()}`} accent="#4ade80" />
                <Stat label="TOTAL MESSAGES" value={stats.totalMessages.toLocaleString()} sub="All time" accent="#a78bfa" />
                <Stat label="VERIFIED USERS" value={String(stats.verifiedUsers)} sub={`${stats.unverified} pending`} accent="#f472b6" />
                <Stat label="PAYMENTS" value={String(stats.payments.completed)} sub={`${stats.payments.pending} pending · ${stats.payments.failed} failed`} accent="#ef4444" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="text-sm font-semibold">Recent Activity</div>
                  <Button variant="ghost" className="border border-white/10 px-3 py-2 text-xs" onClick={() => setPage("activity")}>
                    View All →
                  </Button>
                </div>
                <div className="p-5">
                  <ActivityList items={activity} />
                </div>
              </div>
            </div>
          ) : null}

          {page === "users" ? (
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold">Users ({usersMeta.total})</div>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="w-56 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none"
                    placeholder="Search email or name…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void loadUsers()}
                  />
                  <select
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs"
                    value={userPlan}
                    onChange={(e) => setUserPlan(e.target.value)}
                  >
                    <option value="all">All Plans</option>
                    <option value="pro">Pro Only</option>
                    <option value="free">Free Only</option>
                  </select>
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    onClick={() => {
                      setUserPage(1);
                      void loadUsers(1);
                    }}
                  >
                    Apply
                  </Button>
                  <Button variant="primary" className="px-3 py-2 text-xs" onClick={() => void exportUsers()}>
                    Export CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left font-mono text-[11px] text-slate-500">
                      <th className="px-4 py-3">USER</th>
                      <th className="px-4 py-3">PLAN</th>
                      <th className="px-4 py-3">VERIFIED</th>
                      <th className="px-4 py-3">MESSAGES</th>
                      <th className="px-4 py-3">JOINED</th>
                      <th className="px-4 py-3">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.email} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3">
                          <button type="button" className="text-left" onClick={() => void openUser(u.email)}>
                            <div className="font-medium">{u.name}</div>
                            <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{u.plan.toUpperCase()}</td>
                        <td className="px-4 py-3 text-xs">{u.verified ? "Yes" : "Pending"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{(u.totalMessages ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="ghost"
                              className="border border-white/10 px-2 py-1 text-[11px]"
                              onClick={async () => {
                                if (!token) return;
                                if (!window.confirm(`Set ${u.email} to ${u.plan === "free" ? "pro" : "free"}?`)) return;
                                await adminSetPlan(token, u.email, u.plan === "free" ? "pro" : "free");
                                toast("success", "Updated");
                                void loadUsers();
                              }}
                            >
                              {u.plan === "free" ? "↑ Pro" : "↓ Free"}
                            </Button>
                            {!u.verified ? (
                              <Button
                                variant="ghost"
                                className="border border-white/10 px-2 py-1 text-[11px]"
                                onClick={async () => {
                                  if (!token) return;
                                  await adminVerifyUser(token, u.email);
                                  toast("success", "Verified");
                                  void loadUsers();
                                }}
                              >
                                Verify
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              className="border border-red-500/25 px-2 py-1 text-[11px] text-red-300"
                              onClick={async () => {
                                if (!token) return;
                                if (!window.confirm(`Delete ${u.email}?`)) return;
                                await adminDeleteUser(token, u.email);
                                toast("success", "Deleted");
                                void loadUsers();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <div className="font-mono text-xs text-slate-500">
                  Page {userPage} of {usersMeta.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    disabled={userPage >= usersMeta.pages}
                    onClick={() => setUserPage((p) => Math.min(usersMeta.pages, p + 1))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {page === "payments" ? (
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold">Payments ({paysMeta.total})</div>
                <div className="flex flex-wrap gap-2">
                  <select className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="all">All Methods</option>
                    <option value="stripe">Stripe</option>
                    <option value="mpesa">M-Pesa</option>
                  </select>
                  <select className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs" value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    onClick={() => {
                      setPaysPage(1);
                      void loadPayments(1);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left font-mono text-[11px] text-slate-500">
                      <th className="px-4 py-3">REFERENCE</th>
                      <th className="px-4 py-3">EMAIL</th>
                      <th className="px-4 py-3">AMOUNT</th>
                      <th className="px-4 py-3">METHOD</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.reference} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.reference}</td>
                        <td className="px-4 py-3">{p.email}</td>
                        <td className="px-4 py-3 font-semibold">{p.method === "mpesa" ? `KES ${p.amount}` : "$12.00"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{p.method}</td>
                        <td className="px-4 py-3 font-mono text-xs">{p.status}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{fmtDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <div className="font-mono text-xs text-slate-500">
                  Page {paysPage} of {paysMeta.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    disabled={paysPage <= 1}
                    onClick={() => setPaysPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="ghost"
                    className="border border-white/10 px-3 py-2 text-xs"
                    disabled={paysPage >= paysMeta.pages}
                    onClick={() => setPaysPage((p) => Math.min(paysMeta.pages, p + 1))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {page === "activity" ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">Activity Log</div>
                <Button variant="ghost" className="border border-white/10 px-3 py-2 text-xs" onClick={() => void loadActivity()}>
                  ⟳ Refresh
                </Button>
              </div>
              <ActivityList items={activity} />
            </div>
          ) : null}

          {page === "system" && system ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Server Info</div>
                <div className="mt-4 space-y-2 font-mono text-xs text-slate-400">
                  <div>Node: {system.nodeVersion}</div>
                  <div>Uptime: {Math.floor(system.uptime / 60)} min</div>
                  <div>Env: {system.env}</div>
                  <div>Heap: {Math.round(system.memory.heapUsed / 1024 / 1024)} MB</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Database</div>
                <div className="mt-4 space-y-2 font-mono text-xs text-slate-400">
                  <div>Users: {system.dbSize.users}</div>
                  <div>Payments: {system.dbSize.payments}</div>
                  <div>Activity: {system.dbSize.activity}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Broadcast Email">
        <div className="space-y-3">
          <div>
            <div className="mb-2 font-mono text-[11px] text-slate-400">Recipients</div>
            <select className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm" value={broadcastFilter} onChange={(e) => setBroadcastFilter(e.target.value)}>
              <option value="all">All Verified Users</option>
              <option value="pro">Pro Users Only</option>
              <option value="free">Free Users Only</option>
            </select>
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] text-slate-400">Subject</div>
            <input className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm" value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] text-slate-400">Message</div>
            <textarea className="h-32 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm" value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
          </div>
          {broadcastErr ? <div className="text-xs text-red-400">{broadcastErr}</div> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" className="border border-white/10" onClick={() => setBroadcastOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void sendBroadcast()}>
              Send
            </Button>
          </div>
        </div>
      </Modal>

      <div className={cn("fixed inset-y-0 right-0 z-[150] w-[min(92vw,480px)] border-l border-amber-400/20 bg-[#0d1421] transition", drawerOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="sticky top-0 flex justify-end p-4">
          <Button variant="ghost" className="border border-white/10 px-3 py-2 text-xs" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>
        <div className="px-6 pb-10">
          {!drawerUser ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold">{drawerUser.name}</div>
                <div className="font-mono text-sm text-slate-500">{drawerUser.email}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between gap-3 py-2">
                  <span className="text-slate-500">Plan</span>
                  <span>{drawerUser.plan}</span>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <span className="text-slate-500">Messages</span>
                  <span>{(drawerUser.totalMessages ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-10" style={{ background: accent }} />
      <div className="font-mono text-[11px] tracking-wide text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-bold" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function ActivityList({ items }: { items: AdminActivityItem[] }) {
  if (!items.length) return <div className="text-sm text-slate-500">No activity yet</div>;
  return (
    <div className="space-y-0">
      {items.map((a, idx) => (
        <div key={`${a.ts}-${idx}`} className="border-b border-white/5 py-4 last:border-b-0">
          <div className="text-sm text-slate-200">
            <span className="font-mono text-xs text-slate-500">{a.type}</span>{" "}
            <span className="font-semibold">{a.email ?? ""}</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-slate-600">{fmtDate(a.ts)}</div>
        </div>
      ))}
    </div>
  );
}
