import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Users,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Filter,
  Activity,
  Table2,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Franchisees() {
  // =====================================================
  // STATE
  // =====================================================

  const [clients, setClients] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFranchisee, setSelectedFranchisee] =
    useState("all");

  const [selectedBDMember, setSelectedBDMember] =
    useState("all");

  const [selectedTeamLeader, setSelectedTeamLeader] =
    useState("all");

  const [viewMode, setViewMode] = useState("charts");

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        clientsResponse,
        enquiriesResponse,
      ] = await Promise.all([
        fetch(
  "/api/dashboard/clients"
),
fetch(
  "/api/dashboard/enquiries"
),
      ]);

      if (
        !clientsResponse.ok ||
        !enquiriesResponse.ok
      ) {
        throw new Error(
          "Unable to fetch franchisee data"
        );
      }

      const clientsResult =
        await clientsResponse.json();

      const enquiriesResult =
        await enquiriesResponse.json();

      const clientData = Array.isArray(
        clientsResult
      )
        ? clientsResult
        : clientsResult?.data || [];

      const enquiryData = Array.isArray(
        enquiriesResult
      )
        ? enquiriesResult
        : enquiriesResult?.data || [];

      setClients(clientData);
      setEnquiries(enquiryData);
    } catch (err) {
      console.error(
        "Franchisee API Error:",
        err
      );

      setError(
        "Unable to load franchisee analytics. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // HELPERS
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

  const getFranchisee = (item) => {
    const value = getValue(
      item,
      [
        "franchiseeName",
        "franchisee",
        "franchisee_name",
        "FranchiseeName",
        "Franchisee",
        "FRANCHISEE",
        "FRANCHISEE_NAME",
        "Franchisee_Name",
      ]
    );

    return value || "Unassigned";
  };

  const getBDMember = (item) => {
    const value = getValue(
      item,
      [
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
      ]
    );

    return value || "Unassigned";
  };

  const getTeamLeader = (item) => {
    const value = getValue(
      item,
      [
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
      ]
    );

    return value || "Unassigned";
  };

  const getClientStatus = (item) => {
    return String(
      item?.status || ""
    )
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // FRANCHISEE OPTIONS
  // =====================================================

  const franchiseeOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((client) => {
      names.add(
        getFranchisee(client)
      );
    });

    enquiries.forEach((enquiry) => {
      names.add(
        getFranchisee(enquiry)
      );
    });

    return [...names]
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b)
      );
  }, [clients, enquiries]);

  // =====================================================
  // BD MEMBER OPTIONS
  // =====================================================

  const bdMemberOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((client) => {
      const name =
        getBDMember(client);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    enquiries.forEach((enquiry) => {
      const name =
        getBDMember(enquiry);

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
  }, [clients, enquiries]);

  // =====================================================
  // TEAM LEADER OPTIONS
  // =====================================================

  const teamLeaderOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((client) => {
      const name =
        getTeamLeader(client);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    enquiries.forEach((enquiry) => {
      const name =
        getTeamLeader(enquiry);

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
  }, [clients, enquiries]);

  // =====================================================
  // FILTERED ENQUIRIES
  // =====================================================

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(
      (enquiry) => {
        const franchiseeMatch =
          selectedFranchisee ===
            "all" ||
          getFranchisee(enquiry) ===
            selectedFranchisee;

        const bdMemberMatch =
          selectedBDMember ===
            "all" ||
          getBDMember(enquiry) ===
            selectedBDMember;

        const teamLeaderMatch =
          selectedTeamLeader ===
            "all" ||
          getTeamLeader(enquiry) ===
            selectedTeamLeader;

        return (
          franchiseeMatch &&
          bdMemberMatch &&
          teamLeaderMatch
        );
      }
    );
  }, [
    enquiries,
    selectedFranchisee,
    selectedBDMember,
    selectedTeamLeader,
  ]);

  // =====================================================
  // MATCHING FRANCHISEES
  // =====================================================

  const matchingFranchisees =
    useMemo(() => {
      const franchisees = new Set();

      filteredEnquiries.forEach(
        (enquiry) => {
          const franchisee =
            getFranchisee(enquiry);

          if (
            franchisee &&
            franchisee !==
              "Unassigned"
          ) {
            franchisees.add(
              franchisee
            );
          }
        }
      );

      return franchisees;
    }, [filteredEnquiries]);

  // =====================================================
  // FILTERED CLIENTS
  // =====================================================

  const filteredClients = useMemo(() => {
    const bdOrTeamLeaderFilterActive =
      selectedBDMember !== "all" ||
      selectedTeamLeader !== "all";

    if (
      !bdOrTeamLeaderFilterActive
    ) {
      if (
        selectedFranchisee ===
        "all"
      ) {
        return clients;
      }

      return clients.filter(
        (client) =>
          getFranchisee(client) ===
          selectedFranchisee
      );
    }

    return clients.filter(
      (client) => {
        const franchisee =
          getFranchisee(client);

        if (
          selectedFranchisee !==
            "all" &&
          franchisee !==
            selectedFranchisee
        ) {
          return false;
        }

        return matchingFranchisees.has(
          franchisee
        );
      }
    );
  }, [
    clients,
    matchingFranchisees,
    selectedFranchisee,
    selectedBDMember,
    selectedTeamLeader,
  ]);

  // =====================================================
  // FRANCHISEE COUNT
  // =====================================================

  const totalFranchisees =
    useMemo(() => {
      const names = new Set();

      filteredClients.forEach(
        (client) => {
          const name =
            getFranchisee(client);

          if (
            name &&
            name !== "Unassigned"
          ) {
            names.add(name);
          }
        }
      );

      filteredEnquiries.forEach(
        (enquiry) => {
          const name =
            getFranchisee(enquiry);

          if (
            name &&
            name !== "Unassigned"
          ) {
            names.add(name);
          }
        }
      );

      return names.size;
    }, [
      filteredClients,
      filteredEnquiries,
    ]);

  // =====================================================
  // KPIs
  // =====================================================

  const totalClients =
    filteredClients.length;

  const totalEnquiries =
    filteredEnquiries.length;

  const activeClients =
    filteredClients.filter(
      (client) =>
        getClientStatus(client) ===
        "active"
    ).length;

  const unassignedClients =
    filteredClients.filter(
      (client) =>
        getFranchisee(client) ===
        "Unassigned"
    ).length;

  const unassignedEnquiries =
    filteredEnquiries.filter(
      (enquiry) =>
        getFranchisee(enquiry) ===
        "Unassigned"
    ).length;

  // =====================================================
  // COVERAGE
  // =====================================================

  const clientCoverage =
    totalClients > 0
      ? ((totalClients -
          unassignedClients) /
          totalClients) *
        100
      : 0;

  const enquiryCoverage =
    totalEnquiries > 0
      ? ((totalEnquiries -
          unassignedEnquiries) /
          totalEnquiries) *
        100
      : 0;

  // =====================================================
  // CLIENT DISTRIBUTION
  // =====================================================

  const clientDistribution =
    useMemo(() => {
      const counts = {};

      filteredClients.forEach(
        (client) => {
          const name =
            getFranchisee(client);

          counts[name] =
            (counts[name] || 0) +
            1;
        }
      );

      return Object.entries(counts)
        .map(
          ([name, clients]) => ({
            name,
            clients,
          })
        )
        .sort(
          (a, b) =>
            b.clients -
            a.clients
        )
        .slice(0, 10);
    }, [filteredClients]);

  // =====================================================
  // ENQUIRY DISTRIBUTION
  // =====================================================

  const enquiryDistribution =
    useMemo(() => {
      const counts = {};

      filteredEnquiries.forEach(
        (enquiry) => {
          const name =
            getFranchisee(enquiry);

          counts[name] =
            (counts[name] || 0) +
            1;
        }
      );

      return Object.entries(counts)
        .map(
          ([name, enquiries]) => ({
            name,
            enquiries,
          })
        )
        .sort(
          (a, b) =>
            b.enquiries -
            a.enquiries
        )
        .slice(0, 10);
    }, [filteredEnquiries]);

  // =====================================================
  // NETWORK MIX
  // =====================================================

  const networkMix =
    useMemo(() => {
      return [
        {
          name: "Assigned Clients",
          value:
            totalClients -
            unassignedClients,
        },
        {
          name: "Unassigned Clients",
          value:
            unassignedClients,
        },
      ].filter(
        (item) =>
          item.value > 0
      );
    }, [
      totalClients,
      unassignedClients,
    ]);

  // =====================================================
  // TABLE DATA
  // =====================================================

  const tableData = useMemo(() => {
    const franchiseeMap = {};

    filteredClients.forEach(
      (client) => {
        const franchisee =
          getFranchisee(client);

        if (
          !franchiseeMap[
            franchisee
          ]
        ) {
          franchiseeMap[
            franchisee
          ] = {
            franchisee,
            clients: 0,
            activeClients: 0,
            enquiries: 0,
          };
        }

        franchiseeMap[
          franchisee
        ].clients += 1;

        if (
          getClientStatus(client) ===
          "active"
        ) {
          franchiseeMap[
            franchisee
          ].activeClients += 1;
        }
      }
    );

    filteredEnquiries.forEach(
      (enquiry) => {
        const franchisee =
          getFranchisee(enquiry);

        if (
          !franchiseeMap[
            franchisee
          ]
        ) {
          franchiseeMap[
            franchisee
          ] = {
            franchisee,
            clients: 0,
            activeClients: 0,
            enquiries: 0,
          };
        }

        franchiseeMap[
          franchisee
        ].enquiries += 1;
      }
    );

    return Object.values(
      franchiseeMap
    ).sort(
      (a, b) =>
        b.clients -
        a.clients
    );
  }, [
    filteredClients,
    filteredEnquiries,
  ]);

  // =====================================================
  // INSIGHTS
  // =====================================================

  const insights =
    useMemo(() => {
      const result = [];

      if (
        totalFranchisees === 0 &&
        totalClients === 0 &&
        totalEnquiries === 0
      ) {
        return [
          {
            title:
              "No data for current filters",
            text:
              "There are no client or enquiry records matching the selected filters.",
            type: "info",
          },
        ];
      }

      if (
        clientCoverage >= 90
      ) {
        result.push({
          title:
            "Strong client coverage",
          text: `${clientCoverage.toFixed(
            1
          )}% of the currently filtered clients are associated with a franchisee.`,
          type: "positive",
        });
      } else {
        result.push({
          title:
            "Client assignment needs attention",
          text: `${unassignedClients.toLocaleString(
            "en-IN"
          )} filtered clients currently have no franchisee association.`,
          type: "attention",
        });
      }

      if (
        enquiryCoverage >= 90
      ) {
        result.push({
          title:
            "Strong enquiry coverage",
          text: `${enquiryCoverage.toFixed(
            1
          )}% of the currently filtered enquiries are associated with a franchisee.`,
          type: "positive",
        });
      } else {
        result.push({
          title:
            "Some enquiries are unassigned",
          text: `${unassignedEnquiries.toLocaleString(
            "en-IN"
          )} filtered enquiries currently have no franchisee association.`,
          type: "attention",
        });
      }

      if (
        selectedBDMember !==
        "all"
      ) {
        result.push({
          title:
            "BD Member filter active",
          text: `Analytics are currently showing the franchisee network associated with ${selectedBDMember}.`,
          type: "info",
        });
      } else if (
        selectedTeamLeader !==
        "all"
      ) {
        result.push({
          title:
            "Team Leader filter active",
          text: `Analytics are currently showing the franchisee network associated with ${selectedTeamLeader}.`,
          type: "info",
        });
      } else if (
        selectedFranchisee !==
        "all"
      ) {
        result.push({
          title:
            "Franchisee filter active",
          text: `Analytics are currently showing data for ${selectedFranchisee}.`,
          type: "info",
        });
      } else {
        result.push({
          title:
            "Franchisee network overview",
          text: `The dashboard currently identifies ${totalFranchisees.toLocaleString(
            "en-IN"
          )} franchisees across the available client and enquiry data.`,
          type: "info",
        });
      }

      return result.slice(0, 3);
    }, [
      totalFranchisees,
      clientCoverage,
      enquiryCoverage,
      unassignedClients,
      unassignedEnquiries,
      selectedBDMember,
      selectedTeamLeader,
      selectedFranchisee,
    ]);

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSelectedFranchisee(
      "all"
    );

    setSelectedBDMember(
      "all"
    );

    setSelectedTeamLeader(
      "all"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-500" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading franchisee analytics...
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
            Franchisee data could not be loaded
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
          HEADER + FILTERS
      ================================================= */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-violet-500">
            Sarthi360 Analytics
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Franchisee Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Understand franchisee coverage across clients and enquiries.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <Filter className="h-4 w-4 text-violet-500" />

          {/* FRANCHISEE */}

          <select
            value={selectedFranchisee}
            onChange={(e) =>
              setSelectedFranchisee(
                e.target.value
              )
            }
            className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm outline-none focus:border-violet-400"
          >

            <option value="all">
              All Franchisees
            </option>

            {franchiseeOptions
              .filter(
                (name) =>
                  name !==
                  "Unassigned"
              )
              .map((name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              ))}

          </select>

          {/* BD MEMBER */}

          <select
            value={selectedBDMember}
            onChange={(e) =>
              setSelectedBDMember(
                e.target.value
              )
            }
            className="rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm outline-none focus:border-cyan-400"
          >

            <option value="all">
              All BD Members
            </option>

            {bdMemberOptions.map(
              (name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              )
            )}

          </select>

          {/* TEAM LEADER */}

          <select
            value={selectedTeamLeader}
            onChange={(e) =>
              setSelectedTeamLeader(
                e.target.value
              )
            }
            className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm outline-none focus:border-emerald-400"
          >

            <option value="all">
              All Team Leaders
            </option>

            {teamLeaderOptions.map(
              (name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              )
            )}

          </select>

          {/* RESET */}

          <button
            onClick={resetFilters}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Reset
          </button>

        </div>

      </div>

      {/* =================================================
          ACTIVE FILTERS
      ================================================= */}

      {(selectedFranchisee !==
        "all" ||
        selectedBDMember !==
        "all" ||
        selectedTeamLeader !==
        "all") && (

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">

          <span className="text-xs font-semibold text-violet-700">
            Active Filters:
          </span>

          {selectedFranchisee !==
            "all" && (
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
              Franchisee:{" "}
              {selectedFranchisee}
            </span>
          )}

          {selectedBDMember !==
            "all" && (
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm">
              BD Member:{" "}
              {selectedBDMember}
            </span>
          )}

          {selectedTeamLeader !==
            "all" && (
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              Team Leader:{" "}
              {selectedTeamLeader}
            </span>
          )}

        </div>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">

            <Building2 className="h-6 w-6 text-violet-600" />

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Franchisees
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {totalFranchisees.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Based on current filters
          </p>

        </div>

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">

            <Users className="h-6 w-6 text-cyan-600" />

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Associated Clients
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {totalClients.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-cyan-600">
            {clientCoverage.toFixed(
              1
            )}% franchisee coverage
          </p>

        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">

            <ClipboardList className="h-6 w-6 text-emerald-600" />

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Associated Enquiries
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {totalEnquiries.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-emerald-600">
            {enquiryCoverage.toFixed(
              1
            )}% franchisee coverage
          </p>

        </div>

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">

            <CheckCircle2 className="h-6 w-6 text-amber-600" />

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Active Clients
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {activeClients.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Within current selection
          </p>

        </div>

      </div>

      {/* =================================================
          TABLE / CHART VIEW BUTTON
      ================================================= */}

      <div className="flex justify-end">

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          <button
            onClick={() =>
              setViewMode("charts")
            }
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              viewMode === "charts"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >

            <BarChart3 className="h-4 w-4" />

            Chart View

          </button>

          <button
            onClick={() =>
              setViewMode("table")
            }
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              viewMode === "table"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >

            <Table2 className="h-4 w-4" />

            Table View

          </button>

        </div>

      </div>

      {/* =================================================
          TABLE VIEW
      ================================================= */}

      {viewMode === "table" ? (

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                Franchisee Table View
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing franchisee data based on the currently selected filters.
              </p>

            </div>

            <div className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
              {tableData.length.toLocaleString(
                "en-IN"
              )} Franchisees
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Franchisee
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Clients
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Clients
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Enquiries
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Client Coverage
                  </th>

                </tr>

              </thead>

              <tbody>

                {tableData.length >
                0 ? (

                  tableData.map(
                    (row, index) => {

                      const rowCoverage =
                        row.clients >
                        0
                          ? (row.activeClients /
                              row.clients) *
                            100
                          : 0;

                      return (
                        <tr
                          key={`${row.franchisee}-${index}`}
                          className="border-b border-slate-100 transition hover:bg-violet-50/40"
                        >

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">

                                <Building2 className="h-4 w-4 text-violet-600" />

                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {row.franchisee}
                              </span>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {row.clients.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                            {row.activeClients.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-cyan-600">
                            {row.enquiries.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-violet-500"
                                  style={{
                                    width: `${Math.min(
                                      rowCoverage,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-sm font-semibold text-slate-600">
                                {rowCoverage.toFixed(
                                  1
                                )}%
                              </span>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-slate-400"
                    >
                      No franchisee data available for the selected filters.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      ) : (

        <>
          {/* =================================================
              CLIENT DISTRIBUTION
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-100 p-2.5">

                <Users className="h-5 w-5 text-cyan-600" />

              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Client Distribution
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Client records associated with each franchisee.
                </p>

              </div>

            </div>

            <div className="mt-5 h-80">

              {clientDistribution.length >
              0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      clientDistribution
                    }
                    layout="vertical"
                    margin={{
                      left: 30,
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
                      width={150}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="clients"
                      name="Clients"
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
                  No client-franchisee data available for the selected filters.
                </div>

              )}

            </div>

          </section>

          {/* =================================================
              ENQUIRY DISTRIBUTION + COVERAGE
          ================================================= */}

          <div className="grid gap-6 xl:grid-cols-2">

            {/* ENQUIRY DISTRIBUTION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-100 p-2.5">

                  <ClipboardList className="h-5 w-5 text-emerald-600" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Enquiry Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enquiry records associated with franchisees.
                  </p>

                </div>

              </div>

              <div className="mt-5 h-72">

                {enquiryDistribution.length >
                0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        enquiryDistribution
                      }
                      layout="vertical"
                      margin={{
                        left: 30,
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
                        tick={{
                          fontSize: 10,
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="enquiries"
                        name="Enquiries"
                        fill="#10b981"
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
                    No enquiry-franchisee data available for the selected filters.
                  </div>

                )}

              </div>

            </section>

            {/* FRANCHISEE COVERAGE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-violet-100 p-2.5">

                  <Activity className="h-5 w-5 text-violet-600" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Franchisee Coverage
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Assigned versus unassigned client records.
                  </p>

                </div>

              </div>

              <div className="mt-4 h-64">

                {networkMix.length >
                0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={networkMix}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={4}
                      >

                        {networkMix.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                index ===
                                0
                                  ? "#8b5cf6"
                                  : "#f59e0b"
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No coverage data available for the selected filters.
                  </div>

                )}

              </div>

            </section>

          </div>

          {/* =================================================
              ATTENTION
          ================================================= */}

          <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-amber-100 p-3">

                <AlertCircle className="h-6 w-6 text-amber-600" />

              </div>

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                  Attention Required
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {(
                    unassignedClients +
                    unassignedEnquiries
                  ).toLocaleString(
                    "en-IN"
                  )}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Combined client and enquiry records currently do not have a franchisee association within the selected filters.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              SMART INSIGHTS
          ================================================= */}

          <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-violet-100 p-2.5">

                <Lightbulb className="h-5 w-5 text-violet-600" />

              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Smart Franchisee Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Key observations from the currently filtered franchisee data.
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">

              {insights.map(
                (insight, index) => {

                  const attention =
                    insight.type ===
                    "attention";

                  const positive =
                    insight.type ===
                    "positive";

                  return (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${
                        attention
                          ? "border-rose-100 bg-rose-50"
                          : positive
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-violet-100 bg-white"
                      }`}
                    >

                      <p className="text-sm font-bold text-slate-800">
                        {insight.title}
                      </p>

                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        {insight.text}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default Franchisees;