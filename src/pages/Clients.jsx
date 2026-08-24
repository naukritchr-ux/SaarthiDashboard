import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Users,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  RefreshCw,
  Filter,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertCircle,
  Target,
  Activity,
  Building2,
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
  LineChart,
  Line,
  Legend,
} from "recharts";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [franchiseeFilter, setFranchiseeFilter] = useState("All");
  const [teamLeaderFilter, setTeamLeaderFilter] = useState("All");

  const [viewMode, setViewMode] = useState("chart");

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `/api/dashboard/clients`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setClients(data);
    } catch (err) {
      console.error("Clients API Error:", err);
      setError(
        "Unable to load client analytics. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const getClientDate = (client) => {
    const rawDate =
      client?.dateClientAcquired ||
      client?.dateOfClientAllocation ||
      client?.created_at;

    if (!rawDate) return null;

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getPeriodRange = (selectedPeriod) => {
    const now = new Date();
    const todayEnd = endOfDay(now);

    if (selectedPeriod === "all") {
      return {
        currentStart: null,
        currentEnd: null,
        previousStart: null,
        previousEnd: null,
      };
    }

    if (selectedPeriod === "thisMonth") {
      const currentStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const previousStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const previousEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

      return {
        currentStart,
        currentEnd: todayEnd,
        previousStart,
        previousEnd,
      };
    }

    if (selectedPeriod === "lastMonth") {
      const currentStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const currentEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

      const previousStart = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      );

      const previousEnd = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        0,
        23,
        59,
        59,
        999
      );

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
      };
    }

    if (selectedPeriod === "thisQuarter") {
      const quarterStartMonth =
        Math.floor(now.getMonth() / 3) * 3;

      const currentStart = new Date(
        now.getFullYear(),
        quarterStartMonth,
        1
      );

      const previousStart = new Date(
        now.getFullYear(),
        quarterStartMonth - 3,
        1
      );

      const previousEnd = new Date(
        now.getFullYear(),
        quarterStartMonth,
        0,
        23,
        59,
        59,
        999
      );

      return {
        currentStart,
        currentEnd: todayEnd,
        previousStart,
        previousEnd,
      };
    }

    if (selectedPeriod === "thisYear") {
      const currentStart = new Date(
        now.getFullYear(),
        0,
        1
      );

      const previousStart = new Date(
        now.getFullYear() - 1,
        0,
        1
      );

      const previousEnd = new Date(
        now.getFullYear(),
        0,
        0,
        23,
        59,
        59,
        999
      );

      return {
        currentStart,
        currentEnd: todayEnd,
        previousStart,
        previousEnd,
      };
    }

    return {
      currentStart: null,
      currentEnd: null,
      previousStart: null,
      previousEnd: null,
    };
  };

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  const industries = useMemo(
    () =>
      [
        ...new Set(
          clients
            .map((client) => client?.industry)
            .filter(Boolean)
        ),
      ].sort(),
    [clients]
  );

  const franchisees = useMemo(
    () =>
      [
        ...new Set(
          clients
            .map((client) => client?.franchiseeName)
            .filter(Boolean)
        ),
      ].sort(),
    [clients]
  );

  const teamLeaders = useMemo(
    () =>
      [
        ...new Set(
          clients
            .map((client) => client?.teamLeader)
            .filter(Boolean)
        ),
      ].sort(),
    [clients]
  );

  /*
   * IMPORTANT:
   * Get every status directly from the API data.
   * Nothing is hard-coded here.
   */
  const statusOptions = useMemo(() => {
    const statuses = new Set();

    clients.forEach((client) => {
      const rawStatus = String(
        client?.status || ""
      ).trim();

      statuses.add(rawStatus || "Unknown");
    });

    return [...statuses].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [clients]);

  const matchesBusinessFilters = (client) => {
    const rawStatus = String(
      client?.status || ""
    ).trim();

    const status = rawStatus || "Unknown";

    const matchesStatus =
      statusFilter === "All" ||
      status.toLowerCase() ===
        statusFilter.toLowerCase();

    const matchesIndustry =
      industryFilter === "All" ||
      client?.industry === industryFilter;

    const matchesFranchisee =
      franchiseeFilter === "All" ||
      client?.franchiseeName === franchiseeFilter;

    const matchesTeamLeader =
      teamLeaderFilter === "All" ||
      client?.teamLeader === teamLeaderFilter;

    return (
      matchesStatus &&
      matchesIndustry &&
      matchesFranchisee &&
      matchesTeamLeader
    );
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (!matchesBusinessFilters(client)) {
        return false;
      }

      if (!periodRange.currentStart) {
        return true;
      }

      const date = getClientDate(client);

      if (!date) {
        return false;
      }

      return (
        date >= periodRange.currentStart &&
        date <= periodRange.currentEnd
      );
    });
  }, [
    clients,
    periodRange,
    statusFilter,
    industryFilter,
    franchiseeFilter,
    teamLeaderFilter,
  ]);

  const previousPeriodClients = useMemo(() => {
    if (!periodRange.previousStart) {
      return [];
    }

    return clients.filter((client) => {
      if (!matchesBusinessFilters(client)) {
        return false;
      }

      const date = getClientDate(client);

      if (!date) {
        return false;
      }

      return (
        date >= periodRange.previousStart &&
        date <= periodRange.previousEnd
      );
    });
  }, [
    clients,
    periodRange,
    statusFilter,
    industryFilter,
    franchiseeFilter,
    teamLeaderFilter,
  ]);

  const isActive = (client) =>
    String(client?.status || "")
      .toLowerCase()
      .trim() === "active";

  const totalClients = filteredClients.length;

  const activeClients =
    filteredClients.filter(isActive).length;

  const nonActiveClients =
    totalClients - activeClients;

  const activePercentage =
    totalClients > 0
      ? (activeClients / totalClients) * 100
      : 0;

  const previousTotal =
    previousPeriodClients.length;

  const previousActive =
    previousPeriodClients.filter(isActive).length;

  const previousNonActive =
    previousTotal - previousActive;

  const previousActivePercentage =
    previousTotal > 0
      ? (previousActive / previousTotal) * 100
      : 0;

  const calculateChange = (current, previous) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return null;
    }

    return (
      ((current - previous) / previous) *
      100
    );
  };

  const totalChange = calculateChange(
    totalClients,
    previousTotal
  );

  const activeChange = calculateChange(
    activeClients,
    previousActive
  );

  const nonActiveChange = calculateChange(
    nonActiveClients,
    previousNonActive
  );

  const activePercentageChange =
    activePercentage -
    previousActivePercentage;

  const Comparison = ({
    value,
    percentagePoint = false,
    inverse = false,
  }) => {
    if (period === "all") {
      return (
        <span className="text-xs text-slate-400">
          All available data
        </span>
      );
    }

    if (value === null) {
      return (
        <span className="text-xs font-semibold text-emerald-600">
          New
        </span>
      );
    }

    const positive = value >= 0;

    const isGood = inverse
      ? !positive
      : positive;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isGood
            ? "text-emerald-600"
            : "text-rose-500"
        }`}
      >
        {positive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}

        {Math.abs(value).toFixed(1)}
        {percentagePoint ? " pp" : "%"}

        <span className="font-normal text-slate-400">
          vs previous
        </span>
      </span>
    );
  };

  /*
   * STATUS DATA
   *
   * Every status returned by the API is counted separately.
   *
   * Example:
   * Active
   * Blacklisted
   * Pending
   * Inactive
   * Any other status
   *
   * Nothing is hard-coded.
   */
  const statusData = useMemo(() => {
    const counts = {};

    filteredClients.forEach((client) => {
      const rawStatus = String(
        client?.status || ""
      ).trim();

      const status = rawStatus || "Unknown";

      counts[status] =
        (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredClients]);

  const statusColors = [
    "#10b981",
    "#fb7185",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#ec4899",
  ];

  const industryData = useMemo(() => {
    const counts = {};

    filteredClients.forEach((client) => {
      const industry =
        client?.industry || "Unknown";

      counts[industry] =
        (counts[industry] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredClients]);

  /*
   * CLIENT ACQUISITION TREND
   *
   * Data comes ONLY from the Clients API.
   *
   * Future-dated records are ignored.
   */
  const acquisitionData = useMemo(() => {
    const counts = {};

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    filteredClients.forEach((client) => {
      const rawDate =
        client?.dateClientAcquired ||
        client?.dateOfClientAllocation;

      if (!rawDate) return;

      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      if (date > today) {
        return;
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString(
        "en-IN",
        {
          month: "short",
          year: "numeric",
        }
      );

      if (!counts[key]) {
        counts[key] = {
          month: label,
          value: 0,
          sortKey: key,
        };
      }

      counts[key].value++;
    });

    return Object.values(counts)
      .sort((a, b) =>
        a.sortKey.localeCompare(b.sortKey)
      )
      .slice(-12)
      .map(({ month, value }) => ({
        month,
        value,
      }));
  }, [filteredClients]);

  const engagementData = useMemo(() => {
    const active =
      filteredClients.filter(isActive).length;

    const nonActive =
      filteredClients.length - active;

    return [
      {
        name: "Active",
        value: active,
      },
      {
        name: "Reactivation Opportunity",
        value: nonActive,
      },
    ];
  }, [filteredClients]);

  const reactivationPercentage =
    totalClients > 0
      ? (nonActiveClients / totalClients) * 100
      : 0;

  const largestIndustry =
    industryData.length > 0
      ? industryData[0]
      : null;

  const unassignedClients =
    filteredClients.filter(
      (client) =>
        !client?.franchiseeName ||
        !client?.teamLeader
    ).length;

  const clientInsights = useMemo(() => {
    const insights = [];

    if (totalClients === 0) {
      return [
        {
          type: "info",
          title: "No matching clients",
          text:
            "Try changing the selected filters or reporting period.",
        },
      ];
    }

    if (activePercentage >= 75) {
      insights.push({
        type: "positive",
        title: "Strong active client base",
        text: `${activePercentage.toFixed(
          1
        )}% of the selected clients are active.`,
      });
    } else if (activePercentage >= 50) {
      insights.push({
        type: "info",
        title: "Client activity is moderate",
        text: `${activePercentage.toFixed(
          1
        )}% of clients are active, leaving room for further reactivation.`,
      });
    } else {
      insights.push({
        type: "attention",
        title: "Client activity needs attention",
        text: `Only ${activePercentage.toFixed(
          1
        )}% of the selected clients are active.`,
      });
    }

    if (nonActiveClients > 0) {
      insights.push({
        type:
          reactivationPercentage >= 40
            ? "attention"
            : "info",
        title: "Reactivation opportunity",
        text: `${nonActiveClients.toLocaleString(
          "en-IN"
        )} non-active clients represent a potential follow-up opportunity.`,
      });
    }

    if (acquisitionData.length >= 2) {
      const latest =
        acquisitionData[
          acquisitionData.length - 1
        ];

      const previous =
        acquisitionData[
          acquisitionData.length - 2
        ];

      const difference =
        latest.value - previous.value;

      if (difference > 0) {
        insights.push({
          type: "positive",
          title: "Client acquisition is increasing",
          text: `${latest.value} clients were acquired in ${latest.month}, compared with ${previous.value} in the previous month.`,
        });
      } else if (difference < 0) {
        insights.push({
          type: "attention",
          title: "Recent acquisition has slowed",
          text: `Client acquisition decreased from ${previous.value} to ${latest.value} in the latest month.`,
        });
      } else {
        insights.push({
          type: "info",
          title: "Acquisition is stable",
          text: `The latest month recorded ${latest.value} client acquisitions, similar to the previous month.`,
        });
      }
    }

    if (largestIndustry) {
      insights.push({
        type: "info",
        title: "Largest client segment",
        text: `${largestIndustry.name} has the highest client count in the current selection with ${largestIndustry.value.toLocaleString(
          "en-IN"
        )} clients.`,
      });
    }

    if (unassignedClients > 0) {
      insights.push({
        type: "attention",
        title: "Assignment data needs review",
        text: `${unassignedClients.toLocaleString(
          "en-IN"
        )} clients are missing a franchisee or team leader assignment.`,
      });
    }

    return insights.slice(0, 4);
  }, [
    totalClients,
    activePercentage,
    nonActiveClients,
    reactivationPercentage,
    acquisitionData,
    largestIndustry,
    unassignedClients,
  ]);

  const resetFilters = () => {
    setPeriod("all");
    setStatusFilter("All");
    setIndustryFilter("All");
    setFranchiseeFilter("All");
    setTeamLeaderFilter("All");
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-violet-500" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading client analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
        <UserX className="mx-auto h-10 w-10 text-red-400" />

        <h3 className="mt-4 text-xl font-bold text-slate-800">
          Unable to Load Clients
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={fetchClients}
          className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* FILTER BAR */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-2.5">
              <Filter className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Client Analytics Filters
              </h3>

              <p className="text-xs text-slate-500">
                Change filters to dynamically update the analytics.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <CalendarDays className="h-4 w-4 text-violet-500" />

            <span className="text-sm font-semibold text-slate-600">
              Period
            </span>

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 outline-none focus:border-violet-400"
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

            <div className="ml-2 inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">

              <button
                type="button"
                onClick={() =>
                  setViewMode("chart")
                }
                className={`px-4 py-2.5 text-sm font-semibold transition ${
                  viewMode === "chart"
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Chart View
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("table")
                }
                className={`px-4 py-2.5 text-sm font-semibold transition ${
                  viewMode === "table"
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Table View
              </button>

            </div>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            <option value="All">
              All Status
            </option>

            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <select
            value={industryFilter}
            onChange={(e) =>
              setIndustryFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            <option value="All">
              All Industries
            </option>

            {industries.map((industry) => (
              <option
                key={industry}
                value={industry}
              >
                {industry}
              </option>
            ))}
          </select>

          <select
            value={franchiseeFilter}
            onChange={(e) =>
              setFranchiseeFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            <option value="All">
              All Franchisees
            </option>

            {franchisees.map((franchisee) => (
              <option
                key={franchisee}
                value={franchisee}
              >
                {franchisee}
              </option>
            ))}
          </select>

          <select
            value={teamLeaderFilter}
            onChange={(e) =>
              setTeamLeaderFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            <option value="All">
              All Team Leaders
            </option>

            {teamLeaders.map((leader) => (
              <option
                key={leader}
                value={leader}
              >
                {leader}
              </option>
            ))}
          </select>

        </div>

        <div className="mt-4 flex justify-end">

          <button
            onClick={resetFilters}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            Reset Filters
          </button>

        </div>

      </section>

      {/* KPI CARDS */}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
            <Users className="h-6 w-6 text-cyan-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Clients
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {totalClients.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison value={totalChange} />
          </div>

        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <UserCheck className="h-6 w-6 text-emerald-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Active Clients
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {activeClients.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison value={activeChange} />
          </div>

        </div>

        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100">
            <UserX className="h-6 w-6 text-rose-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Reactivation Opportunity
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {nonActiveClients.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison
              value={nonActiveChange}
              inverse
            />
          </div>

        </div>

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <Target className="h-6 w-6 text-violet-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Active Client %
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {activePercentage.toFixed(1)}%
          </h3>

          <div className="mt-2">
            <Comparison
              value={activePercentageChange}
              percentagePoint
            />
          </div>

        </div>

      </section>

      {/* STATUS + ACQUISITION */}

      <section className="grid gap-6 xl:grid-cols-2">

        {/* STATUS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-100 p-2.5">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Client Status Mix
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                All client statuses returned by the API.
              </p>
            </div>

          </div>

          {viewMode === "chart" ? (

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >

                    {statusData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-cell-${entry.name}-${index}`}
                          fill={
                            statusColors[
                              index %
                                statusColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Clients
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Percentage
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {statusData.map((row) => (

                    <tr
                      key={row.name}
                      className="border-t border-slate-100"
                    >

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {row.name}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-700">
                        {row.value.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-700">
                        {totalClients > 0
                          ? (
                              (row.value /
                                totalClients) *
                              100
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-emerald-50 p-4">

              <p className="text-xs text-emerald-600">
                Active
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {activeClients.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                {activePercentage.toFixed(1)}%
              </p>

            </div>

            <div className="rounded-xl bg-rose-50 p-4">

              <p className="text-xs text-rose-500">
                All Other Statuses
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {nonActiveClients.toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-1 text-xs text-rose-500">
                {reactivationPercentage.toFixed(1)}%
              </p>

            </div>

          </div>

        </div>

        {/* ACQUISITION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Client Acquisition Trend
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Clients acquired during the selected period.
              </p>
            </div>

          </div>

          {viewMode === "chart" ? (

            <div className="mt-5 h-64">

              {acquisitionData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={acquisitionData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Acquisition date data is not available for this period.
                </div>

              )}

            </div>

          ) : (

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">

              {acquisitionData.length > 0 ? (

                <table className="w-full text-sm">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Month
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-slate-600">
                        Clients Acquired
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {acquisitionData.map(
                      (row) => (
                        <tr
                          key={row.month}
                          className="border-t border-slate-100"
                        >

                          <td className="px-4 py-3 font-medium text-slate-700">
                            {row.month}
                          </td>

                          <td className="px-4 py-3 text-right text-slate-700">
                            {row.value.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              ) : (

                <div className="p-6 text-center text-sm text-slate-400">
                  Acquisition date data is not available for this period.
                </div>

              )}

            </div>

          )}

        </div>

      </section>

      {/* INDUSTRY + CLIENT ENGAGEMENT */}

      <section className="grid gap-6 xl:grid-cols-2">

        {/* INDUSTRY */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-cyan-100 p-2.5">
              <Building2 className="h-5 w-5 text-cyan-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Clients by Industry
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Major industry segments in the selected client base.
              </p>
            </div>

          </div>

          {viewMode === "chart" ? (

            <div className="mt-5 h-72">

              {industryData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={industryData}
                    layout="vertical"
                    margin={{
                      left: 20,
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
                      width={130}
                      tick={{ fontSize: 10 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#06b6d4"
                      radius={[
                        0,
                        6,
                        6,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No industry data available.
                </div>

              )}

            </div>

          ) : (

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">

              {industryData.length > 0 ? (

                <table className="w-full text-sm">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        Industry
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-slate-600">
                        Clients
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {industryData.map(
                      (row) => (
                        <tr
                          key={row.name}
                          className="border-t border-slate-100"
                        >

                          <td className="px-4 py-3 font-medium text-slate-700">
                            {row.name}
                          </td>

                          <td className="px-4 py-3 text-right text-slate-700">
                            {row.value.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              ) : (

                <div className="p-6 text-center text-sm text-slate-400">
                  No industry data available.
                </div>

              )}

            </div>

          )}

        </div>

        {/* CLIENT ENGAGEMENT */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-orange-100 p-2.5">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Client Engagement
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Active clients versus potential reactivation opportunities.
              </p>
            </div>

          </div>

          {viewMode === "chart" ? (

            <div className="mt-4 h-64">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={engagementData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#f97316"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Engagement
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Clients
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {engagementData.map(
                    (row) => (
                      <tr
                        key={row.name}
                        className="border-t border-slate-100"
                      >

                        <td className="px-4 py-3 font-medium text-slate-700">
                          {row.name}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-700">
                          {row.value.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-emerald-50 p-4">

              <p className="text-xs text-emerald-600">
                Active Base
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {activeClients.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            <div className="rounded-xl bg-orange-50 p-4">

              <p className="text-xs text-orange-600">
                Reactivation Pool
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {nonActiveClients.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* SMART CLIENT INSIGHTS */}

      <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 shadow-sm">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <Lightbulb className="h-6 w-6 text-violet-600" />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800">
              Smart Client Insights
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Automatically generated observations from the selected client data.
            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">

          {clientInsights.map(
            (insight, index) => {

              const isAttention =
                insight.type ===
                "attention";

              const isPositive =
                insight.type ===
                "positive";

              return (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-4 ${
                    isAttention
                      ? "border-rose-100 bg-rose-50/70"
                      : isPositive
                      ? "border-emerald-100 bg-emerald-50/70"
                      : "border-slate-100 bg-white/80"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    {isAttention ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    ) : isPositive ? (
                      <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                    )}

                    <div>

                      <p className="text-sm font-bold text-slate-800">
                        {insight.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {insight.text}
                      </p>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* FOOTER SUMMARY */}

      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-5">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Client analytics
            </p>

            <p className="mt-1 text-xs text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-700">
                {filteredClients.length.toLocaleString(
                  "en-IN"
                )}
              </span>{" "}

              clients matching the selected filters.

            </p>

          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Live API data

          </div>

        </div>

      </section>

    </div>
  );
}

export default Clients;