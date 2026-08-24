import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  Filter,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertCircle,
  ArrowDown,
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
} from "recharts";

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // FILTERS
  // ==================================================

  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [franchiseeFilter, setFranchiseeFilter] = useState("All");
  const [teamLeaderFilter, setTeamLeaderFilter] = useState("All");

  // ONLY NEW STATE FOR TABLE VIEW
  const [tableView, setTableView] = useState(false);

  // ==================================================
  // FETCH ENQUIRIES
  // ==================================================

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `/api/dashboard/enquiries`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setEnquiries(data);
    } catch (err) {
      console.error("Enquiries API Error:", err);

      setError(
        "Unable to load enquiry analytics. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // ==================================================
  // DATE HELPERS
  // ==================================================

  const getEnquiryDate = (enquiry) => {
    const rawDate =
      enquiry.created_at ||
      enquiry.dateOfAllocation ||
      enquiry.updated_at;

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

  // ==================================================
  // FIELD HELPERS
  // ==================================================

  const getStatus = (enquiry) => {
    return String(
      enquiry.status ||
        enquiry.enquiryStatus ||
        enquiry.enquiry_status ||
        ""
    ).trim();
  };

  const getPosition = (enquiry) => {
    return (
      enquiry.position ||
      enquiry.positionName ||
      enquiry.jobPosition ||
      enquiry.jobTitle ||
      "Unknown"
    );
  };

  const getFranchisee = (enquiry) => {
    return (
      enquiry.franchiseeName ||
      enquiry.franchisee ||
      "Unassigned"
    );
  };

  const getTeamLeader = (enquiry) => {
    return (
      enquiry.teamLeader ||
      enquiry.teamLeaderName ||
      "Unassigned"
    );
  };

  // ==================================================
  // FILTER OPTIONS
  // ==================================================

  const statuses = useMemo(
    () =>
      [
        ...new Set(
          enquiries
            .map((enquiry) => getStatus(enquiry))
            .filter(Boolean)
        ),
      ].sort(),
    [enquiries]
  );

  const positions = useMemo(
    () =>
      [
        ...new Set(
          enquiries
            .map((enquiry) => getPosition(enquiry))
            .filter(
              (value) => value && value !== "Unknown"
            )
        ),
      ].sort(),
    [enquiries]
  );

  const franchisees = useMemo(
    () =>
      [
        ...new Set(
          enquiries
            .map((enquiry) =>
              getFranchisee(enquiry)
            )
            .filter(
              (value) => value !== "Unassigned"
            )
        ),
      ].sort(),
    [enquiries]
  );

  const teamLeaders = useMemo(
    () =>
      [
        ...new Set(
          enquiries
            .map((enquiry) =>
              getTeamLeader(enquiry)
            )
            .filter(
              (value) => value !== "Unassigned"
            )
        ),
      ].sort(),
    [enquiries]
  );

  // ==================================================
  // BUSINESS FILTERS
  // ==================================================

  const matchesBusinessFilters = (enquiry) => {
    const matchesStatus =
      statusFilter === "All" ||
      getStatus(enquiry).toLowerCase() ===
        statusFilter.toLowerCase();

    const matchesPosition =
      positionFilter === "All" ||
      getPosition(enquiry) === positionFilter;

    const matchesFranchisee =
      franchiseeFilter === "All" ||
      getFranchisee(enquiry) === franchiseeFilter;

    const matchesTeamLeader =
      teamLeaderFilter === "All" ||
      getTeamLeader(enquiry) === teamLeaderFilter;

    return (
      matchesStatus &&
      matchesPosition &&
      matchesFranchisee &&
      matchesTeamLeader
    );
  };

  // ==================================================
  // CURRENT PERIOD DATA
  // ==================================================

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      if (!matchesBusinessFilters(enquiry)) {
        return false;
      }

      if (!periodRange.currentStart) {
        return true;
      }

      const date = getEnquiryDate(enquiry);

      if (!date) return false;

      return (
        date >= periodRange.currentStart &&
        date <= periodRange.currentEnd
      );
    });
  }, [
    enquiries,
    periodRange,
    statusFilter,
    positionFilter,
    franchiseeFilter,
    teamLeaderFilter,
  ]);

  // ==================================================
  // PREVIOUS PERIOD DATA
  // ==================================================

  const previousPeriodEnquiries = useMemo(() => {
    if (!periodRange.previousStart) {
      return [];
    }

    return enquiries.filter((enquiry) => {
      if (!matchesBusinessFilters(enquiry)) {
        return false;
      }

      const date = getEnquiryDate(enquiry);

      if (!date) return false;

      return (
        date >= periodRange.previousStart &&
        date <= periodRange.previousEnd
      );
    });
  }, [
    enquiries,
    periodRange,
    statusFilter,
    positionFilter,
    franchiseeFilter,
    teamLeaderFilter,
  ]);

  // ==================================================
  // STATUS CLASSIFICATION
  // ==================================================

  const isClosed = (enquiry) => {
    const status = getStatus(enquiry).toLowerCase();

    return (
      status.includes("closed") ||
      status.includes("complete") ||
      status.includes("placed") ||
      status.includes("converted") ||
      status.includes("selected")
    );
  };

  const isOpen = (enquiry) => {
    const status = getStatus(enquiry).toLowerCase();

    return (
      !isClosed(enquiry) &&
      !status.includes("cancel") &&
      !status.includes("reject")
    );
  };

  const isRejectedOrCancelled = (enquiry) => {
    const status = getStatus(enquiry).toLowerCase();

    return (
      status.includes("reject") ||
      status.includes("cancel")
    );
  };

  // ==================================================
  // KPI CALCULATIONS
  // ==================================================

  const totalEnquiries = filteredEnquiries.length;

  const closedEnquiries =
    filteredEnquiries.filter(isClosed).length;

  const openEnquiries =
    filteredEnquiries.filter(isOpen).length;

  const rejectedEnquiries =
    filteredEnquiries.filter(
      isRejectedOrCancelled
    ).length;

  const conversionRate =
    totalEnquiries > 0
      ? (closedEnquiries / totalEnquiries) * 100
      : 0;

  const previousTotal =
    previousPeriodEnquiries.length;

  const previousClosed =
    previousPeriodEnquiries.filter(isClosed).length;

  const previousOpen =
    previousPeriodEnquiries.filter(isOpen).length;

  const previousRejected =
    previousPeriodEnquiries.filter(
      isRejectedOrCancelled
    ).length;

  const previousConversionRate =
    previousTotal > 0
      ? (previousClosed / previousTotal) * 100
      : 0;

  // ==================================================
  // COMPARISON
  // ==================================================

  const calculateChange = (current, previous) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return null;
    }

    return ((current - previous) / previous) * 100;
  };

  const totalChange = calculateChange(
    totalEnquiries,
    previousTotal
  );

  const closedChange = calculateChange(
    closedEnquiries,
    previousClosed
  );

  const openChange = calculateChange(
    openEnquiries,
    previousOpen
  );

  const rejectedChange = calculateChange(
    rejectedEnquiries,
    previousRejected
  );

  const conversionChange =
    conversionRate - previousConversionRate;

  // ==================================================
  // COMPARISON COMPONENT
  // ==================================================

  const Comparison = ({
    value,
    percentagePoint = false,
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

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          positive
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

  // ==================================================
  // STATUS DATA
  // ==================================================

  const statusData = useMemo(() => {
    const counts = {};

    filteredEnquiries.forEach((enquiry) => {
      const status =
        getStatus(enquiry) || "Unknown";

      counts[status] =
        (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredEnquiries]);

  // ==================================================
  // ENQUIRY TREND
  // ==================================================

  const enquiryTrend = useMemo(() => {
    const counts = {};

    filteredEnquiries.forEach((enquiry) => {
      const date = getEnquiryDate(enquiry);

      if (!date) return;

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
  }, [filteredEnquiries]);

  // ==================================================
  // POSITION DATA
  // ==================================================

  const positionData = useMemo(() => {
    const counts = {};

    filteredEnquiries.forEach((enquiry) => {
      const position =
        getPosition(enquiry);

      counts[position] =
        (counts[position] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredEnquiries]);

  // ==================================================
  // CONVERSION FUNNEL
  // ==================================================

  const funnelData = [
    {
      name: "Total Enquiries",
      value: totalEnquiries,
      width: "100%",
      color: "bg-cyan-500",
    },
    {
      name: "Open / In Progress",
      value: openEnquiries,
      width:
        totalEnquiries > 0
          ? `${Math.max(
              (openEnquiries / totalEnquiries) *
                100,
              15
            )}%`
          : "15%",
      color: "bg-violet-500",
    },
    {
      name: "Closed / Converted",
      value: closedEnquiries,
      width:
        totalEnquiries > 0
          ? `${Math.max(
              (closedEnquiries / totalEnquiries) *
                100,
              15
            )}%`
          : "15%",
      color: "bg-emerald-500",
    },
  ];

  // ==================================================
  // SMART ENQUIRY INSIGHTS
  // ==================================================

  const enquiryInsights = useMemo(() => {
    const insights = [];

    if (totalEnquiries === 0) {
      return [
        {
          type: "info",
          title: "No matching enquiries",
          text: "Try changing the selected filters or period.",
        },
      ];
    }

    if (conversionRate >= 60) {
      insights.push({
        type: "positive",
        title: "Strong enquiry conversion",
        text: `${conversionRate.toFixed(
          1
        )}% of the filtered enquiries are currently classified as closed or converted.`,
      });
    } else if (conversionRate < 30) {
      insights.push({
        type: "attention",
        title: "Conversion needs attention",
        text: `The current closed/converted rate is ${conversionRate.toFixed(
          1
        )}%, leaving a larger share of enquiries open or unresolved.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Moderate enquiry conversion",
        text: `${conversionRate.toFixed(
          1
        )}% of filtered enquiries are currently classified as closed or converted.`,
      });
    }

    if (openEnquiries > 0) {
      insights.push({
        type: "attention",
        title: "Open enquiries",
        text: `${openEnquiries.toLocaleString(
          "en-IN"
        )} enquiries remain open or in progress.`,
      });
    }

    if (positionData.length > 0) {
      const topPosition = positionData[0];

      insights.push({
        type: "info",
        title: "Highest enquiry position",
        text: `${topPosition.name} has the highest enquiry volume with ${topPosition.value.toLocaleString(
          "en-IN"
        )} enquiries.`,
      });
    }

    if (
      period !== "all" &&
      conversionChange > 0
    ) {
      insights.push({
        type: "positive",
        title: "Conversion improved",
        text: `The conversion rate increased by ${conversionChange.toFixed(
          1
        )} percentage points compared with the previous period.`,
      });
    }

    if (
      period !== "all" &&
      conversionChange < 0
    ) {
      insights.push({
        type: "attention",
        title: "Conversion declined",
        text: `The conversion rate decreased by ${Math.abs(
          conversionChange
        ).toFixed(
          1
        )} percentage points compared with the previous period.`,
      });
    }

    return insights.slice(0, 4);
  }, [
    totalEnquiries,
    conversionRate,
    openEnquiries,
    positionData,
    period,
    conversionChange,
  ]);

  // ==================================================
  // RESET
  // ==================================================

  const resetFilters = () => {
    setPeriod("all");
    setStatusFilter("All");
    setPositionFilter("All");
    setFranchiseeFilter("All");
    setTeamLeaderFilter("All");
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-violet-500" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading enquiry analytics...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
        <XCircle className="mx-auto h-10 w-10 text-red-400" />

        <h3 className="mt-4 text-xl font-bold text-slate-800">
          Unable to Load Enquiries
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={fetchEnquiries}
          className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ==================================================
          FILTER BAR
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-2.5">
              <Filter className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Enquiry Analytics Filters
              </h3>

              <p className="text-xs text-slate-500">
                Change the filters to update enquiry analytics.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

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

            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <select
            value={positionFilter}
            onChange={(e) =>
              setPositionFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            <option value="All">
              All Positions
            </option>

            {positions.map((position) => (
              <option
                key={position}
                value={position}
              >
                {position}
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

        <div className="mt-4 flex items-center justify-end gap-3">

          {/* TABLE VIEW BUTTON */}
          <button
            onClick={() =>
              setTableView((prev) => !prev)
            }
            className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            {tableView
              ? "Chart View"
              : "Table View"}
          </button>

          <button
            onClick={resetFilters}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            Reset Filters
          </button>

        </div>

      </section>

      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
            <ClipboardList className="h-6 w-6 text-cyan-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Enquiries
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {totalEnquiries.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison value={totalChange} />
          </div>

        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Closed / Converted
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {closedEnquiries.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison value={closedChange} />
          </div>

        </div>

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <Clock3 className="h-6 w-6 text-violet-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Open / In Progress
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {openEnquiries.toLocaleString("en-IN")}
          </h3>

          <div className="mt-2">
            <Comparison value={openChange} />
          </div>

        </div>

        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Conversion Rate
          </p>

          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {conversionRate.toFixed(1)}%
          </h3>

          <div className="mt-2">
            <Comparison
              value={conversionChange}
              percentagePoint
            />
          </div>

        </div>

      </section>

      {/* ==================================================
          FUNNEL + STATUS
      ================================================== */}

      <section className="grid gap-6 xl:grid-cols-2">

        {/* CONVERSION FUNNEL */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold text-slate-800">
            Enquiry Conversion Funnel
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Movement from total enquiries toward closure.
          </p>

          <div className="mt-7">

            {tableView ? (

              <div className="overflow-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-3 py-3 font-semibold text-slate-600">
                        Stage
                      </th>

                      <th className="px-3 py-3 text-right font-semibold text-slate-600">
                        Enquiries
                      </th>

                      <th className="px-3 py-3 text-right font-semibold text-slate-600">
                        Percentage
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {funnelData.map((stage) => {

                      const percentage =
                        totalEnquiries > 0
                          ? (
                              (stage.value /
                                totalEnquiries) *
                              100
                            ).toFixed(1)
                          : "0.0";

                      return (
                        <tr
                          key={stage.name}
                          className="border-b border-slate-100"
                        >

                          <td className="px-3 py-3 text-slate-700">
                            {stage.name}
                          </td>

                          <td className="px-3 py-3 text-right font-semibold text-slate-800">
                            {stage.value.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-600">
                            {percentage}%
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            ) : (

              /* ==================================================
                 ORIGINAL FUNNEL VIEW
                 ================================================== */

              <div className="flex flex-col items-center">

                {funnelData.map((stage, index) => {

                  const percentage =
                    totalEnquiries > 0
                      ? (
                          (stage.value /
                            totalEnquiries) *
                          100
                        ).toFixed(1)
                      : 0;

                  const funnelWidth =
                    index === 0
                      ? "100%"
                      : index === 1
                      ? "62%"
                      : "42%";

                  return (
                    <div
                      key={stage.name}
                      className="w-full flex flex-col items-center"
                    >

                      <div className="mb-2 flex w-full items-center justify-between">

                        <span className="text-sm font-semibold text-slate-700">
                          {stage.name}
                        </span>

                        <span className="text-sm font-bold text-slate-800">

                          {stage.value.toLocaleString(
                            "en-IN"
                          )}{" "}

                          <span className="font-normal text-slate-400">
                            ({percentage}%)
                          </span>

                        </span>

                      </div>

                      <div className="flex w-full justify-center">

                        <div
                          className={`flex h-14 items-center justify-center text-sm font-bold text-white shadow-sm transition-all ${stage.color}`}
                          style={{
                            width: funnelWidth,

                            clipPath:
                              index === 0
                                ? "polygon(0 0, 100% 0, 92% 100%, 8% 100%)"
                                : index === 1
                                ? "polygon(8% 0, 92% 0, 82% 100%, 18% 100%)"
                                : "polygon(18% 0, 82% 0, 72% 100%, 28% 100%)",
                          }}
                        >
                          {stage.value.toLocaleString(
                            "en-IN"
                          )}
                        </div>

                      </div>

                      {index <
                        funnelData.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-4 w-4 text-slate-300" />
                        </div>
                      )}

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </div>

        {/* STATUS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold text-slate-800">
            Enquiry Status Distribution
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Current status mix within the selected filters.
          </p>

          <div className="mt-3 h-80 overflow-auto">

            {tableView ? (

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-3 py-3 font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-3 py-3 text-right font-semibold text-slate-600">
                      Enquiries
                    </th>

                    <th className="px-3 py-3 text-right font-semibold text-slate-600">
                      Percentage
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {statusData.map((item) => {

                    const percentage =
                      totalEnquiries > 0
                        ? (
                            (item.value /
                              totalEnquiries) *
                            100
                          ).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={item.name}
                        className="border-b border-slate-100"
                      >

                        <td className="px-3 py-3 text-slate-700">
                          {item.name}
                        </td>

                        <td className="px-3 py-3 text-right font-semibold text-slate-800">
                          {item.value.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-3 py-3 text-right text-slate-600">
                          {percentage}%
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            ) : (

              statusData.length > 0 ? (

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
                      outerRadius={105}
                      paddingAngle={3}
                    >

                      {statusData.map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#8b5cf6",
                                "#06b6d4",
                                "#10b981",
                                "#f97316",
                                "#ec4899",
                                "#6366f1",
                                "#14b8a6",
                                "#f59e0b",
                              ][index % 8]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No status data available.
                </div>

              )

            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          TREND + POSITION
      ================================================== */}

      <section className="grid gap-6 xl:grid-cols-2">

        {/* TREND */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold text-slate-800">
            Enquiry Trend
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Enquiries created during the selected period.
          </p>

          <div className="mt-5 h-72 overflow-auto">

            {tableView ? (

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-3 py-3 font-semibold text-slate-600">
                      Month
                    </th>

                    <th className="px-3 py-3 text-right font-semibold text-slate-600">
                      Enquiries
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {enquiryTrend.map((item) => (

                    <tr
                      key={item.month}
                      className="border-b border-slate-100"
                    >

                      <td className="px-3 py-3 text-slate-700">
                        {item.month}
                      </td>

                      <td className="px-3 py-3 text-right font-semibold text-slate-800">
                        {item.value.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              enquiryTrend.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={enquiryTrend}
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
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Enquiry date data is not available for this period.
                </div>

              )

            )}

          </div>

        </div>

        {/* POSITION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold text-slate-800">
            Enquiries by Position
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Highest enquiry volumes by position.
          </p>

          <div className="mt-5 h-72 overflow-auto">

            {tableView ? (

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-3 py-3 font-semibold text-slate-600">
                      Position
                    </th>

                    <th className="px-3 py-3 text-right font-semibold text-slate-600">
                      Enquiries
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {positionData.map((item) => (

                    <tr
                      key={item.name}
                      className="border-b border-slate-100"
                    >

                      <td className="px-3 py-3 text-slate-700">
                        {item.name}
                      </td>

                      <td className="px-3 py-3 text-right font-semibold text-slate-800">
                        {item.value.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              positionData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={positionData}
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
                      fill="#8b5cf6"
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
                  Position data is not available.
                </div>

              )

            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          SMART INSIGHTS
      ================================================== */}

      <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 shadow-sm">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <Lightbulb className="h-6 w-6 text-violet-600" />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800">
              Enquiry Insights
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Automatically generated observations from the selected enquiry data.
            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">

          {enquiryInsights.map(
            (insight, index) => {

              const isAttention =
                insight.type === "attention";

              const isPositive =
                insight.type === "positive";

              return (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-xl border p-4 ${
                    isAttention
                      ? "border-rose-100 bg-rose-50/60"
                      : isPositive
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-slate-100 bg-white/80"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    {isAttention ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
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

      {/* ==================================================
          FOOTER
      ================================================== */}

      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-5">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Enquiry analytics
            </p>

            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold">
                {filteredEnquiries.length.toLocaleString(
                  "en-IN"
                )}
              </span>{" "}
              enquiries matching the selected filters.
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

export default Enquiries;