import { useEffect, useMemo, useState } from "react";

import {
  RefreshCw,
  Users,
  ClipboardList,
  BarChart3,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle2,
  WalletCards,
  CircleDollarSign,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import Sidebar from "./components/Sidebar";
import Clients from "./pages/Clients";
import Enquiries from "./pages/Enquiries";
import Invoices from "./pages/Invoices";
import Franchisees from "./pages/Franchisees";
import TopPerformance from "./pages/TopPerformance";
import BusinessInsights from "./pages/BusinessInsights";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState(false);

  const [period, setPeriod] = useState("all");

  const fetchSummary = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setApiError(false);

      const response = await fetch(
        `http://localhost:5000/api/dashboard/summary?period=${selectedPeriod}`
      );

      if (!response.ok) {
        throw new Error("Dashboard API failed");
      }

      const data = await response.json();

      setSummary(data);
    } catch (error) {
      console.error("Dashboard Summary Error:", error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === "Dashboard") {
      fetchSummary(period);
    }
  }, [period, activePage]);

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }

    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }

    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatPercentage = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

  const periodLabel = useMemo(() => {
    switch (period) {
      case "thisMonth":
        return "This Month";

      case "lastMonth":
        return "Last Month";

      case "thisQuarter":
        return "This Quarter";

      case "thisYear":
        return "This Year";

      default:
        return "All Time";
    }
  }, [period]);

  const Comparison = ({
    value,
    suffix = "%",
    inverse = false,
  }) => {
    const number = Number(value || 0);

    if (number === 0) {
      return (
        <span className="text-xs text-slate-400">
          No previous-period data
        </span>
      );
    }

    const isPositive = number > 0;

    const isGood = inverse ? !isPositive : isPositive;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isGood ? "text-emerald-600" : "text-rose-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}

        {Math.abs(number).toFixed(1)}
        {suffix}

        <span className="font-normal text-slate-400">
          vs previous
        </span>
      </span>
    );
  };

  const clients = summary?.clients || {};

  const enquiries = summary?.enquiries || {};

  const invoices = summary?.invoices || {};

  const funnel = summary?.funnel || {};

  const attention = summary?.attention || {};

  const comparison = summary?.comparison || {};

  const aging = summary?.aging || {};

  const enquiryFunnelData = [
    {
      name: "Total",
      value: Number(funnel.total || 0),
    },
    {
      name: "Allocated",
      value: Number(funnel.allocated || 0),
    },
    {
      name: "Closed",
      value: Number(funnel.closed || 0),
    },
  ];

  const invoiceAgingData = [
    {
      name: "0–30 Days",
      amount: Number(aging["0-30"] || 0),
    },
    {
      name: "31–60 Days",
      amount: Number(aging["31-60"] || 0),
    },
    {
      name: "61–90 Days",
      amount: Number(aging["61-90"] || 0),
    },
    {
      name: "90+ Days",
      amount: Number(aging["90+"] || 0),
    },
  ];

  const financialData = [
    {
      name: "Billing",
      amount: Number(invoices.totalBilling || 0),
    },
    {
      name: "Received",
      amount: Number(invoices.amountReceived || 0),
    },
    {
      name: "Outstanding",
      amount: Number(invoices.amountDue || 0),
    },
  ];

  const clientStatusData = [
    {
      name: "Active",
      value: Number(clients.active || 0),
    },
    {
      name: "Inactive",
      value: Number(clients.inactive || 0),
    },
  ];

  const smartInsights = useMemo(() => {
    const insights = [];

    const totalClients = Number(clients.total || 0);

    const activeRate =
      totalClients > 0
        ? (Number(clients.active || 0) / totalClients) * 100
        : 0;

    const closureRate = Number(
      enquiries.closureRate || 0
    );

    const collectionRate = Number(
      invoices.collectionRate || 0
    );

    const overdue90Plus = Number(
      aging["90+"] || 0
    );

    if (activeRate >= 75) {
      insights.push({
        type: "positive",
        title: "Strong client activity",
        text: `${activeRate.toFixed(
          1
        )}% of clients are currently active.`,
      });
    } else {
      insights.push({
        type: "attention",
        title: "Client activity needs attention",
        text: `Only ${activeRate.toFixed(
          1
        )}% of clients are currently active.`,
      });
    }

    if (closureRate >= 60) {
      insights.push({
        type: "positive",
        title: "Healthy enquiry closure",
        text: `${closureRate.toFixed(
          1
        )}% of enquiries are currently closed.`,
      });
    } else {
      insights.push({
        type: "attention",
        title: "Enquiry conversion opportunity",
        text: `Current enquiry closure is ${closureRate.toFixed(
          1
        )}%.`,
      });
    }

    if (collectionRate >= 75) {
      insights.push({
        type: "positive",
        title: "Strong collections",
        text: `${collectionRate.toFixed(
          1
        )}% of billed value has been received.`,
      });
    } else {
      insights.push({
        type: "attention",
        title: "Collections need focus",
        text: `${collectionRate.toFixed(
          1
        )}% of billed value has been collected.`,
      });
    }

    if (overdue90Plus > 0) {
      insights.push({
        type: "attention",
        title: "Long-aged receivables",
        text: `${formatCurrency(
          overdue90Plus
        )} is sitting in the 90+ day ageing bucket.`,
      });
    }

    return insights.slice(0, 4);
  }, [
    clients,
    enquiries,
    invoices,
    aging,
  ]);

  const pageTitle =
    activePage === "Dashboard"
      ? "Dashboard Overview"
      : activePage;

  const pageDescription =
    activePage === "Dashboard"
      ? "Executive view of Sarthi360 business performance."
      : activePage === "Business Insights"
      ? "A management-focused summary of the most important business observations."
      : activePage === "Franchisees"
      ? "Understand franchisee coverage across clients and enquiries."
      : activePage === "Top Performance"
      ? "Identify the highest-performing BD Members and Team Leaders based on revenue generated."
      : `Explore ${activePage.toLowerCase()} analytics and performance.`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <aside className="fixed left-0 top-0 z-30 h-screen w-64">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </aside>

      <div className="ml-64 min-h-screen">

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex items-center justify-between px-8 py-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                SARTHI360
              </p>

              <h1 className="text-lg font-bold text-slate-800">
                Business Intelligence
              </h1>
            </div>

            <div className="flex items-center gap-3">

              {activePage === "Dashboard" && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

                  <CalendarDays className="h-4 w-4 text-violet-500" />

                  <select
                    value={period}
                    onChange={(e) =>
                      setPeriod(e.target.value)
                    }
                    className="cursor-pointer bg-transparent text-sm font-semibold text-slate-600 outline-none"
                  >
                    <option value="all">
                      All Time
                    </option>

                    <option value="thisMonth">
                      This Month
                    </option>

                    <option value="lastMonth">
                      Last Month
                    </option>

                    <option value="thisQuarter">
                      This Quarter
                    </option>

                    <option value="thisYear">
                      This Year
                    </option>
                  </select>

                </div>
              )}

              {activePage === "Dashboard" && (
                <button
                  onClick={() =>
                    fetchSummary(period)
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-600"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />

                  Refresh
                </button>
              )}

            </div>
          </div>
        </header>

        <main className="px-8 py-7">

          <div className="mb-7">

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                  {activePage === "Dashboard"
                    ? "EXECUTIVE OVERVIEW"
                    : "ANALYTICS"}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {pageTitle}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {pageDescription}
                </p>

              </div>

              {activePage === "Dashboard" && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">

                  <p className="text-xs text-slate-400">
                    Reporting Period
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {periodLabel}
                  </p>

                </div>
              )}

            </div>
          </div>

          {/* ================================
              DASHBOARD
          ================================= */}

          {activePage === "Dashboard" ? (

            <>

              {/* KPI CARDS */}

              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* CLIENTS */}

                <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
                      <Users className="h-6 w-6 text-cyan-600" />
                    </div>

                    <Comparison
                      value={
                        comparison?.clients?.total
                      }
                    />

                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Total Clients
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-800">
                    {loading
                      ? "..."
                      : formatNumber(
                          clients.total
                        )}
                  </h3>

                  <p className="mt-2 text-xs text-emerald-600">
                    {formatNumber(
                      clients.active
                    )}{" "}
                    active clients
                  </p>

                </div>

                {/* ENQUIRIES */}

                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                      <ClipboardList className="h-6 w-6 text-violet-600" />
                    </div>

                    <Comparison
                      value={
                        comparison?.enquiries?.total
                      }
                    />

                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Total Enquiries
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-800">
                    {loading
                      ? "..."
                      : formatNumber(
                          enquiries.total
                        )}
                  </h3>

                  <p className="mt-2 text-xs text-emerald-600">
                    {formatNumber(
                      enquiries.closed
                    )}{" "}
                    closed
                  </p>

                </div>

                {/* BILLING */}

                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                      <CircleDollarSign className="h-6 w-6 text-orange-600" />
                    </div>

                    <Comparison
                      value={
                        comparison?.invoices?.billing
                      }
                    />

                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Total Billing
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-800">
                    {loading
                      ? "..."
                      : formatCurrency(
                          invoices.totalBilling
                        )}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500">
                    {formatNumber(
                      invoices.total
                    )}{" "}
                    invoices
                  </p>

                </div>

                {/* COLLECTION */}

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                      <WalletCards className="h-6 w-6 text-emerald-600" />
                    </div>

                    <Comparison
                      value={
                        comparison?.invoices?.collectionRate
                      }
                      suffix=" pts"
                    />

                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Collection Rate
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-800">
                    {loading
                      ? "..."
                      : formatPercentage(
                          invoices.collectionRate
                        )}
                  </h3>

                  <p className="mt-2 text-xs text-emerald-600">
                    Amount received:{" "}
                    {formatCurrency(
                      invoices.amountReceived
                    )}
                  </p>

                </div>

              </section>

              {/* ENQUIRY + CLIENT */}

              <section className="mt-6 grid gap-6 xl:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-violet-100 p-2.5">
                      <ClipboardList className="h-5 w-5 text-violet-600" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Enquiry Conversion Funnel
                      </h3>

                      <p className="text-sm text-slate-500">
                        Movement from enquiries to allocated and closed.
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 h-72">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={enquiryFunnelData}
                        layout="vertical"
                        margin={{
                          left: 10,
                          right: 20,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />

                        <XAxis type="number" />

                        <YAxis
                          type="category"
                          dataKey="name"
                          width={75}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="value"
                          fill="#8b5cf6"
                          radius={[
                            0,
                            8,
                            8,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatNumber(
                          funnel.total
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-400">
                        Allocated
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatNumber(
                          funnel.allocated
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-400">
                        Closed
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatNumber(
                          funnel.closed
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-100 p-2.5">
                      <Users className="h-5 w-5 text-cyan-600" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Client Portfolio Health
                      </h3>

                      <p className="text-sm text-slate-500">
                        Active versus inactive client base.
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 h-64">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={clientStatusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                        >

                          <Cell fill="#06b6d4" />
                          <Cell fill="#f43f5e" />

                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-xl bg-cyan-50 p-4">

                      <p className="text-xs text-cyan-600">
                        Active Clients
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {formatNumber(
                          clients.active
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-rose-50 p-4">

                      <p className="text-xs text-rose-500">
                        Inactive Clients
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {formatNumber(
                          clients.inactive
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {/* FINANCIAL + AGEING */}

              <section className="mt-6 grid gap-6 xl:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-orange-100 p-2.5">
                      <IndianRupee className="h-5 w-5 text-orange-600" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Financial Overview
                      </h3>

                      <p className="text-sm text-slate-500">
                        Billing, collections and outstanding value.
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 h-72">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart data={financialData}>

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(value)
                          }
                        />

                        <Bar
                          dataKey="amount"
                          fill="#f97316"
                          radius={[
                            8,
                            8,
                            0,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-xl bg-orange-50 p-3">
                      <p className="text-xs text-orange-600">
                        Billing
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(
                          invoices.totalBilling
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-600">
                        Received
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(
                          invoices.amountReceived
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-xs text-rose-500">
                        Due
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(
                          invoices.amountDue
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-amber-100 p-2.5">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Invoice Ageing
                      </h3>

                      <p className="text-sm text-slate-500">
                        Outstanding amount by ageing bucket.
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 h-72">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={invoiceAgingData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(value)
                          }
                        />

                        <Bar
                          dataKey="amount"
                          fill="#f59e0b"
                          radius={[
                            8,
                            8,
                            0,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                          90+ Days
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                          {formatCurrency(
                            aging["90+"]
                          )}
                        </p>

                      </div>

                      <AlertTriangle className="h-6 w-6 text-rose-500" />

                    </div>

                  </div>

                </div>

              </section>

              {/* ATTENTION + FINANCIAL HEALTH */}

              <section className="mt-6 grid gap-6 lg:grid-cols-3">

                <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm lg:col-span-2">

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-rose-100 p-2.5">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-slate-800">
                          Attention Required
                        </h3>

                        <p className="text-sm text-slate-500">
                          Areas that may require follow-up.
                        </p>

                      </div>

                    </div>

                    <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                      {formatNumber(
                        attention.total
                      )}{" "}
                      items
                    </div>

                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-violet-100 p-2">
                          <ClipboardList className="h-4 w-4 text-violet-600" />
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-700">
                            Enquiries needing attention
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {formatNumber(
                              attention.enquiries
                            )}
                          </p>

                        </div>

                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        Older open enquiries
                      </p>

                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-orange-100 p-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-700">
                            Overdue invoices
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {formatNumber(
                              attention.invoices
                            )}
                          </p>

                        </div>

                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        Invoices past their due date
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-emerald-100 p-2.5">
                      <IndianRupee className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Financial Health
                      </h3>

                      <p className="text-sm text-slate-500">
                        Current collection position
                      </p>

                    </div>

                  </div>

                  <div className="mt-7 text-center">

                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-emerald-100">

                      <span className="text-2xl font-bold text-slate-800">
                        {formatPercentage(
                          invoices.collectionRate
                        )}
                      </span>

                    </div>

                    <p className="mt-5 text-lg font-bold text-slate-800">
                      {summary?.financialHealth ||
                        "Calculating..."}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Based on billing collected versus total billed value.
                    </p>

                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Outstanding
                      </span>

                      <span className="font-bold text-rose-500">
                        {formatCurrency(
                          invoices.amountDue
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </section>

              {/* SMART INSIGHTS */}

              <section className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-cyan-50 p-6 shadow-sm">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <Lightbulb className="h-6 w-6 text-violet-500" />
                  </div>

                  <div className="flex-1">

                    <h3 className="font-bold text-slate-800">
                      Smart Key Insights
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Highlights generated from the current dashboard data.
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">

                      {smartInsights.map(
                        (insight, index) => (
                          <div
                            key={index}
                            className={`rounded-xl border p-4 ${
                              insight.type ===
                              "positive"
                                ? "border-emerald-100 bg-emerald-50"
                                : "border-amber-100 bg-amber-50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              {insight.type ===
                              "positive" ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                              )}

                              <div>

                                <p className="text-sm font-bold text-slate-800">
                                  {insight.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {insight.text}
                                </p>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </section>

              {/* API STATUS */}

              <div
                className={`mt-5 flex items-center justify-between rounded-xl border px-5 py-4 ${
                  apiError
                    ? "border-rose-100 bg-rose-50"
                    : "border-emerald-100 bg-emerald-50"
                }`}
              >

                <div>

                  <p className="text-sm font-semibold text-slate-700">
                    Sarthi360 API Connection
                  </p>

                  <p className="text-xs text-slate-500">
                    Live data connection through the backend.
                  </p>

                </div>

                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    apiError
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                >

                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiError
                        ? "bg-rose-500"
                        : "bg-emerald-500"
                    }`}
                  />

                  {apiError
                    ? "Connection Error"
                    : "Connected"}

                </div>

              </div>

            </>

          ) : activePage === "Clients" ? (

            <Clients />

          ) : activePage === "Enquiries" ? (

            <Enquiries />

          ) : activePage === "Invoices" ? (

            <Invoices />

          ) : activePage === "Franchisees" ? (

            <Franchisees />

          ) : activePage === "Top Performance" ? (

            /*
             * IMPORTANT:
             * Top Performance is rendered directly here.
             * This prevents it from falling through to
             * the generic placeholder section.
             */
            <TopPerformance />

          ) : activePage === "Business Insights" ? (

            <BusinessInsights
              setActivePage={setActivePage}
            />

          ) : (

            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100">

                <BarChart3 className="h-8 w-8 text-violet-500" />

              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-800">
                {activePage}
              </h3>

              <p className="mt-3 text-slate-500">
                This section will have its own analytics and business insights.
              </p>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default App;