import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Users,
  UserRound,
  IndianRupee,
  FileText,
  RefreshCw,
  Building2,
  Crown,
  BarChart3,
  Table2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const API_BASE = "/api/dashboard";

const COLORS = [
  "#8065a5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

const BORDER = "#e7def5";
const TEXT = "#3f344a";
const MUTED = "#81768a";
const PURPLE = "#8065a5";
const PURPLE_DARK = "#684d8c";
const PURPLE_LIGHT = "#f3effb";

/* ============================================================
   HELPERS
============================================================ */

function extractArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.invoices)) {
    return response.invoices;
  }

  if (Array.isArray(response?.clients)) {
    return response.clients;
  }

  if (Array.isArray(response?.enquiries)) {
    return response.enquiries;
  }

  return [];
}

function getValue(item, keys) {
  if (!item) return "";

  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null &&
      String(item[key]).trim() !== ""
    ) {
      return String(item[key]).trim();
    }
  }

  return "";
}

function parseNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  let text = String(value)
    .replace(/₹/g, "")
    .replace(/\$/g, "")
    .replace(/€/g, "")
    .replace(/£/g, "")
    .replace(/,/g, "")
    .trim();

  const croreMatch = text.match(
    /^(-?[\d.]+)\s*(cr|crore|crores)$/i
  );

  if (croreMatch) {
    return Number(croreMatch[1]) * 10000000;
  }

  const lakhMatch = text.match(
    /^(-?[\d.]+)\s*(l|lac|lakh|lakhs)$/i
  );

  if (lakhMatch) {
    return Number(lakhMatch[1]) * 100000;
  }

  const thousandMatch = text.match(
    /^(-?[\d.]+)\s*(k|thousand)$/i
  );

  if (thousandMatch) {
    return Number(thousandMatch[1]) * 1000;
  }

  const number = Number(
    text.replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  const number = Number(value || 0);

  if (Math.abs(number) >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  }

  if (Math.abs(number) >= 100000) {
    return `₹${(number / 100000).toFixed(2)} L`;
  }

  if (Math.abs(number) >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(number).toLocaleString("en-IN")}`;
}

function formatFullCurrency(value) {
  return `₹${Math.round(
    Number(value || 0)
  ).toLocaleString("en-IN")}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

/* ============================================================
   NAME FIELDS
============================================================ */

function getBDMember(item) {
  return (
    getValue(item, [
      "nameOfBd",
      "name_of_bd",
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
      "businessDevelopment",
      "business_development",
    ]) || "Unassigned"
  );
}

function getTeamLeader(item) {
  return (
    getValue(item, [
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
    ]) || "Unassigned"
  );
}

function getFranchisee(item) {
  return (
    getValue(item, [
      "franchiseName",
      "franchise_name",
      "franchiseeName",
      "franchisee_name",
      "franchisee",
      "FranchiseeName",
      "Franchisee",
      "FRANCHISEE",
      "FRANCHISEE_NAME",
      "Franchisee_Name",
    ]) || "Unassigned"
  );
}

/* ============================================================
   REVENUE
============================================================ */

function getRevenue(invoice) {
  const keys = [
    "serviceCharges",
    "service_charges",
    "totalBillAmt",
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

  const values = [];

  for (const key of keys) {
    if (
      invoice?.[key] !== undefined &&
      invoice?.[key] !== null &&
      invoice?.[key] !== ""
    ) {
      values.push(
        parseNumber(invoice[key])
      );
    }
  }

  const positive = values.find(
    (value) => value > 0
  );

  return positive !== undefined
    ? positive
    : values[0] || 0;
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function TopPerformance() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [performanceType, setPerformanceType] =
    useState("bd");

  const [topLimit, setTopLimit] = useState(5);

  const [viewMode, setViewMode] =
    useState("charts");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        invoiceResponse,
        clientResponse,
        enquiryResponse,
      ] = await Promise.all([
        fetch(`${API_BASE}/invoices`),
        fetch(`${API_BASE}/clients`),
        fetch(`${API_BASE}/enquiries`),
      ]);

      if (!invoiceResponse.ok) {
        throw new Error("Invoice API failed");
      }

      if (!clientResponse.ok) {
        throw new Error("Client API failed");
      }

      if (!enquiryResponse.ok) {
        throw new Error("Enquiry API failed");
      }

      const invoiceJson =
        await invoiceResponse.json();

      const clientJson =
        await clientResponse.json();

      const enquiryJson =
        await enquiryResponse.json();

      const invoiceData =
        extractArray(invoiceJson);

      const clientData =
        extractArray(clientJson);

      const enquiryData =
        extractArray(enquiryJson);

      console.log(
        "Top Performance invoices:",
        invoiceData.length
      );

      console.log(
        "Top Performance clients:",
        clientData.length
      );

      console.log(
        "Top Performance enquiries:",
        enquiryData.length
      );

      setInvoices(invoiceData);
      setClients(clientData);
      setEnquiries(enquiryData);
    } catch (err) {
      console.error(
        "Top Performance error:",
        err
      );

      setError(
        "Unable to load performance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ==========================================================
     GET SELECTED PERSON
  ========================================================== */

  const getPerformanceName = (item) => {
    if (performanceType === "bd") {
      return getBDMember(item);
    }

    if (performanceType === "teamLeader") {
      return getTeamLeader(item);
    }

    return getFranchisee(item);
  };

  /* ==========================================================
     PERFORMANCE DATA
  ========================================================== */

  const performanceData = useMemo(() => {
    const map = {};

    const ensure = (name) => {
      if (!map[name]) {
        map[name] = {
          name,
          revenue: 0,
          invoices: 0,
          clients: 0,
          enquiries: 0,
        };
      }

      return map[name];
    };

    invoices.forEach((invoice) => {
      const name =
        getPerformanceName(invoice);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      const person = ensure(name);

      person.revenue +=
        getRevenue(invoice);

      person.invoices += 1;
    });

    clients.forEach((client) => {
      const name =
        getPerformanceName(client);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      const person = ensure(name);

      person.clients += 1;
    });

    enquiries.forEach((enquiry) => {
      const name =
        getPerformanceName(enquiry);

      if (
        !name ||
        name === "Unassigned"
      ) {
        return;
      }

      const person = ensure(name);

      person.enquiries += 1;
    });

    return Object.values(map)
      .filter(
        (item) =>
          item.revenue > 0 ||
          item.invoices > 0
      )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        averageRevenue:
          item.invoices > 0
            ? item.revenue /
              item.invoices
            : 0,
      }));
  }, [
    invoices,
    clients,
    enquiries,
    performanceType,
  ]);

  const topPerformers =
    performanceData.slice(
      0,
      topLimit
    );

  const topPerformer =
    topPerformers[0] || null;

  const totalRevenue =
    performanceData.reduce(
      (sum, item) =>
        sum + item.revenue,
      0
    );

  const totalInvoices =
    performanceData.reduce(
      (sum, item) =>
        sum + item.invoices,
      0
    );

  const totalClients =
    performanceData.reduce(
      (sum, item) =>
        sum + item.clients,
      0
    );

  const chartData =
    topPerformers.map(
      (item) => ({
        name:
          item.name.length > 23
            ? `${item.name.slice(
                0,
                23
              )}...`
            : item.name,
        fullName: item.name,
        revenue: item.revenue,
      })
    );

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
            color: PURPLE,
          }}
        >
          <RefreshCw
            size={34}
            style={{
              animation:
                "topPerformanceSpin 1s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            Loading performance analytics...
          </p>
        </div>

        <style>
          {`
            @keyframes topPerformanceSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
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
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            background: "#ffffff",
            border:
              "1px solid #f3d0d0",
            borderRadius: "16px",
            padding: "35px",
          }}
        >
          <h2
            style={{
              color: TEXT,
              margin: 0,
            }}
          >
            Performance data could not be loaded
          </h2>

          <p
            style={{
              color: MUTED,
              fontSize: "12px",
              marginTop: "10px",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={fetchData}
            style={{
              marginTop: "15px",
              border: "none",
              background: PURPLE,
              color: "#ffffff",
              borderRadius: "9px",
              padding:
                "9px 16px",
              cursor: "pointer",
              fontWeight: 700,
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
        gap: "15px",
      }}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent:
            "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: PURPLE,
              fontSize: "10px",
              fontWeight: 800,
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
            }}
          >
            Analytics
          </div>

          <h1
            style={{
              margin:
                "4px 0 0",
              fontSize: "24px",
              lineHeight: 1.2,
              color: TEXT,
              fontWeight: 800,
            }}
          >
            Top Performance
          </h1>

          <p
            style={{
              margin:
                "5px 0 0",
              fontSize: "11px",
              color: MUTED,
            }}
          >
            Identify the highest performing BD Members,
            Team Leaders and Franchisees based on revenue generated.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border:
              "1px solid #ddd4e8",
            background: "#ffffff",
            color: PURPLE_DARK,
            borderRadius: "8px",
            padding:
              "8px 12px",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ======================================================
          PERFORMANCE CATEGORY
      ====================================================== */}

      <section
        style={{
          background: "#ffffff",
          border:
            `1px solid ${BORDER}`,
          borderRadius: "14px",
          padding: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "11px",
          }}
        >
          <div
            style={{
              width: "31px",
              height: "31px",
              borderRadius: "9px",
              background:
                PURPLE_LIGHT,
              color: PURPLE,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
            }}
          >
            <Trophy size={16} />
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                color: TEXT,
                fontWeight: 800,
              }}
            >
              Performance Category
            </div>

            <div
              style={{
                fontSize: "9px",
                color: MUTED,
                marginTop: "2px",
              }}
            >
              Select whose performance you want to see.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "9px",
          }}
        >
          <CategoryButton
            active={
              performanceType === "bd"
            }
            onClick={() =>
              setPerformanceType("bd")
            }
            icon={
              <UserRound size={15} />
            }
            title="BD Members"
            subtitle="Top BD performers"
          />

          <CategoryButton
            active={
              performanceType ===
              "teamLeader"
            }
            onClick={() =>
              setPerformanceType(
                "teamLeader"
              )
            }
            icon={
              <Users size={15} />
            }
            title="Team Leaders"
            subtitle="Top team leaders"
          />

          <CategoryButton
            active={
              performanceType ===
              "franchisee"
            }
            onClick={() =>
              setPerformanceType(
                "franchisee"
              )
            }
            icon={
              <Building2 size={15} />
            }
            title="Franchisees"
            subtitle="Top revenue-generating franchisees"
          />
        </div>
      </section>

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: TEXT,
            }}
          >
            Show Top Performers
          </div>

          <div
            style={{
              marginTop: "2px",
              fontSize: "9px",
              color: MUTED,
            }}
          >
            Rankings are sorted by total revenue generated.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setViewMode("charts")
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              border:
                "1px solid #ddd4e8",
              borderRadius: "8px",
              background:
                viewMode === "charts"
                  ? PURPLE_LIGHT
                  : "#ffffff",
              color:
                viewMode === "charts"
                  ? PURPLE_DARK
                  : MUTED,
              padding:
                "7px 10px",
              fontSize: "9px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <BarChart3 size={13} />
            Chart View
          </button>

          <button
            type="button"
            onClick={() =>
              setViewMode("table")
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              border:
                "1px solid #ddd4e8",
              borderRadius: "8px",
              background:
                viewMode === "table"
                  ? PURPLE_LIGHT
                  : "#ffffff",
              color:
                viewMode === "table"
                  ? PURPLE_DARK
                  : MUTED,
              padding:
                "7px 10px",
              fontSize: "9px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Table2 size={13} />
            Table View
          </button>

          <select
            value={topLimit}
            onChange={(event) =>
              setTopLimit(
                Number(
                  event.target.value
                )
              )
            }
            style={{
              border:
                "1px solid #ddd4e8",
              borderRadius: "8px",
              background:
                "#ffffff",
              color:
                PURPLE_DARK,
              padding:
                "7px 10px",
              fontSize: "9px",
              fontWeight: 700,
              outline: "none",
            }}
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
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "12px",
        }}
      >

        <PerformanceCard
          type="orange"
          icon={
            <Crown size={18} />
          }
          label={`#1 ${singularLabel}`}
          value={
            topPerformer
              ? topPerformer.name
              : "No Data"
          }
          subtitle={
            topPerformer
              ? formatFullCurrency(
                  topPerformer.revenue
                )
              : "₹0"
          }
        />

        <PerformanceCard
          type="cyan"
          icon={
            <IndianRupee size={18} />
          }
          label="Total Revenue"
          value={formatCurrency(
            totalRevenue
          )}
          subtitle="Across all ranked members"
        />

        <PerformanceCard
          type="purple"
          icon={
            <FileText size={18} />
          }
          label="Total Invoices"
          value={formatNumber(
            totalInvoices
          )}
          subtitle="Revenue-generating invoices"
        />

        <PerformanceCard
          type="green"
          icon={
            <Users size={18} />
          }
          label="Associated Clients"
          value={formatNumber(
            totalClients
          )}
          subtitle={`Clients linked to selected ${performanceLabel.toLowerCase()}`}
        />
      </div>

      {/* ======================================================
          CHART
      ====================================================== */}

      {viewMode === "charts" && (
        <section
          style={{
            background: "#ffffff",
            border:
              `1px solid ${BORDER}`,
            borderRadius: "15px",
            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "31px",
                height: "31px",
                borderRadius: "9px",
                background:
                  PURPLE_LIGHT,
                color: PURPLE,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
              }}
            >
              <Trophy size={16} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: TEXT,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Top {performanceLabel}
              </h2>

              <p
                style={{
                  margin:
                    "2px 0 0",
                  color: MUTED,
                  fontSize: "9px",
                }}
              >
                Ranked by total revenue generated.
              </p>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "330px",
            }}
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 25,
                    left: 15,
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
                      fill: MUTED,
                      fontSize: 9,
                    }}
                    tickFormatter={(value) =>
                      formatCurrency(value)
                    }
                    axisLine={{
                      stroke:
                        "#ddd5e7",
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={175}
                    tick={{
                      fill: "#665b6f",
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
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
                        "10px",
                      border:
                        "1px solid #e5dcef",
                      boxShadow:
                        "0 4px 14px rgba(104,77,140,.12)",
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    radius={[
                      0,
                      7,
                      7,
                      0,
                    ]}
                    maxBarSize={27}
                  >
                    {chartData.map(
                      (_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  flexDirection:
                    "column",
                  background:
                    "#faf8ff",
                  borderRadius:
                    "10px",
                }}
              >
                <Trophy
                  size={30}
                  color="#bda8d9"
                />

                <p
                  style={{
                    marginTop: "8px",
                    color: MUTED,
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  No performance data available
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ======================================================
          PERFORMANCE DETAILS
      ====================================================== */}

      <section
        style={{
          background: "#ffffff",
          border:
            `1px solid ${BORDER}`,
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding:
              "14px 15px",
            borderBottom:
              "1px solid #eee7f5",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "9px",
                background:
                  PURPLE_LIGHT,
                color: PURPLE,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
              }}
            >
              <Trophy size={15} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: TEXT,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Performance Details
              </h2>

              <p
                style={{
                  margin:
                    "2px 0 0",
                  color: MUTED,
                  fontSize: "9px",
                }}
              >
                Detailed ranking of the selected top performers.
              </p>
            </div>
          </div>

          <span
            style={{
              background:
                PURPLE_LIGHT,
              color:
                PURPLE_DARK,
              borderRadius: "8px",
              padding:
                "6px 9px",
              fontSize: "8px",
              fontWeight: 800,
            }}
          >
            {performanceLabel}
          </span>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "850px",
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
                <th style={headerStyle}>
                  Rank
                </th>

                <th style={headerStyle}>
                  {singularLabel}
                </th>

                <th
                  style={{
                    ...headerStyle,
                    textAlign: "right",
                  }}
                >
                  Revenue
                </th>

                <th
                  style={{
                    ...headerStyle,
                    textAlign: "right",
                  }}
                >
                  Invoices
                </th>

                <th
                  style={{
                    ...headerStyle,
                    textAlign: "right",
                  }}
                >
                  Clients
                </th>

                <th
                  style={{
                    ...headerStyle,
                    textAlign: "right",
                  }}
                >
                  Enquiries
                </th>

                <th
                  style={{
                    ...headerStyle,
                    textAlign: "right",
                  }}
                >
                  Avg Revenue / Invoice
                </th>
              </tr>
            </thead>

            <tbody>
              {topPerformers.map(
                (item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    style={{
                      borderBottom:
                        "1px solid #f1edf5",
                    }}
                  >
                    <td
                      style={
                        bodyCellStyle
                      }
                    >
                      <span
                        style={{
                          display:
                            "inline-flex",
                          width: "24px",
                          height: "24px",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderRadius:
                            "7px",
                          background:
                            index === 0
                              ? "#fff4d6"
                              : index === 1
                              ? "#f1f1f1"
                              : index === 2
                              ? "#fcebd7"
                              : PURPLE_LIGHT,
                          color:
                            index === 0
                              ? "#d97706"
                              : PURPLE,
                          fontSize: "9px",
                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        color: TEXT,
                        fontWeight: 700,
                      }}
                    >
                      {item.name}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "right",
                        color: TEXT,
                        fontWeight: 800,
                      }}
                    >
                      {formatFullCurrency(
                        item.revenue
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatNumber(
                        item.invoices
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatNumber(
                        item.clients
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatNumber(
                        item.enquiries
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "right",
                        color: PURPLE,
                        fontWeight: 700,
                      }}
                    >
                      {formatFullCurrency(
                        item.averageRevenue
                      )}
                    </td>
                  </tr>
                )
              )}

              {topPerformers.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: MUTED,
                      fontSize: "10px",
                    }}
                  >
                    No performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
          SMALL DATA NOTE
      ====================================================== */}

      <div
        style={{
          padding:
            "0 2px 4px",
          color: MUTED,
          fontSize: "9px",
        }}
      >
        Performance is calculated from the available Sarthi360 invoice, client and enquiry records.
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORY BUTTON
============================================================ */

function CategoryButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        textAlign: "left",
        border: active
          ? `1px solid ${PURPLE}`
          : "1px solid #e1d9e9",
        borderRadius: "9px",
        background: active
          ? "#fbf9ff"
          : "#ffffff",
        color: active
          ? PURPLE_DARK
          : TEXT,
        padding:
          "9px 11px",
        cursor: "pointer",
        transition:
          "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: active
            ? PURPLE_LIGHT
            : "#f7f4fa",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          color: active
            ? PURPLE
            : "#8f8498",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "2px",
            color: MUTED,
            fontSize: "8px",
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function PerformanceCard({
  type,
  icon,
  label,
  value,
  subtitle,
}) {
  const cardStyles = {
    orange: {
      background: "#fffaf0",
      border: "#f8e1af",
      iconBackground: "#fff2cc",
      iconColor: "#d97706",
      subtitleColor: "#d97706",
    },

    cyan: {
      background: "#ecfeff",
      border: "#c7f4f8",
      iconBackground: "#cffafe",
      iconColor: "#0891b2",
      subtitleColor: "#0891b2",
    },

    purple: {
      background: "#f7f3ff",
      border: "#e5ddf8",
      iconBackground: "#ede9fe",
      iconColor: "#7c3aed",
      subtitleColor: "#7c3aed",
    },

    green: {
      background: "#ecfdf5",
      border: "#c9f2df",
      iconBackground: "#d1fae5",
      iconColor: "#059669",
      subtitleColor: "#059669",
    },
  };

  const style =
    cardStyles[type];

  return (
    <div
      style={{
        background:
          style.background,
        border:
          `1px solid ${style.border}`,
        borderRadius: "14px",
        padding: "14px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          background:
            style.iconBackground,
          color:
            style.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: "10px",
          color: "#756b7d",
          fontSize: "9px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: TEXT,
          fontSize:
            String(value).length >
            18
              ? "13px"
              : "19px",
          fontWeight: 800,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={String(value)}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          color:
            style.subtitleColor,
          fontSize: "8px",
          fontWeight: 600,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

/* ============================================================
   TABLE STYLES
============================================================ */

const headerStyle = {
  padding: "10px 12px",
  textAlign: "left",
  color: PURPLE_DARK,
  fontSize: "9px",
  borderBottom:
    "1px solid #e7def5",
  whiteSpace: "nowrap",
};

const bodyCellStyle = {
  padding: "10px 12px",
  color: "#5d5366",
  fontSize: "9px",
  whiteSpace: "nowrap",
};

export default TopPerformance;
