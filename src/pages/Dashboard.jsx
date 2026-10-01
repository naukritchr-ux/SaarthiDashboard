import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  IndianRupee,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  WalletCards,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = "/api/dashboard/summary";

const COLORS = [
  "#7c3aed",
  "#a855f7",
  "#c084fc",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#3b82f6",
  "#14b8a6",
  "#ec4899",
];

const SUMMARY_BAR_COLORS = [
  "#8065a5",
  "#10b981",
  "#06b6d4",
  "#f59e0b",
  "#a855f7",
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatCurrency = (value) =>
  `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;

function getValue(object, keys, fallback = 0) {
  if (!object) return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
}

function Dashboard({ period }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("charts");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(API_URL, {
          params: {
            period: period || "all",
          },
        });

        setSummary(response.data);
      } catch (err) {
        console.error("Dashboard summary error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [period]);

  const funnelData = useMemo(() => {
    const funnel = summary?.funnel || {};

    const total = Number(
      getValue(funnel, [
        "total",
        "totalEnquiries",
        "total_enquiries",
        "enquiries",
      ])
    );

    const allocated = Number(
      getValue(funnel, [
        "allocated",
        "allocatedEnquiries",
        "allocated_enquiries",
        "inProgress",
        "in_progress",
      ])
    );

    const closed = Number(
      getValue(funnel, [
        "closed",
        "closedEnquiries",
        "closed_enquiries",
        "converted",
        "convertedEnquiries",
      ])
    );

    return [
      {
        label: "Total Enquiries",
        shortLabel: "Total",
        value: total,
        percentage: 100,
      },
      {
        label: "Open / In Progress",
        shortLabel: "Open / In Progress",
        value: allocated,
        percentage: total > 0 ? (allocated / total) * 100 : 0,
      },
      {
        label: "Closed / Converted",
        shortLabel: "Closed / Converted",
        value: closed,
        percentage: total > 0 ? (closed / total) * 100 : 0,
      },
    ];
  }, [summary]);

  const enquiryStatusData = useMemo(() => {
    const enquiry = summary?.enquiries || {};

    const closed = Number(
      getValue(enquiry, ["closed", "closedEnquiries"], 0)
    );

    const inProgress = Number(
      getValue(enquiry, [
        "inProgress",
        "in_progress",
        "allocated",
        "open",
      ])
    );

    const total = Number(
      getValue(enquiry, [
        "total",
        "totalEnquiries",
        "enquiries",
      ])
    );

    const other = Math.max(total - closed - inProgress, 0);

    return [
      { name: "Closed", value: closed },
      { name: "In Progress", value: inProgress },
      { name: "Other", value: other },
    ].filter((item) => item.value > 0);
  }, [summary]);

  const clientHealthData = useMemo(() => {
    const clients = summary?.clients || {};

    const active = Number(
      getValue(clients, ["active", "activeClients"], 0)
    );

    const inactive = Number(
      getValue(clients, ["inactive", "inactiveClients"], 0)
    );

    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive },
    ].filter((item) => item.value > 0);
  }, [summary]);

  const yearlyMembersData = useMemo(() => {
    const source =
      summary?.yearlyMembers ||
      summary?.clientsByYear ||
      summary?.membersByYear ||
      [];

    if (Array.isArray(source)) {
      return source.map((item) => ({
        year: String(
          getValue(item, ["year", "Year", "label"], "")
        ),
        count: Number(
          getValue(
            item,
            ["count", "value", "members", "total"],
            0
          )
        ),
      }));
    }

    if (source && typeof source === "object") {
      return Object.entries(source).map(([year, count]) => ({
        year: String(year),
        count: Number(count || 0),
      }));
    }

    return [];
  }, [summary]);

  const bdMembersData = useMemo(() => {
    const source =
      summary?.bdMembers ||
      summary?.topBDMembers ||
      summary?.topBdMembers ||
      [];

    if (Array.isArray(source)) {
      return source
        .map((item) => ({
          name: String(
            getValue(
              item,
              [
                "name",
                "bdName",
                "bd_member",
                "member",
                "label",
              ],
              "Unknown"
            )
          ),
          count: Number(
            getValue(
              item,
              [
                "count",
                "value",
                "total",
                "enquiries",
              ],
              0
            )
          ),
        }))
        .filter((item) => item.name !== "Unknown");
    }

    if (source && typeof source === "object") {
      return Object.entries(source).map(([name, count]) => ({
        name,
        count: Number(count || 0),
      }));
    }

    return [];
  }, [summary]);

  const ageingData = useMemo(() => {
    const source =
      summary?.aging ||
      summary?.ageing ||
      summary?.invoiceAging ||
      summary?.invoiceAgeing ||
      [];

    if (Array.isArray(source)) {
      return source.map((item) => ({
        name: String(
          getValue(
            item,
            ["name", "label", "bucket", "age"],
            "Unknown"
          )
        ),
        value: Number(
          getValue(
            item,
            ["value", "count", "amount", "total"],
            0
          )
        ),
      }));
    }

    if (source && typeof source === "object") {
      return Object.entries(source).map(([name, value]) => ({
        name,
        value: Number(value || 0),
      }));
    }

    return [];
  }, [summary]);

  const totalClients = Number(
    getValue(
      summary?.clients,
      ["total", "totalClients"],
      0
    )
  );

  const activeClients = Number(
    getValue(
      summary?.clients,
      ["active", "activeClients"],
      0
    )
  );

  const totalEnquiries = Number(
    getValue(
      summary?.enquiries,
      ["total", "totalEnquiries"],
      0
    )
  );

  const closedEnquiries = Number(
    getValue(
      summary?.enquiries,
      ["closed", "closedEnquiries"],
      0
    )
  );

  const totalInvoices = Number(
    getValue(
      summary?.invoices,
      ["total", "totalInvoices"],
      0
    )
  );

  const totalBilling = Number(
    getValue(
      summary?.invoices,
      [
        "totalBilling",
        "billing",
        "totalAmount",
        "amount",
      ],
      0
    )
  );

  const amountReceived = Number(
    getValue(
      summary?.invoices,
      [
        "amountReceived",
        "received",
        "receivedAmount",
      ],
      0
    )
  );

  const amountDue = Number(
    getValue(
      summary?.invoices,
      [
        "amountDue",
        "due",
        "outstanding",
        "outstandingAmount",
      ],
      0
    )
  );

  const closureRate = Number(
    getValue(
      summary?.enquiries,
      ["closureRate", "closure_rate"],
      0
    )
  );

  const collectionRate = Number(
    getValue(
      summary?.invoices,
      ["collectionRate", "collection_rate"],
      0
    )
  );

  const financialHealth =
    summary?.financialHealth ||
    summary?.financial_health ||
    null;

  const attention =
    summary?.attention ||
    summary?.businessAttention ||
    [];

  const dashboardSummaryData = [
    {
      metric: "Total Clients",
      value: totalClients,
    },
    {
      metric: "Active Clients",
      value: activeClients,
    },
    {
      metric: "Total Enquiries",
      value: totalEnquiries,
    },
    {
      metric: "Closed Enquiries",
      value: closedEnquiries,
    },
    {
      metric: "Total Invoices",
      value: totalInvoices,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            border: "4px solid #e7def5",
            borderTopColor: "#8065a5",
            borderRadius: "50%",
            animation: "dashboardSpin 1s linear infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#684d8c",
            fontWeight: 600,
          }}
        >
          Loading dashboard...
        </p>

        <style>
          {`
            @keyframes dashboardSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #eadff4",
          borderRadius: "18px",
          padding: "30px",
          textAlign: "center",
          color: "#b42318",
        }}
      >
        <AlertCircle
          size={42}
          style={{ marginBottom: "10px" }}
        />

        <h3 style={{ margin: "0 0 8px" }}>
          Dashboard could not load
        </h3>

        <p style={{ margin: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* KPI CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(5, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        <KpiCard
          title="Total Clients"
          value={formatNumber(totalClients)}
          icon={<Users size={21} />}
          iconBackground="#eee7fa"
          iconColor="#8065a5"
        />

        <KpiCard
          title="Active Clients"
          value={formatNumber(activeClients)}
          icon={<Activity size={21} />}
          iconBackground="#e7f8f1"
          iconColor="#10b981"
        />

        <KpiCard
          title="Total Enquiries"
          value={formatNumber(totalEnquiries)}
          icon={<MessageSquare size={21} />}
          iconBackground="#e7f5fb"
          iconColor="#0891b2"
        />

        <KpiCard
          title="Total Invoices"
          value={formatNumber(totalInvoices)}
          icon={<FileText size={21} />}
          iconBackground="#fff4df"
          iconColor="#d97706"
        />

        <KpiCard
          title="Total Billing"
          value={formatCurrency(totalBilling)}
          icon={<IndianRupee size={21} />}
          iconBackground="#f4e9fb"
          iconColor="#9333ea"
        />
      </div>

      {/* MAIN DASHBOARD GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.55fr 1fr 1fr",
          gap: "18px",
        }}
      >
        {/* ENQUIRY FUNNEL */}

        <DashboardCard
          title="Enquiry Conversion Funnel"
          subtitle="Enquiries moving from total leads to closed / converted"
        >
          <RealFunnel data={funnelData} />
        </DashboardCard>

        {/* ENQUIRY STATUS */}

        <DashboardCard
          title="Enquiry Status"
          subtitle="Current enquiry distribution"
        >
          <div style={{ height: "250px" }}>
            {enquiryStatusData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={enquiryStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {enquiryStatusData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={COLORS[index]}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatNumber(value)
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={35}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No enquiry status data available" />
            )}
          </div>
        </DashboardCard>

        {/* CLIENT HEALTH */}

        <DashboardCard
          title="Client Portfolio Health"
          subtitle="Active vs inactive clients"
        >
          <div style={{ height: "250px" }}>
            {clientHealthData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={clientHealthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {clientHealthData.map(
                      (entry, index) => (
                        <Cell
                          key={`client-${index}`}
                          fill={
                            index === 0
                              ? "#10b981"
                              : "#f43f5e"
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatNumber(value)
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={35}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No client health data available" />
            )}
          </div>
        </DashboardCard>
      </div>

      {/* SECOND ROW */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 1fr",
          gap: "18px",
        }}
      >
        {/* CLIENTS BY YEAR */}

        <DashboardCard
          title="Clients by Year"
          subtitle="Client acquisition over the years"
        >
          <div style={{ height: "300px" }}>
            {yearlyMembersData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={yearlyMembersData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee7f5"
                  />

                  <XAxis dataKey="year" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatNumber(value)
                    }
                  />

                  <Bar
                    dataKey="count"
                    fill="#8065a5"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No yearly client data available" />
            )}
          </div>
        </DashboardCard>

        {/* TOP BD MEMBERS */}

        <DashboardCard
          title="Top BD Members"
          subtitle="Based on enquiry activity"
        >
          <div style={{ height: "300px" }}>
            {bdMembersData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={bdMembersData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee7f5"
                  />

                  <XAxis type="number" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatNumber(value)
                    }
                  />

                  <Bar
                    dataKey="count"
                    fill="#a855f7"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="No BD member data available" />
            )}
          </div>
        </DashboardCard>
      </div>

      {/* THIRD ROW */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr 1fr",
          gap: "18px",
        }}
      >
        {/* INVOICE AGEING */}

        <DashboardCard
          title="Invoice Ageing"
          subtitle="Outstanding invoice distribution"
        >
          {ageingData.length > 0 ? (
            <div style={{ height: "260px" }}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={ageingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee7f5"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Bar
                    dataKey="value"
                    fill="#f59e0b"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart text="No ageing data available" />
          )}
        </DashboardCard>

        {/* FINANCIAL HEALTH */}

        <DashboardCard
          title="Financial Health"
          subtitle="Billing and collection overview"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              paddingTop: "8px",
            }}
          >
            <FinancialRow
              icon={<WalletCards size={18} />}
              label="Total Billing"
              value={formatCurrency(totalBilling)}
              background="#f1eafb"
              color="#8065a5"
            />

            <FinancialRow
              icon={<CheckCircle2 size={18} />}
              label="Amount Received"
              value={formatCurrency(amountReceived)}
              background="#e7f8f1"
              color="#10b981"
            />

            <FinancialRow
              icon={<Clock3 size={18} />}
              label="Amount Due"
              value={formatCurrency(amountDue)}
              background="#fff2df"
              color="#d97706"
            />

            <div
              style={{
                marginTop: "4px",
                padding: "15px",
                borderRadius: "14px",
                background:
                  collectionRate >= 70
                    ? "#e7f8f1"
                    : "#fff2df",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#555",
                  }}
                >
                  Collection Rate
                </span>

                <strong
                  style={{
                    color:
                      collectionRate >= 70
                        ? "#078a5b"
                        : "#c56b00",
                  }}
                >
                  {collectionRate.toFixed(1)}%
                </strong>
              </div>

              <div
                style={{
                  height: "8px",
                  borderRadius: "20px",
                  background: "#e8e8e8",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      Math.max(collectionRate, 0),
                      100
                    )}%`,
                    height: "100%",
                    borderRadius: "20px",
                    background:
                      collectionRate >= 70
                        ? "#10b981"
                        : "#f59e0b",
                  }}
                />
              </div>
            </div>

            {financialHealth && (
              <div
                style={{
                  padding: "11px 13px",
                  borderRadius: "12px",
                  background: "#faf8ff",
                  border: "1px solid #eee7f5",
                  fontSize: "12px",
                  color: "#684d8c",
                  fontWeight: 700,
                }}
              >
                Financial Health:{" "}
                {typeof financialHealth === "string"
                  ? financialHealth
                  : getValue(
                      financialHealth,
                      [
                        "status",
                        "label",
                        "message",
                      ],
                      "Available"
                    )}
              </div>
            )}
          </div>
        </DashboardCard>

        {/* BUSINESS ATTENTION */}

        <DashboardCard
          title="Business Attention"
          subtitle="Metrics that may need attention"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <AttentionRow
              title="Closure Rate"
              value={`${closureRate.toFixed(1)}%`}
              icon={<TrendingUp size={18} />}
              color="#8065a5"
            />

            <AttentionRow
              title="Collection Rate"
              value={`${collectionRate.toFixed(1)}%`}
              icon={<IndianRupee size={18} />}
              color="#10b981"
            />

            <AttentionRow
              title="Total Enquiries"
              value={formatNumber(totalEnquiries)}
              icon={<MessageSquare size={18} />}
              color="#0891b2"
            />

            <AttentionRow
              title="Closed Enquiries"
              value={formatNumber(closedEnquiries)}
              icon={<CheckCircle2 size={18} />}
              color="#f59e0b"
            />

            {Array.isArray(attention) &&
              attention.slice(0, 2).map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      background: "#faf8ff",
                      border: "1px solid #eee7f5",
                      fontSize: "13px",
                      color: "#555",
                    }}
                  >
                    {typeof item === "string"
                      ? item
                      : getValue(
                          item,
                          [
                            "message",
                            "text",
                            "label",
                            "title",
                          ],
                          "Review this metric"
                        )}
                  </div>
                )
              )}
          </div>
        </DashboardCard>
      </div>

      {/* DASHBOARD SUMMARY */}

      <DashboardCard
        title="Dashboard Summary"
        subtitle="Switch between visual and tabular summary"
        action={
          <div
            style={{
              display: "flex",
              gap: "5px",
              padding: "4px",
              background: "#f4eff9",
              borderRadius: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("charts")}
              style={{
                border: "none",
                padding: "7px 12px",
                borderRadius: "7px",
                cursor: "pointer",
                background:
                  viewMode === "charts"
                    ? "#8065a5"
                    : "transparent",
                color:
                  viewMode === "charts"
                    ? "#fff"
                    : "#684d8c",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              Charts
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                border: "none",
                padding: "7px 12px",
                borderRadius: "7px",
                cursor: "pointer",
                background:
                  viewMode === "table"
                    ? "#8065a5"
                    : "transparent",
                color:
                  viewMode === "table"
                    ? "#fff"
                    : "#684d8c",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              Table
            </button>
          </div>
        }
      >
        {viewMode === "charts" ? (
          <div
            style={{
              height: "300px",
              width: "100%",
              background: "#faf8ff",
              borderRadius: "14px",
              padding: "10px 8px 4px",
              boxSizing: "border-box",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={dashboardSummaryData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eee7f5"
                  vertical={false}
                />

                <XAxis
                  dataKey="metric"
                  tick={{
                    fill: "#6f6479",
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: "#ded5e8",
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#6f6479",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    "Count",
                  ]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5dcef",
                    boxShadow:
                      "0 4px 14px rgba(104, 77, 140, 0.12)",
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={58}
                >
                  {SUMMARY_BAR_COLORS.map(
                    (color, index) => (
                      <Cell
                        key={`summary-bar-${index}`}
                        fill={color}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f5f0fa",
                    color: "#684d8c",
                  }}
                >
                  <th style={tableHead}>
                    Metric
                  </th>

                  <th style={tableHead}>
                    Value
                  </th>
                </tr>
              </thead>

              <tbody>
                <TableRow
                  label="Total Clients"
                  value={formatNumber(totalClients)}
                />

                <TableRow
                  label="Active Clients"
                  value={formatNumber(activeClients)}
                />

                <TableRow
                  label="Total Enquiries"
                  value={formatNumber(totalEnquiries)}
                />

                <TableRow
                  label="Closed Enquiries"
                  value={formatNumber(closedEnquiries)}
                />

                <TableRow
                  label="Closure Rate"
                  value={`${closureRate.toFixed(1)}%`}
                />

                <TableRow
                  label="Total Invoices"
                  value={formatNumber(totalInvoices)}
                />

                <TableRow
                  label="Total Billing"
                  value={formatCurrency(totalBilling)}
                />

                <TableRow
                  label="Amount Received"
                  value={formatCurrency(amountReceived)}
                />

                <TableRow
                  label="Amount Due"
                  value={formatCurrency(amountDue)}
                />

                <TableRow
                  label="Collection Rate"
                  value={`${collectionRate.toFixed(1)}%`}
                />
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

/* =========================================================
   REAL FUNNEL
========================================================= */

function RealFunnel({ data }) {
  const safeData = data?.length
    ? data
    : [
        {
          label: "Total Enquiries",
          shortLabel: "Total",
          value: 0,
          percentage: 100,
        },
        {
          label: "Open / In Progress",
          shortLabel: "Open / In Progress",
          value: 0,
          percentage: 0,
        },
        {
          label: "Closed / Converted",
          shortLabel: "Closed / Converted",
          value: 0,
          percentage: 0,
        },
      ];

  return (
    <div
      style={{
        width: "100%",
        height: "290px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 0",
      }}
    >
      <FunnelSection
        width="100%"
        height="72px"
        background="#8065a5"
        title={safeData[0]?.label}
        value={safeData[0]?.value}
        percentage={safeData[0]?.percentage}
        top
      />

      <FunnelSection
        width="78%"
        height="72px"
        background="#a855f7"
        title={safeData[1]?.label}
        value={safeData[1]?.value}
        percentage={safeData[1]?.percentage}
      />

      <FunnelSection
        width="56%"
        height="72px"
        background="#c084fc"
        title={safeData[2]?.label}
        value={safeData[2]?.value}
        percentage={safeData[2]?.percentage}
        bottom
      />

      <div
        style={{
          marginTop: "9px",
          fontSize: "11px",
          color: "#777",
          textAlign: "center",
        }}
      >
        Conversion funnel
      </div>
    </div>
  );
}

function FunnelSection({
  width,
  height,
  background,
  title,
  value,
  percentage,
  top,
  bottom,
}) {
  return (
    <div
      style={{
        width,
        height,
        background,
        color: "#fff",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flexShrink: 0,
        clipPath: top
          ? "polygon(4% 0, 96% 0, 87% 100%, 13% 100%)"
          : bottom
          ? "polygon(13% 0, 87% 0, 72% 100%, 28% 100%)"
          : "polygon(9% 0, 91% 0, 82% 100%, 18% 100%)",
        marginTop: top ? "0" : "-1px",
        zIndex: top ? 3 : bottom ? 1 : 2,
        boxShadow:
          "0 2px 6px rgba(104, 77, 140, 0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1.2,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          {formatNumber(value)}
        </div>

        <div
          style={{
            fontSize: "11px",
            opacity: 0.92,
            marginTop: "2px",
          }}
        >
          {Number(percentage || 0).toFixed(1)}% of total
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  subtitle,
  children,
  action,
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee7f5",
        borderRadius: "18px",
        padding: "18px",
        boxShadow:
          "0 4px 18px rgba(104, 77, 140, 0.06)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#342744",
              fontWeight: 800,
            }}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              style={{
                margin: "4px 0 0",
                color: "#8a8293",
                fontSize: "11px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee7f5",
        borderRadius: "16px",
        padding: "15px",
        boxShadow:
          "0 4px 18px rgba(104, 77, 140, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "#8b8492",
              fontWeight: 600,
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: "7px 0 0",
              fontSize: "22px",
              color: "#342744",
              fontWeight: 800,
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: iconBackground,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FINANCIAL ROW
========================================================= */

function FinancialRow({
  icon,
  label,
  value,
  background,
  color,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
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
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            fontSize: "12px",
            color: "#666",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      </div>

      <strong
        style={{
          fontSize: "13px",
          color: "#342744",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   ATTENTION ROW
========================================================= */

function AttentionRow({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px",
        borderRadius: "12px",
        background: "#faf8ff",
        border: "1px solid #eee7f5",
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
            width: "31px",
            height: "31px",
            borderRadius: "9px",
            background: "#eee7fa",
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            fontSize: "12px",
            color: "#666",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>

      <strong
        style={{
          fontSize: "13px",
          color: "#342744",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   EMPTY CHART
========================================================= */

function EmptyChart({ text }) {
  return (
    <div
      style={{
        height: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#999",
        fontSize: "13px",
      }}
    >
      {text}
    </div>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function TableRow({ label, value }) {
  return (
    <tr>
      <td style={tableCell}>
        {label}
      </td>

      <td
        style={{
          ...tableCell,
          fontWeight: 700,
          color: "#342744",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

const tableHead = {
  padding: "11px",
  textAlign: "left",
  borderBottom: "1px solid #e8e0ef",
};

const tableCell = {
  padding: "11px",
  borderBottom: "1px solid #f0ebf4",
  color: "#666",
};

export default Dashboard;
