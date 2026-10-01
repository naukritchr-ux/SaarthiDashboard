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

import {
  getPeriodRange,
  getPeriodLabel,
} from "../utils/dateFilter";

const CLIENTS_API =
  "/api/dashboard/clients";

const ENQUIRIES_API =
  "/api/dashboard/enquiries";

const COLORS = {
  purple: "#8065a5",
  purpleDark: "#684d8c",
  purpleLight: "#eee7f8",

  cyan: "#06b6d4",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#f43f5e",

  text: "#3f344a",
  muted: "#81768a",
  border: "#e7def5",
  background: "#faf8ff",
};

/* ============================================================
   DATA EXTRACTION
============================================================ */

function extractArray(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (!result || typeof result !== "object") {
    return [];
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.rows)) {
    return result.rows;
  }

  if (Array.isArray(result.results)) {
    return result.results;
  }

  if (Array.isArray(result.records)) {
    return result.records;
  }

  if (Array.isArray(result.items)) {
    return result.items;
  }

  if (result.data && typeof result.data === "object") {
    if (Array.isArray(result.data.data)) {
      return result.data.data;
    }

    if (Array.isArray(result.data.rows)) {
      return result.data.rows;
    }

    if (Array.isArray(result.data.results)) {
      return result.data.results;
    }

    if (Array.isArray(result.data.records)) {
      return result.data.records;
    }

    if (Array.isArray(result.data.items)) {
      return result.data.items;
    }
  }

  return [];
}

/* ============================================================
   VALUE HELPER
============================================================ */

function getValue(item, keys) {
  if (!item) {
    return "";
  }

  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null
    ) {
      const value = String(item[key]).trim();

      if (value !== "") {
        return value;
      }
    }
  }

  return "";
}

/* ============================================================
   FRANCHISEE FIELD
============================================================ */

function getFranchisee(item) {
  const value = getValue(item, [
    "franchiseeName",
    "franchisee_name",
    "franchisee",
    "FranchiseeName",
    "Franchisee",
    "FRANCHISEE",
    "FRANCHISEE_NAME",
    "Franchisee_Name",
    "franchiseName",
    "franchise_name",
    "FranchiseName",
    "FRANCHISE_NAME",
    "franchise",
    "Franchise",
  ]);

  return value || "Unassigned";
}

/* ============================================================
   BD MEMBER
============================================================ */

function getBDMember(item) {
  const value = getValue(item, [
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
    "businessDevelopment",
    "business_development",
    "businessDevelopmentMember",
    "business_development_member",
    "businessDevelopmentMemberName",
    "business_development_member_name",
  ]);

  return value || "Unassigned";
}

/* ============================================================
   TEAM LEADER
============================================================ */

function getTeamLeader(item) {
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
}

/* ============================================================
   DATE PARSER
============================================================ */

function parseDate(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  const ddmmyyyy =
    text.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
    );

  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/* ============================================================
   CLIENT DATE
============================================================ */

function getClientDate(item) {
  return parseDate(
    getValue(item, [
      "dateClientAcquired",
      "date_client_acquired",
      "clientAcquisitionDate",
      "client_acquisition_date",
      "dateOfClientAllocation",
      "date_of_client_allocation",
      "allocationDate",
      "allocation_date",
      "created_at",
      "createdAt",
      "created_date",
      "createdDate",
      "date",
    ])
  );
}

/* ============================================================
   ENQUIRY DATE
============================================================ */

function getEnquiryDate(item) {
  return parseDate(
    getValue(item, [
      "created_at",
      "createdAt",
      "created_date",
      "createdDate",
      "enquiryDate",
      "enquiry_date",
      "dateOfEnquiry",
      "date_of_enquiry",
      "dateOfAllocation",
      "date_of_allocation",
      "allocationDate",
      "allocation_date",
      "enquiryCreatedDate",
      "enquiry_created_date",
      "updated_at",
      "updatedAt",
      "date",
    ])
  );
}

/* ============================================================
   CLIENT STATUS
============================================================ */

