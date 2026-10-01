import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getPeriodRange } from "../utils/dateFilter";

import {
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Filter,
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
} from "recharts";

function Clients({ period = "all" }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [franchiseeFilter, setFranchiseeFilter] =
    useState("All");
  const [teamLeaderFilter, setTeamLeaderFilter] =
    useState("All");

  const [viewMode, setViewMode] = useState("chart");

  // =========================================================
  // COLOURS
  // =========================================================

  const colors = {
    lavender: "#8065a5",
    lavenderLight: "#f3effb",
    lavenderBorder: "#e7def5",

    purple: "#8b5cf6",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    green: "#10b981",
    orange: "#f97316",
    yellow: "#f59e0b",
    red: "#ef4444",
    pink: "#ec4899",
    teal: "#14b8a6",

    text: "#334155",
    muted: "#64748b",
    lightText: "#94a3b8",
    border: "#e2e8f0",
    white: "#ffffff",
    background: "#faf8ff",
  };

  const statusColors = [
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#f59e0b",
    "#fb7185",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#ec4899",
    "#84cc16",
    "#64748b",
  ];

  // =========================================================
  // FETCH CLIENT DATA
  // =========================================================

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/dashboard/clients"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      console.log("CLIENTS RECEIVED:", data.length);

      setClients(data);
    } catch (err) {
      console.error("Clients API Error:", err);

      setError(
        "Unable to load client data. Please make sure the Sarthi360 backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // =========================================================
  // DATE HELPER
  // =========================================================

  const getClientDate = (client) => {
    const rawDate =
      client?.dateClientAcquired ||
      client?.dateOfClientAllocation ||
      client?.created_at ||
      client?.createdAt ||
      client?.createdDate;

    if (!rawDate) return null;

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const statusOptions = useMemo(() => {
    const statuses = new Set();

    clients.forEach((client) => {
      const status = String(
        client?.status || ""
      ).trim();

      statuses.add(status || "Unknown");
    });

    return Array.from(statuses).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [clients]);

  const industries = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((client) => client?.industry)
          .filter(Boolean)
      )
    ).sort();
  }, [clients]);

  const franchisees = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map(
            (client) =>
              client?.franchiseeName
          )
          .filter(Boolean)
      )
    ).sort();
  }, [clients]);

  const teamLeaders = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map(
            (client) =>
              client?.teamLeader
          )
          .filter(Boolean)
      )
    ).sort();
  }, [clients]);

  // =========================================================
  // BUSINESS FILTERS
  // =========================================================

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
      client?.franchiseeName ===
        franchiseeFilter;

    const matchesTeamLeader =
      teamLeaderFilter === "All" ||
      client?.teamLeader ===
        teamLeaderFilter;

    return (
      matchesStatus &&
      matchesIndustry &&
      matchesFranchisee &&
      matchesTeamLeader
    );
  };

  // =========================================================
  // FILTERED CLIENTS
  // =========================================================

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (!matchesBusinessFilters(client)) {
        return false;
      }

      if (!periodRange.startDate) {
        return true;
      }

      const date = getClientDate(client);

      if (!date) {
        return false;
      }

      return (
        date >= periodRange.startDate &&
        date <= periodRange.endDate
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

  // =========================================================
  // PREVIOUS PERIOD
  // =========================================================

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

  // =========================================================
  // BASIC METRICS
  // =========================================================

  const isActive = (client) =>
    String(client?.status || "")
      .toLowerCase()
      .trim() === "active";

  const totalClients =
    filteredClients.length;

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
    previousPeriodClients.filter(isActive)
      .length;

  const previousNonActive =
    previousTotal - previousActive;

  const previousActivePercentage =
    previousTotal > 0
      ? (previousActive / previousTotal) *
        100
      : 0;

  // =========================================================
  // COMPARISON
  // =========================================================

  const calculateChange = (
    current,
    previous
  ) => {
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

  const nonActiveChange =
    calculateChange(
      nonActiveClients,
      previousNonActive
    );

  const activePercentageChange =
    activePercentage -
    previousActivePercentage;

  // =========================================================
  // STATUS DATA
  // =========================================================

  const statusData = useMemo(() => {
    const counts = {};

    filteredClients.forEach((client) => {
      const rawStatus = String(
        client?.status || ""
      ).trim();

      const status =
        rawStatus || "Unknown";

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

  // =========================================================
  // INDUSTRY DATA
  // =========================================================

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

  // =========================================================
  // ACQUISITION DATA
  // =========================================================

  const acquisitionData = useMemo(() => {
    const counts = {};

    const today = new Date();

    today.setHours(
      23,
      59,
      59,
      999
    );

    filteredClients.forEach((client) => {
      const rawDate =
        client?.dateClientAcquired ||
        client?.dateOfClientAllocation ||
        client?.created_at ||
        client?.createdAt;

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

      const label =
        date.toLocaleDateString(
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
        a.sortKey.localeCompare(
          b.sortKey
        )
      )
      .slice(-12)
      .map(({ month, value }) => ({
        month,
        value,
      }));
  }, [filteredClients]);

  // =========================================================
  // ENGAGEMENT DATA
  // =========================================================

  const engagementData = [
    {
      name: "Active",
      value: activeClients,
    },
    {
      name: "Reactivation",
      value: nonActiveClients,
    },
  ];

  const reactivationPercentage =
    totalClients > 0
      ? (nonActiveClients / totalClients) *
        100
      : 0;

  // =========================================================
  // INSIGHTS
  // =========================================================

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
        title:
          "Strong active client base",
        text: `${activePercentage.toFixed(
          1
        )}% of selected clients are active.`,
      });
    } else if (activePercentage >= 50) {
      insights.push({
        type: "info",
        title:
          "Client activity is moderate",
        text: `${activePercentage.toFixed(
          1
        )}% of clients are active.`,
      });
    } else {
      insights.push({
        type: "attention",
        title:
          "Client activity needs attention",
        text: `Only ${activePercentage.toFixed(
          1
        )}% of selected clients are active.`,
      });
    }

    if (nonActiveClients > 0) {
      insights.push({
        type:
          reactivationPercentage >= 40
            ? "attention"
            : "info",
        title:
          "Reactivation opportunity",
        text: `${nonActiveClients.toLocaleString(
          "en-IN"
        )} non-active clients may need follow-up.`,
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
          title:
            "Client acquisition is increasing",
          text: `${latest.value} clients were acquired in ${latest.month}.`,
        });
      } else if (difference < 0) {
        insights.push({
          type: "attention",
          title:
            "Recent acquisition has slowed",
          text: `Latest acquisition decreased from ${previous.value} to ${latest.value}.`,
        });
      } else {
        insights.push({
          type: "info",
          title: "Acquisition is stable",
          text: `Latest month recorded ${latest.value} client acquisitions.`,
        });
      }
    }

    if (largestIndustry) {
      insights.push({
        type: "info",
        title:
          "Largest client segment",
        text: `${largestIndustry.name} has ${largestIndustry.value.toLocaleString(
          "en-IN"
        )} clients.`,
      });
    }

    if (unassignedClients > 0) {
      insights.push({
        type: "attention",
        title:
          "Assignment data needs review",
        text: `${unassignedClients.toLocaleString(
          "en-IN"
        )} clients are missing a franchisee or team leader.`,
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

  // =========================================================
  // RESET
  // =========================================================

  const resetFilters = () => {
    setStatusFilter("All");
    setIndustryFilter("All");
    setFranchiseeFilter("All");
    setTeamLeaderFilter("All");
  };

  // =========================================================
  // COMPARISON COMPONENT
  // =========================================================

  const Comparison = ({
    value,
    percentagePoint = false,
    inverse = false,
  }) => {
    if (period === "all") {
      return (
        <span
          style={{
            fontSize: 12,
            color: colors.lightText,
          }}
        >
          All available data
        </span>
      );
    }

    if (value === null) {
      return (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.green,
          }}
        >
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
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: isGood
            ? colors.green
            : colors.red,
        }}
      >
        {positive ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}

        {Math.abs(value).toFixed(1)}
        {percentagePoint ? " pp" : "%"}

        <span
          style={{
            fontWeight: 400,
            color: colors.lightText,
          }}
        >
          vs previous
        </span>
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <RefreshCw
            size={38}
            className="spin"
            style={{
              color: colors.lavender,
            }}
          />

          <p
            style={{
              marginTop: 16,
              color: colors.muted,
              fontSize: 14,
            }}
          >
            Loading client analytics...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div
        style={{
          background: colors.white,
          border: `1px solid #fecaca`,
          borderRadius: 18,
          padding: 50,
          textAlign: "center",
        }}
      >
        <UserX
          size={42}
          style={{
            color: colors.red,
          }}
        />

        <h3
          style={{
            marginTop: 16,
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          Unable to Load Clients
        </h3>

        <p
          style={{
            marginTop: 8,
            color: colors.muted,
            fontSize: 14,
          }}
        >
          {error}
        </p>

        <button
          onClick={fetchClients}
          style={{
            marginTop: 20,
            border: "none",
            borderRadius: 10,
            padding: "11px 20px",
            background:
              "linear-gradient(135deg,#8065a5,#9b82bd)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >

      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <section
        style={{
          background: colors.white,
          border: `1px solid ${colors.lavenderBorder}`,
          borderRadius: 18,
          padding: 22,
          boxShadow:
            "0 4px 18px rgba(100,80,130,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background:
                  colors.lavenderLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter
                size={21}
                color={colors.lavender}
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Client Analytics Filters
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  color: colors.muted,
                  fontSize: 13,
                }}
              >
                Change filters to dynamically
                update the analytics.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setViewMode("chart")
              }
              style={{
                border: "none",
                padding: "9px 15px",
                background:
                  viewMode === "chart"
                    ? colors.lavender
                    : colors.white,
                color:
                  viewMode === "chart"
                    ? colors.white
                    : colors.muted,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Chart View
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode("table")
              }
              style={{
                border: "none",
                padding: "9px 15px",
                background:
                  viewMode === "table"
                    ? colors.lavender
                    : colors.white,
                color:
                  viewMode === "table"
                    ? colors.white
                    : colors.muted,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Table View
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={selectStyle}
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
            style={selectStyle}
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
              setFranchiseeFilter(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="All">
              All Franchisees
            </option>

            {franchisees.map(
              (franchisee) => (
                <option
                  key={franchisee}
                  value={franchisee}
                >
                  {franchisee}
                </option>
              )
            )}
          </select>

          <select
            value={teamLeaderFilter}
            onChange={(e) =>
              setTeamLeaderFilter(
                e.target.value
              )
            }
            style={selectStyle}
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

        <div
          style={{
            marginTop: 14,
            textAlign: "right",
          }}
        >
          <button
            onClick={resetFilters}
            style={{
              border: "none",
              background: "transparent",
              color: colors.lavender,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(210px,1fr))",
          gap: 18,
        }}
      >
        <KpiCard
          background="#f0fbff"
          border="#c7f0fa"
          iconBackground="#dff7fc"
          icon={<Users size={22} />}
          iconColor={colors.cyan}
          title="Total Clients"
          value={totalClients}
          comparison={
            <Comparison
              value={totalChange}
            />
          }
        />

        <KpiCard
          background="#effcf6"
          border="#c9f1df"
          iconBackground="#ddf8eb"
          icon={<UserCheck size={22} />}
          iconColor={colors.green}
          title="Active Clients"
          value={activeClients}
          comparison={
            <Comparison
              value={activeChange}
            />
          }
        />

        <KpiCard
          background="#fff4f6"
          border="#fbd5dc"
          iconBackground="#ffe5e9"
          icon={<UserX size={22} />}
          iconColor={colors.red}
          title="Reactivation Opportunity"
          value={nonActiveClients}
          comparison={
            <Comparison
              value={nonActiveChange}
              inverse
            />
          }
        />

        <KpiCard
          background="#f8f4ff"
          border="#e6dcf5"
          iconBackground="#eee5fa"
          icon={<Target size={22} />}
          iconColor={colors.lavender}
          title="Active Client %"
          value={`${activePercentage.toFixed(
            1
          )}%`}
          comparison={
            <Comparison
              value={activePercentageChange}
              percentagePoint
            />
          }
        />
      </section>

      {/* =====================================================
          STATUS + ACQUISITION
      ====================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(400px,1fr))",
          gap: 20,
        }}
      >

        {/* ===================================================
            STATUS
        ==================================================== */}

        <div style={cardStyle}>

          <CardHeader
            icon={<Activity size={20} />}
            iconBackground="#e5f9f1"
            iconColor={colors.green}
            title="Client Status Mix"
            subtitle="Distribution of all client statuses in the selected period."
          />

          {viewMode === "chart" ? (
            statusData.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(250px,1fr) minmax(200px,1fr)",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 16,
                }}
              >

                {/* DONUT */}

                <div
                  style={{
                    height: 290,
                    position: "relative",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={105}
                        paddingAngle={3}
                        stroke="#ffffff"
                        strokeWidth={3}
                      >
                        {statusData.map(
                          (
                            entry,
                            index
                          ) => (
                            <Cell
                              key={`status-${entry.name}-${index}`}
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

                      <Tooltip
                        formatter={(
                          value,
                          name
                        ) => [
                          `${Number(
                            value
                          ).toLocaleString(
                            "en-IN"
                          )} clients`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div
                    style={{
                      position:
                        "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      pointerEvents:
                        "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: colors.lightText,
                      }}
                    >
                      Total Clients
                    </span>

                    <strong
                      style={{
                        marginTop: 4,
                        fontSize: 25,
                        color: colors.text,
                      }}
                    >
                      {totalClients.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>

                {/* LEGEND */}

                <div
                  style={{
                    maxHeight: 290,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {statusData.map(
                    (item, index) => {
                      const percentage =
                        totalClients > 0
                          ? (item.value /
                              totalClients) *
                            100
                          : 0;

                      const color =
                        statusColors[
                          index %
                            statusColors.length
                        ];

                      return (
                        <div
                          key={item.name}
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: 8,
                            padding:
                              "9px 10px",
                            marginBottom: 7,
                            borderRadius: 10,
                            background:
                              "#f8fafc",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                minWidth: 10,
                                borderRadius:
                                  "50%",
                                background:
                                  color,
                              }}
                            />

                            <span
                              style={{
                                fontSize: 13,
                                color:
                                  colors.text,
                                fontWeight: 500,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                              title={item.name}
                            >
                              {item.name}
                            </span>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                            }}
                          >
                            <strong
                              style={{
                                fontSize: 13,
                                color:
                                  colors.text,
                              }}
                            >
                              {item.value.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <span
                              style={{
                                fontSize: 11,
                                color:
                                  colors.lightText,
                              }}
                            >
                              {percentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <EmptyState text="No client status data available for this period." />
            )
          ) : (
            <StatusTable
              statusData={statusData}
              totalClients={totalClients}
              statusColors={statusColors}
            />
          )}
        </div>

        {/* ===================================================
            ACQUISITION
        ==================================================== */}

        <div style={cardStyle}>

          <CardHeader
            icon={<TrendingUp size={20} />}
            iconBackground="#f0eafa"
            iconColor={colors.lavender}
            title="Client Acquisition Trend"
            subtitle="Clients acquired during the selected period."
          />

          {viewMode === "chart" ? (
            <div
              style={{
                height: 290,
                marginTop: 15,
              }}
            >
              {acquisitionData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      acquisitionData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={
                        colors.lavender
                      }
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill:
                          colors.lavender,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Acquisition date data is not available for this period." />
              )}
            </div>
          ) : (
            <AcquisitionTable
              data={acquisitionData}
            />
          )}
        </div>
      </section>

      {/* =====================================================
          INDUSTRY + ENGAGEMENT
      ====================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(400px,1fr))",
          gap: 20,
        }}
      >

        {/* ===================================================
            INDUSTRY
        ==================================================== */}

        <div style={cardStyle}>

          <CardHeader
            icon={<Building2 size={20} />}
            iconBackground="#e0f8fc"
            iconColor={colors.cyan}
            title="Clients by Industry"
            subtitle="Major industry segments in the selected client base."
          />

          {viewMode === "chart" ? (
            <div
              style={{
                height: 300,
                marginTop: 15,
              }}
            >
              {industryData.length >
              0 ? (
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
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={125}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill={
                        colors.cyan
                      }
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No industry data available." />
              )}
            </div>
          ) : (
            <IndustryTable
              data={industryData}
            />
          )}
        </div>

        {/* ===================================================
            ENGAGEMENT
        ==================================================== */}

        <div style={cardStyle}>

          <CardHeader
            icon={<Activity size={20} />}
            iconBackground="#fff0e8"
            iconColor={colors.orange}
            title="Client Engagement"
            subtitle="Active clients versus potential reactivation opportunities."
          />

          {viewMode === "chart" ? (
            <div
              style={{
                height: 270,
                marginTop: 15,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    engagementData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill={
                      colors.orange
                    }
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
            <div
              style={{
                marginTop: 15,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >
                    <th
                      style={tableHead}
                    >
                      Engagement
                    </th>

                    <th
                      style={{
                        ...tableHead,
                        textAlign:
                          "right",
                      }}
                    >
                      Clients
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {engagementData.map(
                    (row) => (
                      <tr
                        key={
                          row.name
                        }
                        style={{
                          borderTop:
                            `1px solid ${colors.border}`,
                        }}
                      >
                        <td
                          style={
                            tableCell
                          }
                        >
                          {row.name}
                        </td>

                        <td
                          style={{
                            ...tableCell,
                            textAlign:
                              "right",
                          }}
                        >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 12,
              marginTop: 18,
            }}
          >
            <div
              style={{
                background:
                  "#ecfdf5",
                borderRadius: 12,
                padding: 15,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color:
                    colors.green,
                }}
              >
                Active Base
              </p>

              <strong
                style={{
                  display:
                    "block",
                  marginTop: 5,
                  fontSize: 21,
                  color:
                    colors.text,
                }}
              >
                {activeClients.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div
              style={{
                background:
                  "#fff7ed",
                borderRadius: 12,
                padding: 15,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color:
                    colors.orange,
                }}
              >
                Reactivation Pool
              </p>

              <strong
                style={{
                  display:
                    "block",
                  marginTop: 5,
                  fontSize: 21,
                  color:
                    colors.text,
                }}
              >
                {nonActiveClients.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SMART INSIGHTS
      ====================================================== */}

      <section
        style={{
          background:
            "linear-gradient(135deg,#f6f1ff,#ffffff,#effbff)",
          border: `1px solid ${colors.lavenderBorder}`,
          borderRadius: 18,
          padding: 22,
          boxShadow:
            "0 4px 18px rgba(100,80,130,0.05)",
        }}
      >
        <CardHeader
          icon={<Lightbulb size={20} />}
          iconBackground="#eee5fa"
          iconColor={colors.lavender}
          title="Smart Client Insights"
          subtitle="Automatically generated observations from the selected client data."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(260px,1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
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
                  style={{
                    borderRadius: 12,
                    padding: 15,
                    border: `1px solid ${
                      isAttention
                        ? "#fecdd3"
                        : isPositive
                        ? "#bbf7d0"
                        : colors.border
                    }`,
                    background:
                      isAttention
                        ? "#fff1f2"
                        : isPositive
                        ? "#f0fdf4"
                        : "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "flex-start",
                      gap: 10,
                    }}
                  >
                    {isAttention ? (
                      <AlertCircle
                        size={19}
                        color={
                          colors.red
                        }
                      />
                    ) : isPositive ? (
                      <TrendingUp
                        size={19}
                        color={
                          colors.green
                        }
                      />
                    ) : (
                      <Lightbulb
                        size={19}
                        color={
                          colors.lavender
                        }
                      />
                    )}

                    <div>
                      <strong
                        style={{
                          display:
                            "block",
                          fontSize: 14,
                          color:
                            colors.text,
                        }}
                      >
                        {insight.title}
                      </strong>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          fontSize: 13,
                          lineHeight: 1.5,
                          color:
                            colors.muted,
                        }}
                      >
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

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <section
        style={{
          background:
            "linear-gradient(90deg,#effcff,#ffffff,#f6f1ff)",
          border: "1px solid #dff2f8",
          borderRadius: 16,
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                fontSize: 14,
                color:
                  colors.text,
              }}
            >
              Client Analytics
            </strong>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color:
                  colors.muted,
              }}
            >
              Showing{" "}
              <strong>
                {filteredClients.length.toLocaleString(
                  "en-IN"
                )}
              </strong>{" "}
              clients matching the selected
              filters.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 7,
              color:
                colors.green,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius:
                  "50%",
                background:
                  colors.green,
              }}
            />

            Live API data
          </div>
        </div>
      </section>
    </div>
  );
}

// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function KpiCard({
  background,
  border,
  iconBackground,
  icon,
  iconColor,
  title,
  value,
  comparison,
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: 17,
        padding: 20,
        boxShadow:
          "0 4px 15px rgba(80,70,100,0.05)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: "17px 0 0",
          fontSize: 13,
          color: "#64748b",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          margin: "4px 0 0",
          fontSize: 29,
          fontWeight: 700,
          color: "#334155",
        }}
      >
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </h3>

      <div
        style={{
          marginTop: 7,
        }}
      >
        {comparison}
      </div>
    </div>
  );
}

function CardHeader({
  icon,
  iconBackground,
  iconColor,
  title,
  subtitle,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: iconBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#334155",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        height: 270,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function StatusTable({
  statusData,
  totalClients,
  statusColors,
}) {
  return (
    <div
      style={{
        marginTop: 16,
        overflowX: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse:
            "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background:
                "#f8fafc",
            }}
          >
            <th style={tableHead}>
              Status
            </th>

            <th
              style={{
                ...tableHead,
                textAlign: "right",
              }}
            >
              Clients
            </th>

            <th
              style={{
                ...tableHead,
                textAlign: "right",
              }}
            >
              Percentage
            </th>
          </tr>
        </thead>

        <tbody>
          {statusData.map(
            (row, index) => (
              <tr
                key={row.name}
                style={{
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <td style={tableCell}>
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius:
                          "50%",
                        background:
                          statusColors[
                            index %
                              statusColors.length
                          ],
                      }}
                    />

                    {row.name}
                  </div>
                </td>

                <td
                  style={{
                    ...tableCell,
                    textAlign:
                      "right",
                  }}
                >
                  {row.value.toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td
                  style={{
                    ...tableCell,
                    textAlign:
                      "right",
                  }}
                >
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
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function AcquisitionTable({
  data,
}) {
  return (
    <div
      style={{
        marginTop: 16,
        overflowX: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      }}
    >
      {data.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "#f8fafc",
              }}
            >
              <th style={tableHead}>
                Month
              </th>

              <th
                style={{
                  ...tableHead,
                  textAlign: "right",
                }}
              >
                Clients Acquired
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row.month}
                style={{
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <td style={tableCell}>
                  {row.month}
                </td>

                <td
                  style={{
                    ...tableCell,
                    textAlign:
                      "right",
                  }}
                >
                  {row.value.toLocaleString(
                    "en-IN"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState text="Acquisition date data is not available for this period." />
      )}
    </div>
  );
}

function IndustryTable({
  data,
}) {
  return (
    <div
      style={{
        marginTop: 16,
        overflowX: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      }}
    >
      {data.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "#f8fafc",
              }}
            >
              <th style={tableHead}>
                Industry
              </th>

              <th
                style={{
                  ...tableHead,
                  textAlign:
                    "right",
                }}
              >
                Clients
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row.name}
                style={{
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <td style={tableCell}>
                  {row.name}
                </td>

                <td
                  style={{
                    ...tableCell,
                    textAlign:
                      "right",
                  }}
                >
                  {row.value.toLocaleString(
                    "en-IN"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState text="No industry data available." />
      )}
    </div>
  );
}

// ===========================================================
// SHARED STYLES
// ===========================================================

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e7def5",
  borderRadius: 18,
  padding: 22,
  boxShadow:
    "0 4px 18px rgba(100,80,130,0.06)",
};

const selectStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#ffffff",
  color: "#334155",
  fontSize: 13,
  outline: "none",
  cursor: "pointer",
};

const tableHead = {
  padding: "11px 14px",
  textAlign: "left",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const tableCell = {
  padding: "11px 14px",
  color: "#475569",
  fontSize: 13,
};

// ===========================================================
// EXPORT
// ===========================================================

export default Clients;
