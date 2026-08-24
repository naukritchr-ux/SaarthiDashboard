import { useEffect, useMemo, useState } from "react";

import {
  Trophy,
  Users,
  UserRound,
  IndianRupee,
  FileText,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Medal,
  Crown,
  Building2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function TopPerformance() {
  // =====================================================
  // STATE
  // =====================================================

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // bd = BD Members
  // teamLeader = Team Leaders
  // franchisee = Franchisees
  const [performanceType, setPerformanceType] =
    useState("bd");

  const [topLimit, setTopLimit] = useState(5);

  // =====================================================
  // FETCH LIVE API DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const responses = await Promise.all([
        fetch(
          "http://localhost:5000/api/dashboard/invoices"
        ),
        fetch(
          "http://localhost:5000/api/dashboard/clients"
        ),
        fetch(
          "http://localhost:5000/api/dashboard/enquiries"
        ),
      ]);

      if (
        responses.some(
          (response) => !response.ok
        )
      ) {
        throw new Error(
          "Unable to fetch performance data"
        );
      }

      const [
        invoicesResponse,
        clientsResponse,
        enquiriesResponse,
      ] = await Promise.all(
        responses.map((response) =>
          response.json()
        )
      );

      const invoiceData = Array.isArray(
        invoicesResponse
      )
        ? invoicesResponse
        : invoicesResponse?.data ||
          invoicesResponse?.invoices ||
          [];

      const clientData = Array.isArray(
        clientsResponse
      )
        ? clientsResponse
        : clientsResponse?.data ||
          clientsResponse?.clients ||
          [];

      const enquiryData = Array.isArray(
        enquiriesResponse
      )
        ? enquiriesResponse
        : enquiriesResponse?.data ||
          enquiriesResponse?.enquiries ||
          [];

      setInvoices(invoiceData);
      setClients(clientData);
      setEnquiries(enquiryData);
    } catch (err) {
      console.error(
        "Top Performance API Error:",
        err
      );

      setError(
        "Unable to load performance analytics. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // GENERIC VALUE HELPER
  // =====================================================

  const getValue = (
    item,
    possibleKeys
  ) => {
    if (!item) {
      return "";
    }

    for (const key of possibleKeys) {
      if (
        item[key] !== undefined &&
        item[key] !== null
      ) {
        const value = String(
          item[key]
        ).trim();

        if (value) {
          return value;
        }
      }
    }

    return "";
  };

  // =====================================================
  // BD MEMBER
  // ACTUAL INVOICE FIELD = nameOfBd
  // =====================================================

  const getBDMember = (item) => {
    const value = getValue(item, [
      "nameOfBd",
      "name_of_bd",

      // fallback fields for clients/enquiries
      "bdMember",
      "bd_member",
      "bdMemberName",
      "bd_member_name",
      "BDMember",
      "BDMemberName",
      "BD_MEMBER",
      "BD_MEMBER_NAME",
      "BD",
      "bd",
      "BDName",
      "bdName",
      "BD_Name",
      "bd_name",
      "businessDevelopmentMember",
      "business_development_member",
      "businessDevelopmentMemberName",
      "business_development_member_name",
    ]);

    return value || "Unassigned";
  };

  // =====================================================
  // TEAM LEADER
  // ACTUAL INVOICE FIELD = teamLeader
  // =====================================================

  const getTeamLeader = (item) => {
    const value = getValue(item, [
      "teamLeader",
      "team_leader",
      "teamLeaderName",
      "team_leader_name",
      "TeamLeader",
      "TeamLeaderName",
      "TEAM_LEADER",
      "TEAM_LEADER_NAME",
      "TL",
      "tl",
      "TLName",
      "tlName",
      "TeamLead",
      "teamLead",
      "teamlead",
      "TeamLeadName",
      "team_lead",
      "team_lead_name",
    ]);

    return value || "Unassigned";
  };

  // =====================================================
  // FRANCHISEE
  // ACTUAL INVOICE FIELD = franchiseName
  // =====================================================

  const getFranchisee = (item) => {
    const value = getValue(item, [
      "franchiseName",
      "franchise_name",

      // fallback fields
      "franchiseeName",
      "franchisee",
      "franchisee_name",
      "FranchiseeName",
      "Franchisee",
      "FRANCHISEE",
      "FRANCHISEE_NAME",
      "Franchisee_Name",
    ]);

    return value || "Unassigned";
  };

  // =====================================================
  // PERFORMANCE NAME
  // =====================================================

  const getPerformanceName = (item) => {
    if (performanceType === "bd") {
      return getBDMember(item);
    }

    if (performanceType === "teamLeader") {
      return getTeamLeader(item);
    }

    return getFranchisee(item);
  };

  // =====================================================
  // NUMBER HELPER
  // =====================================================

  const getNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : 0;
    }

    let cleaned = String(value)
      .replace(/,/g, "")
      .replace(/[₹$€£]/g, "")
      .replace(/%/g, "")
      .trim();

    const number = Number(cleaned);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  // =====================================================
  // REVENUE
  // ACTUAL INVOICE FIELD = totalBillAmt
  // =====================================================

  const getRevenue = (invoice) => {
    const possibleKeys = [
      "totalBillAmt",

      // fallback names
      "total_bill_amt",
      "totalBillAmount",
      "total_bill_amount",
      "totalBilling",
      "total_billing",
      "billAmount",
      "bill_amount",
      "totalAmount",
      "total_amount",
      "invoiceAmount",
      "invoice_amount",
      "grandTotal",
      "grand_total",
      "netAmount",
      "net_amount",
      "amount",
    ];

    for (const key of possibleKeys) {
      if (
        invoice?.[key] !== undefined &&
        invoice?.[key] !== null &&
        invoice?.[key] !== ""
      ) {
        return getNumber(
          invoice[key]
        );
      }
    }

    return 0;
  };

  // =====================================================
  // ALL PERFORMANCE NAMES
  // =====================================================

  const performanceNames = useMemo(() => {
    const names = new Set();

    invoices.forEach((invoice) => {
      const name =
        getPerformanceName(invoice);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    clients.forEach((client) => {
      const name =
        getPerformanceName(client);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    enquiries.forEach((enquiry) => {
      const name =
        getPerformanceName(enquiry);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    return [...names].sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [
    invoices,
    clients,
    enquiries,
    performanceType,
  ]);

  // =====================================================
  // PERFORMANCE DATA
  // =====================================================

  const performanceData = useMemo(() => {
    const map = {};

    // -------------------------------------------------
    // INITIALIZE PEOPLE / FRANCHISEES
    // -------------------------------------------------

    performanceNames.forEach(
      (name) => {
        map[name] = {
          name,
          revenue: 0,
          invoices: 0,
          clients: 0,
          enquiries: 0,
        };
      }
    );

    // -------------------------------------------------
    // REVENUE FROM INVOICES
    // -------------------------------------------------

    invoices.forEach((invoice) => {
      const name =
        getPerformanceName(invoice);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      if (!map[name]) {
        map[name] = {
          name,
          revenue: 0,
          invoices: 0,
          clients: 0,
          enquiries: 0,
        };
      }

      map[name].revenue +=
        getRevenue(invoice);

      map[name].invoices += 1;
    });

    // -------------------------------------------------
    // CLIENT COUNT
    // -------------------------------------------------

    clients.forEach((client) => {
      const name =
        getPerformanceName(client);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      if (!map[name]) {
        map[name] = {
          name,
          revenue: 0,
          invoices: 0,
          clients: 0,
          enquiries: 0,
        };
      }

      map[name].clients += 1;
    });

    // -------------------------------------------------
    // ENQUIRY COUNT
    // -------------------------------------------------

    enquiries.forEach((enquiry) => {
      const name =
        getPerformanceName(enquiry);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      if (!map[name]) {
        map[name] = {
          name,
          revenue: 0,
          invoices: 0,
          clients: 0,
          enquiries: 0,
        };
      }

      map[name].enquiries += 1;
    });

    // -------------------------------------------------
    // SORT BY REVENUE
    // -------------------------------------------------

    return Object.values(map)
      .filter(
        (item) =>
          item.revenue > 0
      )
      .sort(
        (a, b) =>
          b.revenue -
          a.revenue
      )
      .map(
        (item, index) => ({
          ...item,

          rank: index + 1,

          averageRevenue:
            item.invoices > 0
              ? item.revenue /
                item.invoices
              : 0,
        })
      );
  }, [
    invoices,
    clients,
    enquiries,
    performanceNames,
    performanceType,
  ]);

  // =====================================================
  // TOP PERFORMERS
  // =====================================================

  const topPerformers = useMemo(() => {
    return performanceData.slice(
      0,
      topLimit
    );
  }, [
    performanceData,
    topLimit,
  ]);

  // =====================================================
  // TOTAL REVENUE
  // =====================================================

  const totalRevenue = useMemo(() => {
    return performanceData.reduce(
      (total, item) =>
        total + item.revenue,
      0
    );
  }, [performanceData]);

  // =====================================================
  // TOTAL INVOICES
  // =====================================================

  const totalPerformanceInvoices =
    useMemo(() => {
      return performanceData.reduce(
        (total, item) =>
          total + item.invoices,
        0
      );
    }, [performanceData]);

  // =====================================================
  // TOTAL CLIENTS
  // =====================================================
  // FIX:
  // Calculate Associated Clients directly
  // from the client API data instead of
  // using performanceData.
  //
  // This prevents clients from becoming 0
  // when their associated person/franchisee
  // has no revenue record.
  // =====================================================

  const totalPerformanceClients =
    useMemo(() => {
      return clients.reduce(
        (total, client) => {
          const name =
            getPerformanceName(client);

          if (
            name &&
            name !== "Unassigned"
          ) {
            return total + 1;
          }

          return total;
        },
        0
      );
    }, [
      clients,
      performanceType,
    ]);

  // =====================================================
  // #1 PERFORMER
  // =====================================================

  const topPerformer =
    topPerformers.length > 0
      ? topPerformers[0]
      : null;

  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = useMemo(() => {
    return topPerformers.map(
      (item) => ({
        name:
          item.name.length > 18
            ? `${item.name.slice(
                0,
                18
              )}...`
            : item.name,

        fullName: item.name,

        revenue: Number(
          item.revenue.toFixed(2)
        ),
      })
    );
  }, [topPerformers]);

  // =====================================================
  // CURRENCY FORMAT
  // =====================================================

  const formatCurrency = (value) => {
    if (!Number.isFinite(value)) {
      return "₹0";
    }

    const abs = Math.abs(value);

    if (abs >= 10000000) {
      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;
    }

    if (abs >= 100000) {
      return `₹${(
        value / 100000
      ).toFixed(2)} L`;
    }

    if (abs >= 1000) {
      return `₹${(
        value / 1000
      ).toFixed(1)}K`;
    }

    return `₹${Math.round(
      value
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // FULL CURRENCY
  // =====================================================

  const formatFullCurrency = (
    value
  ) => {
    return `₹${Math.round(
      value
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // PAGE LABEL
  // =====================================================

  const performanceLabel =
    performanceType === "bd"
      ? "BD Members"
      : performanceType ===
        "teamLeader"
      ? "Team Leaders"
      : "Franchisees";

  const singularLabel =
    performanceType === "bd"
      ? "BD Member"
      : performanceType ===
        "teamLeader"
      ? "Team Leader"
      : "Franchisee";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-500" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading performance analytics...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-2xl border border-rose-100 bg-white p-10 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Performance data could not be loaded
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchData}
            className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-500">
            Analytics
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Top Performance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Identify the highest-performing BD Members,
            Team Leaders and Franchisees based on revenue generated.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-600"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

      </div>

      {/* =================================================
          PERFORMANCE TYPE SELECTOR
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-2.5">
            <Trophy className="h-5 w-5 text-violet-600" />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              Performance Category
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Select whose performance you want to see.
            </p>
          </div>

        </div>

        <div className="grid gap-3 md:grid-cols-3">

          {/* BD */}

          <button
            onClick={() =>
              setPerformanceType("bd")
            }
            className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
              performanceType === "bd"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                performanceType === "bd"
                  ? "bg-violet-100"
                  : "bg-slate-100"
              }`}
            >
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">
                BD Members
              </p>

              <p className="text-xs text-slate-400">
                Top BD performers
              </p>
            </div>
          </button>

          {/* TEAM LEADERS */}

          <button
            onClick={() =>
              setPerformanceType(
                "teamLeader"
              )
            }
            className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
              performanceType ===
              "teamLeader"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                performanceType ===
                "teamLeader"
                  ? "bg-violet-100"
                  : "bg-slate-100"
              }`}
            >
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">
                Team Leaders
              </p>

              <p className="text-xs text-slate-400">
                Top team leaders
              </p>
            </div>
          </button>

          {/* FRANCHISEES */}

          <button
            onClick={() =>
              setPerformanceType(
                "franchisee"
              )
            }
            className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
              performanceType ===
              "franchisee"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                performanceType ===
                "franchisee"
                  ? "bg-violet-100"
                  : "bg-slate-100"
              }`}
            >
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">
                Franchisees
              </p>

              <p className="text-xs text-slate-400">
                Top revenue-generating franchisees
              </p>
            </div>
          </button>

        </div>

      </section>

      {/* =================================================
          TOP LIMIT
      ================================================= */}

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="font-semibold text-slate-800">
            Show Top Performers
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Rankings are sorted by total revenue generated.
          </p>
        </div>

        <select
          value={topLimit}
          onChange={(e) =>
            setTopLimit(
              Number(e.target.value)
            )
          }
          className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 outline-none"
        >
          <option value={5}>
            Top 5
          </option>

          <option value={10}>
            Top 10
          </option>

          <option value={15}>
            Top 15
          </option>

          <option value={20}>
            Top 20
          </option>
        </select>

      </section>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* TOP PERFORMER */}

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            #1 {singularLabel}
          </p>

          <h2 className="mt-1 truncate text-xl font-bold text-slate-800">
            {topPerformer?.name ||
              "No Data"}
          </h2>

          <p className="mt-2 text-sm font-semibold text-amber-600">
            {topPerformer
              ? formatCurrency(
                  topPerformer.revenue
                )
              : "₹0"}
          </p>

        </div>

        {/* TOTAL REVENUE */}

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
            <IndianRupee className="h-6 w-6 text-cyan-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Revenue
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {formatCurrency(
              totalRevenue
            )}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Across all ranked {performanceLabel.toLowerCase()}
          </p>

        </div>

        {/* INVOICES */}

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <FileText className="h-6 w-6 text-violet-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Invoices
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {totalPerformanceInvoices.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Revenue-generating invoices
          </p>

        </div>

        {/* CLIENTS */}

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Associated Clients
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {totalPerformanceClients.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Clients linked to the selected category
          </p>

        </div>

      </section>

      {/* =================================================
          NO DATA
      ================================================= */}

      {topPerformers.length ===
        0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />

          <h2 className="mt-4 text-xl font-bold text-slate-700">
            No performance data available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            No revenue records were found for this category.
          </p>

        </div>
      )}

      {/* =================================================
          TOP PERFORMERS CHART
      ================================================= */}

      {topPerformers.length >
        0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Trophy className="h-5 w-5 text-amber-500" />

                <h2 className="text-lg font-bold text-slate-800">
                  Top {topLimit}{" "}
                  {performanceLabel}
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Ranked by total revenue generated.
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
              Revenue = Total Bill Amount
            </div>

          </div>

          <div className="h-[400px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 30,
                  left: 30,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    formatCurrency(
                      value
                    )
                  }
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatFullCurrency(
                      Number(value)
                    ),
                    "Revenue",
                  ]}
                  labelFormatter={(
                    label,
                    payload
                  ) =>
                    payload?.[0]
                      ?.payload
                      ?.fullName ||
                    label
                  }
                  contentStyle={{
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px rgba(15,23,42,0.08)",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  radius={[
                    0,
                    8,
                    8,
                    0,
                  ]}
                  fill="#7c3aed"
                  barSize={30}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>
      )}

      {/* =================================================
          PERFORMANCE TABLE
      ================================================= */}

      {topPerformers.length >
        0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Medal className="h-5 w-5 text-violet-500" />

                <h2 className="text-lg font-bold text-slate-800">
                  Performance Details
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Detailed ranking of the selected top {performanceLabel.toLowerCase()}.
              </p>

            </div>

            <div className="rounded-xl bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-600">
              {performanceLabel}
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-sm">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                  <th className="px-5 py-4">
                    Rank
                  </th>

                  <th className="px-5 py-4">
                    {singularLabel}
                  </th>

                  <th className="px-5 py-4 text-right">
                    Revenue
                  </th>

                  <th className="px-5 py-4 text-right">
                    Invoices
                  </th>

                  <th className="px-5 py-4 text-right">
                    Clients
                  </th>

                  <th className="px-5 py-4 text-right">
                    Enquiries
                  </th>

                  <th className="px-5 py-4 text-right">
                    Avg Revenue / Invoice
                  </th>

                </tr>

              </thead>

              <tbody>

                {topPerformers.map(
                  (item, index) => (

                    <tr
                      key={`${item.name}-${index}`}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      {/* RANK */}

                      <td className="px-5 py-4">

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : index === 1
                              ? "bg-slate-200 text-slate-700"
                              : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          {item.rank}
                        </div>

                      </td>

                      {/* NAME */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">

                            {performanceType ===
                            "franchisee" ? (
                              <Building2 className="h-4 w-4 text-violet-600" />
                            ) : performanceType ===
                              "teamLeader" ? (
                              <Users className="h-4 w-4 text-violet-600" />
                            ) : (
                              <UserRound className="h-4 w-4 text-violet-600" />
                            )}

                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {item.name}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* REVENUE */}

                      <td className="px-5 py-4 text-right font-bold text-slate-800">
                        {formatFullCurrency(
                          item.revenue
                        )}
                      </td>

                      {/* INVOICES */}

                      <td className="px-5 py-4 text-right text-slate-600">
                        {item.invoices.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* CLIENTS */}

                      <td className="px-5 py-4 text-right text-slate-600">
                        {item.clients.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* ENQUIRIES */}

                      <td className="px-5 py-4 text-right text-slate-600">
                        {item.enquiries.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* AVERAGE */}

                      <td className="px-5 py-4 text-right font-semibold text-violet-600">
                        {formatFullCurrency(
                          item.averageRevenue
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* =================================================
          API STATUS
      ================================================= */}

      <section className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-5">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Sarthi360 API Connection
            </p>

            <p className="text-xs text-slate-500">
              Performance data is being calculated from live invoice, client and enquiry API data.
            </p>

          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Live API Data

          </div>

        </div>

      </section>

    </div>
  );
}

export default TopPerformance;