function getClientStatus(item) {
  return String(
    item?.status ??
      item?.Status ??
      item?.clientStatus ??
      item?.client_status ??
      ""
  )
    .trim()
    .toLowerCase();
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Franchisees({ period = "all" }) {
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

  const [viewMode, setViewMode] =
    useState("charts");

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        clientsResponse,
        enquiriesResponse,
      ] = await Promise.all([
        fetch(CLIENTS_API),
        fetch(ENQUIRIES_API),
      ]);

      if (!clientsResponse.ok) {
        throw new Error(
          `Clients API returned ${clientsResponse.status}`
        );
      }

      if (!enquiriesResponse.ok) {
        throw new Error(
          `Enquiries API returned ${enquiriesResponse.status}`
        );
      }

      const clientsJson =
        await clientsResponse.json();

      const enquiriesJson =
        await enquiriesResponse.json();

      const clientData =
        extractArray(clientsJson);

      const enquiryData =
        extractArray(enquiriesJson);

      console.log(
        "Sarthi360 Franchisees - Clients:",
        clientData.length
      );

      console.log(
        "Sarthi360 Franchisees - Enquiries:",
        enquiryData.length
      );

      if (enquiryData.length > 0) {
        console.log(
          "Sarthi360 Franchisees - First enquiry:",
          enquiryData[0]
        );

        console.log(
          "Sarthi360 Franchisees - First enquiry franchisee:",
          getFranchisee(enquiryData[0])
        );
      }

      setClients(clientData);
      setEnquiries(enquiryData);
    } catch (err) {
      console.error(
        "Franchisees API Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load franchisee data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ==========================================================
     PERIOD
  ========================================================== */

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  const isDateInPeriod = (date) => {
    if (period === "all") {
      return true;
    }

    if (
      !date ||
      !periodRange.startDate ||
      !periodRange.endDate
    ) {
      return false;
    }

    return (
      date >= periodRange.startDate &&
      date <= periodRange.endDate
    );
  };

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const franchiseeOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((item) => {
      const name = getFranchisee(item);

      if (name) {
        names.add(name);
      }
    });

    enquiries.forEach((item) => {
      const name = getFranchisee(item);

      if (name) {
        names.add(name);
      }
    });

    return Array.from(names)
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b)
      );
  }, [clients, enquiries]);

  const bdMemberOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((item) => {
      const name = getBDMember(item);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    enquiries.forEach((item) => {
      const name = getBDMember(item);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    return Array.from(names).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [clients, enquiries]);

  const teamLeaderOptions = useMemo(() => {
    const names = new Set();

    clients.forEach((item) => {
      const name = getTeamLeader(item);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    enquiries.forEach((item) => {
      const name = getTeamLeader(item);

      if (
        name &&
        name !== "Unassigned"
      ) {
        names.add(name);
      }
    });

    return Array.from(names).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [clients, enquiries]);

  /* ==========================================================
     FILTER CLIENTS
  ========================================================== */

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (
        !isDateInPeriod(
          getClientDate(client)
        )
      ) {
        return false;
      }

      if (
        selectedFranchisee !== "all" &&
        getFranchisee(client) !==
          selectedFranchisee
      ) {
        return false;
      }

      if (
        selectedBDMember !== "all" &&
        getBDMember(client) !==
          selectedBDMember
      ) {
        return false;
      }

      if (
        selectedTeamLeader !== "all" &&
        getTeamLeader(client) !==
          selectedTeamLeader
      ) {
        return false;
      }

      return true;
    });
  }, [
    clients,
    period,
    periodRange,
    selectedFranchisee,
    selectedBDMember,
    selectedTeamLeader,
  ]);

  /* ==========================================================
     FILTER ENQUIRIES
  ========================================================== */

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      if (
        !isDateInPeriod(
          getEnquiryDate(enquiry)
        )
      ) {
        return false;
      }

      if (
        selectedFranchisee !== "all" &&
        getFranchisee(enquiry) !==
          selectedFranchisee
      ) {
        return false;
      }

      if (
        selectedBDMember !== "all" &&
        getBDMember(enquiry) !==
          selectedBDMember
      ) {
        return false;
      }

      if (
        selectedTeamLeader !== "all" &&
        getTeamLeader(enquiry) !==
          selectedTeamLeader
      ) {
        return false;
      }

      return true;
    });
  }, [
    enquiries,
    period,
    periodRange,
    selectedFranchisee,
    selectedBDMember,
    selectedTeamLeader,
  ]);

  /* ==========================================================
     KPI
  ========================================================== */

  const franchiseeSet = useMemo(() => {
    const names = new Set();

    filteredClients.forEach((item) => {
      const name = getFranchisee(item);

      if (name !== "Unassigned") {
        names.add(name);
      }
    });

    filteredEnquiries.forEach((item) => {
      const name = getFranchisee(item);

      if (name !== "Unassigned") {
        names.add(name);
      }
    });

    return names;
  }, [
    filteredClients,
    filteredEnquiries,
  ]);

  const totalFranchisees =
    franchiseeSet.size;

  const assignedClients =
    filteredClients.filter(
      (item) =>
        getFranchisee(item) !==
        "Unassigned"
    ).length;

  const assignedEnquiries =
    filteredEnquiries.filter(
      (item) =>
        getFranchisee(item) !==
        "Unassigned"
    ).length;

  const activeClients =
    filteredClients.filter(
      (item) => {
        const status =
          getClientStatus(item);

        return (
          status === "active" ||
          status === "activated" ||
          status === "current"
        );
      }
    ).length;

  const unassignedClients =
    filteredClients.filter(
      (item) =>
        getFranchisee(item) ===
        "Unassigned"
    ).length;

  const unassignedEnquiries =
    filteredEnquiries.filter(
      (item) =>
        getFranchisee(item) ===
        "Unassigned"
    ).length;

  const clientCoverage =
    filteredClients.length > 0
      ? (assignedClients /
          filteredClients.length) *
        100
      : 0;

  const enquiryCoverage =
    filteredEnquiries.length > 0
      ? (assignedEnquiries /
          filteredEnquiries.length) *
        100
      : 0;

  /* ==========================================================
     CLIENT DISTRIBUTION
  ========================================================== */

  const clientDistribution =
    useMemo(() => {
      const counts = {};

      filteredClients.forEach((client) => {
        const name =
          getFranchisee(client);

        counts[name] =
          (counts[name] || 0) + 1;
      });

      return Object.entries(counts)
        .map(
          ([name, clientsCount]) => ({
            name,
            clients: clientsCount,
          })
        )
        .sort(
          (a, b) =>
            b.clients - a.clients
        )
        .slice(0, 12);
    }, [filteredClients]);

  /* ==========================================================
     ENQUIRY DISTRIBUTION
  ========================================================== */

  const enquiryDistribution =
    useMemo(() => {
      const counts = {};

      filteredEnquiries.forEach(
        (enquiry) => {
          const name =
            getFranchisee(enquiry);

          counts[name] =
            (counts[name] || 0) + 1;
        }
      );

      const result = Object.entries(
        counts
      )
        .map(
          ([name, enquiriesCount]) => ({
            name,
            enquiries: enquiriesCount,
          })
        )
        .sort(
          (a, b) =>
            b.enquiries -
            a.enquiries
        )
        .slice(0, 12);

      console.log(
        "Franchisee Enquiry Distribution:",
        result
      );

      return result;
    }, [filteredEnquiries]);

  /* ==========================================================
     COVERAGE
  ========================================================== */

  const coverageData = [
    {
      name: "Assigned Clients",
      value: assignedClients,
    },
    {
      name: "Unassigned Clients",
      value: unassignedClients,
    },
  ].filter(
    (item) => item.value > 0
  );

  /* ==========================================================
     TABLE DATA
  ========================================================== */

  const tableData = useMemo(() => {
    const map = {};

    filteredClients.forEach((client) => {
      const name =
        getFranchisee(client);

      if (!map[name]) {
        map[name] = {
          franchisee: name,
          clients: 0,
          activeClients: 0,
          enquiries: 0,
        };
      }

      map[name].clients += 1;

      const status =
        getClientStatus(client);

      if (
        status === "active" ||
        status === "activated" ||
        status === "current"
      ) {
        map[name].activeClients += 1;
      }
    });

    filteredEnquiries.forEach(
      (enquiry) => {
        const name =
          getFranchisee(enquiry);

        if (!map[name]) {
          map[name] = {
            franchisee: name,
            clients: 0,
            activeClients: 0,
            enquiries: 0,
          };
        }

        map[name].enquiries += 1;
      }
    );

    return Object.values(map).sort(
      (a, b) =>
        b.clients - a.clients
    );
  }, [
    filteredClients,
    filteredEnquiries,
  ]);

  /* ==========================================================
     INSIGHTS
  ========================================================== */

  const insights = useMemo(() => {
    const result = [];

    if (
      filteredClients.length === 0 &&
      filteredEnquiries.length === 0
    ) {
      return [
        {
          title: "No data for current filters",
          text:
            "There are no records matching the selected filters.",
          type: "info",
        },
      ];
    }

    if (clientCoverage >= 90) {
      result.push({
        title:
          "Strong client coverage",
        text:
          `${clientCoverage.toFixed(
            1
          )}% of filtered clients are associated with a franchisee.`,
        type: "positive",
      });
    } else {
      result.push({
        title:
          "Client assignment needs attention",
        text:
          `${unassignedClients.toLocaleString(
            "en-IN"
          )} clients currently have no franchisee association.`,
        type: "attention",
      });
    }

    if (enquiryCoverage >= 90) {
      result.push({
        title:
          "Strong enquiry coverage",
        text:
          `${enquiryCoverage.toFixed(
            1
          )}% of filtered enquiries are associated with a franchisee.`,
        type: "positive",
      });
    } else {
      result.push({
        title:
          "Some enquiries are unassigned",
        text:
          `${unassignedEnquiries.toLocaleString(
            "en-IN"
          )} enquiries currently have no franchisee association.`,
        type: "attention",
      });
    }

    result.push({
      title:
        "Franchisee network overview",
      text:
        `${totalFranchisees.toLocaleString(
          "en-IN"
        )} franchisees are represented in the current client and enquiry selection.`,
      type: "info",
    });

    return result.slice(0, 3);
  }, [
    filteredClients.length,
    filteredEnquiries.length,
    clientCoverage,
    enquiryCoverage,
    unassignedClients,
    unassignedEnquiries,
    totalFranchisees,
  ]);

  /* ==========================================================
     RESET
  ========================================================== */

  const resetFilters = () => {
    setSelectedFranchisee("all");
    setSelectedBDMember("all");
    setSelectedTeamLeader("all");
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: COLORS.purple,
          }}
        >
          <RefreshCw
            size={36}
            style={{
              animation:
                "franchiseSpin 1s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: "12px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Loading franchisee analytics...
          </p>
        </div>

        <style>
          {`
            @keyframes franchiseSpin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div
        style={{
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #fecaca",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <AlertCircle
            size={42}
            color="#ef4444"
          />

          <h2
            style={{
              margin: "14px 0 8px",
              color: COLORS.text,
            }}
          >
            Franchisee data could not be loaded
          </h2>

          <p
            style={{
              color: COLORS.muted,
              fontSize: "12px",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={fetchData}
            style={{
              marginTop: "16px",
              border: "none",
              background: COLORS.purple,
              color: "#ffffff",
              borderRadius: "9px",
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.purple,
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Sarthi360 Analytics
          </div>

          <h1
            style={{
              margin: "4px 0 0",
              color: COLORS.text,
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            Franchisee Overview
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              color: COLORS.muted,
              fontSize: "11px",
            }}
          >
            Understand franchisee coverage across clients and enquiries.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ViewButton
            active={viewMode === "charts"}
            onClick={() =>
              setViewMode("charts")
            }
            icon={<BarChart3 size={14} />}
            label="Chart View"
          />

          <ViewButton
            active={viewMode === "table"}
            onClick={() =>
              setViewMode("table")
            }
            icon={<Table2 size={14} />}
            label="Table View"
          />

          <div
            style={{
              background: COLORS.purpleLight,
              color: COLORS.purpleDark,
              borderRadius: "9px",
              padding: "8px 12px",
              fontSize: "10px",
              fontWeight: 800,
            }}
          >
            {getPeriodLabel(period)}
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <section
        style={{
          background: "#ffffff",
          border:
            `1px solid ${COLORS.border}`,
          borderRadius: "14px",
          padding: "15px",
          boxShadow:
            "0 3px 12px rgba(104,77,140,.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background:
                  COLORS.purpleLight,
                color: COLORS.purple,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter size={17} />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: COLORS.text,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Franchisee Filters
              </h3>

              <p
                style={{
                  margin: "2px 0 0",
                  color: COLORS.muted,
                  fontSize: "10px",
                }}
              >
                Filter by franchisee, BD member and team leader.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            style={{
              border: "none",
              background: "transparent",
              color: COLORS.purple,
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,minmax(0,1fr))",
            gap: "10px",
          }}
        >
          <FilterSelect
            value={selectedFranchisee}
            onChange={setSelectedFranchisee}
            options={franchiseeOptions}
            allLabel="All Franchisees"
          />

          <FilterSelect
            value={selectedBDMember}
            onChange={setSelectedBDMember}
            options={bdMemberOptions}
            allLabel="All BD Members"
          />

          <FilterSelect
            value={selectedTeamLeader}
            onChange={setSelectedTeamLeader}
            options={teamLeaderOptions}
            allLabel="All Team Leaders"
          />
        </div>
      </section>

      {/* KPI CARDS */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",
          gap: "14px",
        }}
      >
        <KpiCard
          icon={<Building2 size={19} />}
          label="Total Franchisees"
          value={totalFranchisees.toLocaleString(
            "en-IN"
          )}
          subtitle="Based on current filters"
          type="purple"
        />

        <KpiCard
          icon={<Users size={19} />}
          label="Assigned Clients"
          value={assignedClients.toLocaleString(
            "en-IN"
          )}
          subtitle={`${clientCoverage.toFixed(
            1
          )}% client coverage`}
          type="cyan"
        />

        <KpiCard
          icon={<ClipboardList size={19} />}
          label="Assigned Enquiries"
          value={assignedEnquiries.toLocaleString(
            "en-IN"
          )}
          subtitle={`${enquiryCoverage.toFixed(
            1
          )}% enquiry coverage`}
          type="green"
        />

        <KpiCard
          icon={<CheckCircle2 size={19} />}
          label="Active Clients"
          value={activeClients.toLocaleString(
            "en-IN"
          )}
          subtitle="Within current selection"
          type="orange"
        />
      </section>

      {/* CONTENT */}

      {viewMode === "table" ? (
        <FranchiseeTable rows={tableData} />
      ) : (
        <>
          {/* CLIENT DISTRIBUTION */}

          <ChartCard
            title="Client Distribution"
            subtitle="Client records associated with each franchisee."
            icon={<Users size={17} />}
            type="cyan"
          >
            <div
              style={{
                height: "310px",
              }}
            >
              {clientDistribution.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={clientDistribution}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#eee7f5"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fill: "#756b7d",
                        fontSize: 9,
                      }}
                      axisLine={{
                        stroke: "#ddd5e7",
                      }}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{
                        fill: "#665b6f",
                        fontSize: 9,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString(
                          "en-IN"
                        ),
                        "Clients",
                      ]}
                    />

                    <Bar
                      dataKey="clients"
                      name="Clients"
                      fill={COLORS.cyan}
                      radius={[
                        0,
                        5,
                        5,
                        0,
                      ]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No client distribution data available." />
              )}
            </div>
          </ChartCard>

          {/* ENQUIRIES + COVERAGE */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,minmax(0,1fr))",
              gap: "16px",
            }}
          >
            <ChartCard
              title="Enquiry Distribution"
              subtitle="Enquiry records associated with each franchisee."
              icon={<ClipboardList size={17} />}
              type="green"
            >
              <div
                style={{
                  height: "285px",
                }}
              >
                {enquiryDistribution.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={enquiryDistribution}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 15,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#eee7f5"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        tick={{
                          fill: "#756b7d",
                          fontSize: 9,
                        }}
                        axisLine={{
                          stroke: "#ddd5e7",
                        }}
                        tickLine={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={125}
                        tick={{
                          fill: "#665b6f",
                          fontSize: 8,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        formatter={(value) => [
                          Number(value).toLocaleString(
                            "en-IN"
                          ),
                          "Enquiries",
                        ]}
                      />

                      <Bar
                        dataKey="enquiries"
                        name="Enquiries"
                        fill={COLORS.green}
                        radius={[
                          0,
                          5,
                          5,
                          0,
                        ]}
                        maxBarSize={17}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No enquiry distribution data available." />
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Franchisee Coverage"
              subtitle="Assigned versus unassigned clients."
              icon={<Building2 size={17} />}
              type="purple"
            >
              <div
                style={{
                  height: "285px",
                }}
              >
                {coverageData.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={coverageData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="43%"
                        innerRadius={62}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        <Cell
                          fill={COLORS.purple}
                        />

                        <Cell
                          fill={COLORS.orange}
                        />
                      </Pie>

                      <Tooltip />

                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                          fontSize: "9px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No franchisee coverage data available." />
                )}
              </div>
            </ChartCard>
          </div>

          {/* ATTENTION */}

          <section
            style={{
              background:
                "linear-gradient(135deg,#fffaf0,#ffffff,#fff7f7)",
              border:
                "1px solid #f3dfba",
              borderRadius: "15px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "11px",
                    background:
                      "#fff7ed",
                    color: COLORS.orange,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={20} />
                </div>

                <div>
                  <div
                    style={{
                      color: "#d97706",
                      fontSize: "9px",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Attention Required
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      color: COLORS.text,
                      fontSize: "19px",
                      fontWeight: 800,
                    }}
                  >
                    {(
                      unassignedClients +
                      unassignedEnquiries
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      color: COLORS.muted,
                      fontSize: "10px",
                    }}
                  >
                    Unassigned client and enquiry records in the current selection.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(120px,1fr))",
                  gap: "9px",
                }}
              >
                <AttentionMetric
                  label="Unassigned Clients"
                  value={unassignedClients.toLocaleString(
                    "en-IN"
                  )}
                />

                <AttentionMetric
                  label="Unassigned Enquiries"
                  value={unassignedEnquiries.toLocaleString(
                    "en-IN"
                  )}
                />
              </div>
            </div>
          </section>

          {/* SMART INSIGHTS */}

          <section
            style={{
              background:
                "linear-gradient(135deg,#f7f3ff,#ffffff,#effcff)",
              border:
                "1px solid #e5dbf3",
              borderRadius: "15px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background:
                    COLORS.purpleLight,
                  color: COLORS.purple,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lightbulb size={17} />
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    color: COLORS.text,
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  Smart Franchisee Insights
                </h3>

                <p
                  style={{
                    margin: "3px 0 0",
                    color: COLORS.muted,
                    fontSize: "10px",
                  }}
                >
                  Key observations from the current franchisee data.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              {insights.map(
                (insight, index) => (
                  <InsightCard
                    key={index}
                    insight={insight}
                  />
                )
              )}
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          color: COLORS.muted,
          fontSize: "10px",
          padding: "2px",
        }}
      >
        <span>
          Showing{" "}
          <strong
            style={{
              color: COLORS.text,
            }}
          >
            {filteredClients.length.toLocaleString(
              "en-IN"
            )}
          </strong>{" "}
          clients and{" "}
          <strong
            style={{
              color: COLORS.text,
            }}
          >
            {filteredEnquiries.length.toLocaleString(
              "en-IN"
            )}
          </strong>{" "}
          enquiries.
        </span>

        <button
          type="button"
          onClick={fetchData}
          style={{
            border: "none",
            background: "transparent",
            color: COLORS.purpleDark,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  type,
}) {
  const styles = {
    purple: {
      background: "#f7f3ff",
      border: "#e5ddf8",
      icon: "#ede9fe",
      color: "#7c3aed",
    },

    cyan: {
      background: "#ecfeff",
      border: "#c7f4f8",
      icon: "#cffafe",
      color: "#0891b2",
    },

    green: {
      background: "#ecfdf5",
      border: "#c9f2df",
      icon: "#d1fae5",
      color: "#059669",
    },

    orange: {
      background: "#fff7ed",
      border: "#fed7aa",
      icon: "#ffedd5",
      color: "#d97706",
    },
  };

  const selected = styles[type];

  return (
    <div
      style={{
        background: selected.background,
        border:
          `1px solid ${selected.border}`,
        borderRadius: "14px",
        padding: "15px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: "35px",
          height: "35px",
          borderRadius: "10px",
          background: selected.icon,
          color: selected.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: "12px",
          color: "#756b7d",
          fontSize: "10px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: COLORS.text,
          fontSize: "20px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: selected.color,
          fontSize: "9px",
          fontWeight: 600,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      style={{
        width: "100%",
        border: "1px solid #ddd4e8",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#51465b",
        padding: "10px 12px",
        fontSize: "10px",
        outline: "none",
      }}
    >
      <option value="all">
        {allLabel}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

/* ============================================================
   CHART CARD
============================================================ */

function ChartCard({
  title,
  subtitle,
  icon,
  type,
  children,
}) {
  const iconStyles = {
    cyan: {
      background: "#cffafe",
      color: "#0891b2",
    },

    green: {
      background: "#d1fae5",
      color: "#059669",
    },

    purple: {
      background: "#ede9fe",
      color: "#7c3aed",
    },
  };

  const iconStyle =
    iconStyles[type] ||
    iconStyles.purple;

  return (
    <section
      style={{
        background: "#ffffff",
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "15px",
        padding: "15px",
        minWidth: 0,
        boxShadow:
          "0 3px 12px rgba(104,77,140,.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          marginBottom: "5px",
        }}
      >
        <div
          style={{
            width: "31px",
            height: "31px",
            borderRadius: "9px",
            background:
              iconStyle.background,
            color: iconStyle.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: COLORS.text,
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "2px 0 0",
              color: COLORS.muted,
              fontSize: "9px",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   VIEW BUTTON
============================================================ */

function ViewButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        border: "1px solid #ddd4e8",
        borderRadius: "8px",
        padding: "7px 10px",
        background: active
          ? COLORS.purpleLight
          : "#ffffff",
        color: active
          ? COLORS.purpleDark
          : "#756b7d",
        fontSize: "10px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================
   ATTENTION METRIC
============================================================ */

function AttentionMetric({
  label,
  value,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #f3dfba",
        borderRadius: "10px",
        padding: "10px",
        minWidth: "120px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: COLORS.muted,
          fontSize: "9px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: "#d97706",
          fontSize: "14px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
  insight,
}) {
  const styles = {
    positive: {
      background: "#ecfdf5",
      border: "#d1fae5",
      color: "#059669",
    },

    attention: {
      background: "#fff7ed",
      border: "#fed7aa",
      color: "#d97706",
    },

    info: {
      background: "#f5f3ff",
      border: "#e9d5ff",
      color: "#7c3aed",
    },
  };

  const style =
    styles[insight.type] ||
    styles.info;

  return (
    <div
      style={{
        background: style.background,
        border:
          `1px solid ${style.border}`,
        borderRadius: "10px",
        padding: "11px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        {insight.type ===
        "positive" ? (
          <CheckCircle2
            size={15}
            color={style.color}
          />
        ) : insight.type ===
          "attention" ? (
          <AlertCircle
            size={15}
            color={style.color}
          />
        ) : (
          <Lightbulb
            size={15}
            color={style.color}
          />
        )}

        <div
          style={{
            color: "#4b4154",
            fontSize: "10px",
            fontWeight: 800,
          }}
        >
          {insight.title}
        </div>
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "#766b7e",
          fontSize: "9px",
          lineHeight: 1.45,
        }}
      >
        {insight.text}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ text }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.purple,
        background: COLORS.background,
        borderRadius: "10px",
        fontSize: "10px",
      }}
    >
      {text}
    </div>
  );
}

/* ============================================================
   TABLE
============================================================ */

function FranchiseeTable({ rows }) {
  const totalClients = rows.reduce(
    (sum, row) =>
      sum + row.clients,
    0
  );

  return (
    <section
      style={{
        background: "#ffffff",
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "15px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "15px",
          borderBottom:
            "1px solid #eee7f5",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: COLORS.text,
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            Franchisee Table View
          </h2>

          <p
            style={{
              margin: "3px 0 0",
              color: COLORS.muted,
              fontSize: "10px",
            }}
          >
            Client and enquiry distribution by franchisee.
          </p>
        </div>

        <div
          style={{
            background:
              COLORS.purpleLight,
            color:
              COLORS.purpleDark,
            borderRadius: "9px",
            padding: "7px 10px",
            fontSize: "10px",
            fontWeight: 800,
          }}
        >
          {rows.length.toLocaleString(
            "en-IN"
          )}{" "}
          franchisees
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "750px",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "#faf8ff",
              }}
            >
              <th
                style={tableHeader("left")}
              >
                Franchisee
              </th>

              <th
                style={tableHeader("right")}
              >
                Clients
              </th>

              <th
                style={tableHeader("right")}
              >
                Active Clients
              </th>

              <th
                style={tableHeader("right")}
              >
                Enquiries
              </th>

              <th
                style={tableHeader("right")}
              >
                Client Share
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map(
                (row, index) => {
                  const share =
                    totalClients > 0
                      ? (row.clients /
                          totalClients) *
                        100
                      : 0;

                  return (
                    <tr
                      key={`${row.franchisee}-${index}`}
                      style={{
                        borderBottom:
                          "1px solid #f1edf5",
                      }}
                    >
                      <td
                        style={tableCell("left")}
                      >
                        <strong
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {row.franchisee}
                        </strong>
                      </td>

                      <td
                        style={tableCell("right")}
                      >
                        {row.clients.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td
                        style={{
                          ...tableCell(
                            "right"
                          ),
                          color:
                            COLORS.green,
                          fontWeight: 700,
                        }}
                      >
                        {row.activeClients.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td
                        style={tableCell("right")}
                      >
                        {row.enquiries.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td
                        style={tableCell("right")}
                      >
                        <span
                          style={{
                            display:
                              "inline-block",
                            background:
                              COLORS.purpleLight,
                            color:
                              COLORS.purpleDark,
                            borderRadius:
                              "999px",
                            padding:
                              "4px 8px",
                            fontSize:
                              "9px",
                            fontWeight: 700,
                          }}
                        >
                          {share.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "45px",
                    textAlign:
                      "center",
                    color:
                      COLORS.muted,
                    fontSize:
                      "11px",
                  }}
                >
                  No franchisee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ============================================================
   TABLE STYLES
============================================================ */

function tableHeader(align) {
  return {
    padding: "11px 13px",
    textAlign: align,
    color: COLORS.purpleDark,
    fontSize: "10px",
    borderBottom:
      "1px solid #e7def5",
    whiteSpace: "nowrap",
  };
}

function tableCell(align) {
  return {
    padding: "10px 13px",
    textAlign: align,
    color: "#5d5366",
    fontSize: "10px",
    whiteSpace: "nowrap",
  };
}

export default Franchisees;
