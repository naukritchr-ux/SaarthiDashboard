import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Building2,
  Users,
  UserRound,
  BriefcaseBusiness,
  Filter,
  RefreshCw,
  BarChart3,
  Table2,
  Lightbulb,
  AlertCircle,
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
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

import {
  getPeriodRange,
  getPeriodLabel,
} from "../utils/dateFilter";

const API_URL =
  "http://localhost:5000/api/dashboard/enquiries";

const COLORS = [
  "#8065a5",
  "#9b82bd",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
];

const STATUS_COLORS = {
  closed: "#10b981",
  cancelled: "#ef4444",
  inprogress: "#8065a5",
  offered_and_accepted: "#06b6d4",
};

/* ============================================================
   BASIC HELPERS
============================================================ */

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number(value || 0)
  );
}

function cleanText(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not Available";
  }

  return String(value).trim();
}

/* ============================================================
   DATE
============================================================ */

function getEnquiryDate(enquiry) {
  const rawDate =
    enquiry?.dateOfAllocation ||
    enquiry?.date_of_allocation ||
    enquiry?.created_at ||
    enquiry?.createdAt ||
    enquiry?.created_date ||
    enquiry?.createdDate ||
    enquiry?.enquiryDate ||
    enquiry?.enquiry_date ||
    enquiry?.dateOfEnquiry ||
    enquiry?.date_of_enquiry ||
    enquiry?.updated_at ||
    enquiry?.updatedAt;

  if (!rawDate) {
    return null;
  }

  const text = String(rawDate).trim();

  if (!text) {
    return null;
  }

  const slashMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
  );

  if (slashMatch) {
    const [, day, month, year] = slashMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  const dashMatch = text.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})/
  );

  if (dashMatch) {
    const [, day, month, year] = dashMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
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
   FIELD HELPERS
============================================================ */

function getStatus(enquiry) {
  return cleanText(
    enquiry?.enquiryStatus ||
      enquiry?.status ||
      enquiry?.enquiry_status ||
      enquiry?.Status
  ).toLowerCase();
}

function getPosition(enquiry) {
  return cleanText(
    enquiry?.positionName ||
      enquiry?.position ||
      enquiry?.jobPosition ||
      enquiry?.job_position ||
      enquiry?.jobTitle ||
      enquiry?.job_title ||
      enquiry?.designation
  );
}

function getFranchisee(enquiry) {
  return cleanText(
    enquiry?.franchiseeName ||
      enquiry?.franchisee ||
      enquiry?.franchisee_name
  );
}

function getTeamLeader(enquiry) {
  return cleanText(
    enquiry?.teamLeaderName ||
      enquiry?.teamLeader ||
      enquiry?.team_leader ||
      enquiry?.team_leader_name ||
      enquiry?.teamleader
  );
}

function getBDMember(enquiry) {
  return cleanText(
    enquiry?.bdMemberName ||
      enquiry?.bdMember ||
      enquiry?.bd_member ||
      enquiry?.bdName ||
      enquiry?.bd_name ||
      enquiry?.businessDevelopment
  );
}

function getCompany(enquiry) {
  return cleanText(
    enquiry?.companyName ||
      enquiry?.clientName ||
      enquiry?.company ||
      enquiry?.client ||
      enquiry?.company_name ||
      enquiry?.client_name
  );
}

function getCandidate(enquiry) {
  return cleanText(
    enquiry?.candidateName ||
      enquiry?.candidate ||
      enquiry?.candidate_name ||
      enquiry?.name
  );
}

function getHRExecutive(enquiry) {
  return cleanText(
    enquiry?.hrExecutiveName ||
      enquiry?.hrExecutive ||
      enquiry?.hr_executive ||
      enquiry?.hr_executive_name
  );
}

function getStatusLabel(status) {
  if (!status) {
    return "Not Available";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusCategory(status) {
  const value = String(status || "").toLowerCase();

  if (
    value === "closed" ||
    value === "converted" ||
    value === "offered_and_accepted" ||
    value === "offered and accepted"
  ) {
    return "Closed";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "Cancelled";
  }

  return "Open";
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Enquiries({ period = "all" }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [positionFilter, setPositionFilter] =
    useState("All");

  const [franchiseeFilter, setFranchiseeFilter] =
    useState("All");

  const [teamLeaderFilter, setTeamLeaderFilter] =
    useState("All");

  const [viewMode, setViewMode] =
    useState("charts");

  /* ==========================================================
     FETCH ENQUIRIES
  ========================================================== */

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (
        Array.isArray(response.data?.data?.data)
      ) {
        data = response.data.data.data;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        data = response.data.data;
      } else if (
        Array.isArray(response.data?.rows)
      ) {
        data = response.data.rows;
      } else if (
        Array.isArray(response.data?.results)
      ) {
        data = response.data.results;
      }

      console.log(
        "Sarthi360 Enquiries received:",
        data.length
      );

      if (data.length > 0) {
        console.log(
          "First enquiry record:",
          data[0]
        );
      }

      setEnquiries(data);
    } catch (err) {
      console.error(
        "Enquiries API Error:",
        err
      );

      setError(
        "Unable to load enquiry data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  /* ==========================================================
     PERIOD FILTER
  ========================================================== */

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  const periodEnquiries = useMemo(() => {
    if (
      !periodRange.startDate ||
      !periodRange.endDate
    ) {
      return enquiries;
    }

    return enquiries.filter((enquiry) => {
      const date = getEnquiryDate(enquiry);

      if (!date) {
        return false;
      }

      return (
        date >= periodRange.startDate &&
        date <= periodRange.endDate
      );
    });
  }, [enquiries, periodRange]);

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const statusOptions = useMemo(() => {
    return [
      ...new Set(
        periodEnquiries
          .map(getStatus)
          .filter(
            (item) =>
              item !== "not available"
          )
      ),
    ].sort();
  }, [periodEnquiries]);

  const positionOptions = useMemo(() => {
    return [
      ...new Set(
        periodEnquiries
          .map(getPosition)
          .filter(
            (item) =>
              item !== "Not Available"
          )
      ),
    ].sort();
  }, [periodEnquiries]);

  const franchiseeOptions = useMemo(() => {
    return [
      ...new Set(
        periodEnquiries
          .map(getFranchisee)
          .filter(
            (item) =>
              item !== "Not Available"
          )
      ),
    ].sort();
  }, [periodEnquiries]);

  const teamLeaderOptions = useMemo(() => {
    return [
      ...new Set(
        periodEnquiries
          .map(getTeamLeader)
          .filter(
            (item) =>
              item !== "Not Available"
          )
      ),
    ].sort();
  }, [periodEnquiries]);

  /* ==========================================================
     FILTERED ENQUIRIES
  ========================================================== */

  const filteredEnquiries = useMemo(() => {
    return periodEnquiries.filter((enquiry) => {
      const status = getStatus(enquiry);
      const position = getPosition(enquiry);
      const franchisee =
        getFranchisee(enquiry);
      const teamLeader =
        getTeamLeader(enquiry);

      return (
        (statusFilter === "All" ||
          status === statusFilter) &&
        (positionFilter === "All" ||
          position === positionFilter) &&
        (franchiseeFilter === "All" ||
          franchisee === franchiseeFilter) &&
        (teamLeaderFilter === "All" ||
          teamLeader === teamLeaderFilter)
      );
    });
  }, [
    periodEnquiries,
    statusFilter,
    positionFilter,
    franchiseeFilter,
    teamLeaderFilter,
  ]);

  /* ==========================================================
     KPI DATA
  ========================================================== */

  const kpis = useMemo(() => {
    let closed = 0;
    let open = 0;
    let cancelled = 0;

    filteredEnquiries.forEach((enquiry) => {
      const category =
        getStatusCategory(
          getStatus(enquiry)
        );

      if (category === "Closed") {
        closed++;
      } else if (
        category === "Cancelled"
      ) {
        cancelled++;
      } else {
        open++;
      }
    });

    const total =
      filteredEnquiries.length;

    const conversionRate =
      total > 0
        ? (closed / total) * 100
        : 0;

    const uniquePositions =
      new Set(
        filteredEnquiries
          .map(getPosition)
          .filter(
            (item) =>
              item !== "Not Available"
          )
      ).size;

    const uniqueClients =
      new Set(
        filteredEnquiries
          .map(getCompany)
          .filter(
            (item) =>
              item !== "Not Available"
          )
      ).size;

    return {
      total,
      closed,
      open,
      cancelled,
      conversionRate,
      uniquePositions,
      uniqueClients,
    };
  }, [filteredEnquiries]);

  /* ==========================================================
     FUNNEL
  ========================================================== */

  const funnelData = useMemo(() => {
    return [
      {
        name: "Total Enquiries",
        value: kpis.total,
        fill: "#06b6d4",
      },
      {
        name: "Open / In Progress",
        value: kpis.open,
        fill: "#8065a5",
      },
      {
        name: "Closed / Converted",
        value: kpis.closed,
        fill: "#10b981",
      },
    ];
  }, [
    kpis.total,
    kpis.open,
    kpis.closed,
  ]);

  /* ==========================================================
     STATUS CHART
  ========================================================== */

  const statusChartData = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const status = getStatus(enquiry);

      map[status] =
        (map[status] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        label: getStatusLabel(name),
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [filteredEnquiries]);

  /* ==========================================================
     ENQUIRY TREND
  ========================================================== */

  const monthlyTrend = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const date =
        getEnquiryDate(enquiry);

      if (!date) {
        return;
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!map[key]) {
        map[key] = {
          key,
          month:
            date.toLocaleDateString(
              "en-IN",
              {
                month: "short",
                year: "numeric",
              }
            ),
          enquiries: 0,
        };
      }

      map[key].enquiries++;
    });

    return Object.values(map).sort(
      (a, b) =>
        a.key.localeCompare(b.key)
    );
  }, [filteredEnquiries]);

  /* ==========================================================
     TOP POSITIONS
  ========================================================== */

  const topPositions = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const position =
        getPosition(enquiry);

      if (
        position === "Not Available"
      ) {
        return;
      }

      map[position] =
        (map[position] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 10);
  }, [filteredEnquiries]);

  /* ==========================================================
     TOP FRANCHISEES
  ========================================================== */

  const topFranchisees = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const franchisee =
        getFranchisee(enquiry);

      if (
        franchisee ===
        "Not Available"
      ) {
        return;
      }

      map[franchisee] =
        (map[franchisee] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 8);
  }, [filteredEnquiries]);

  /* ==========================================================
     TOP TEAM LEADERS
  ========================================================== */

  const topTeamLeaders = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const leader =
        getTeamLeader(enquiry);

      if (
        leader ===
        "Not Available"
      ) {
        return;
      }

      map[leader] =
        (map[leader] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 8);
  }, [filteredEnquiries]);

  /* ==========================================================
     TOP BD MEMBERS
  ========================================================== */

  const topBDMembers = useMemo(() => {
    const map = {};

    filteredEnquiries.forEach((enquiry) => {
      const bd =
        getBDMember(enquiry);

      if (
        bd ===
        "Not Available"
      ) {
        return;
      }

      map[bd] =
        (map[bd] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 8);
  }, [filteredEnquiries]);

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setStatusFilter("All");
    setPositionFilter("All");
    setFranchiseeFilter("All");
    setTeamLeaderFilter("All");
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#8065a5",
          }}
        >
          <RefreshCw size={32} />

          <p
            style={{
              marginTop: "12px",
              fontWeight: 700,
            }}
          >
            Loading enquiry data...
          </p>
        </div>
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
          background: "#ffffff",
          border: "1px solid #f1d4d4",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <AlertCircle
          size={42}
          color="#ef4444"
        />

        <h2
          style={{
            color: "#3f344a",
          }}
        >
          Unable to Load Enquiries
        </h2>

        <p
          style={{
            color: "#7a7083",
          }}
        >
          {error}
        </p>

        <button
          type="button"
          onClick={fetchEnquiries}
          style={{
            border: "none",
            background: "#8065a5",
            color: "#ffffff",
            padding: "11px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#ffffff 0%,#faf8ff 100%)",
          border:
            "1px solid #e7def5",
          borderRadius: "16px",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#eee7f8",
              color: "#8065a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClipboardList size={22} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                color: "#3f344a",
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              Enquiry Analytics
            </h2>

            <p
              style={{
                margin: "3px 0 0",
                color: "#7a7083",
                fontSize: "12px",
              }}
            >
              Enquiry pipeline, status and performance
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#f3effb",
            color: "#684d8c",
            borderRadius: "10px",
            padding: "8px 13px",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          {getPeriodLabel(period)}
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e7def5",
          borderRadius: "15px",
          padding: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#684d8c",
            fontWeight: 800,
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          <Filter size={17} />
          Enquiry Analytics Filters
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,minmax(0,1fr)) auto",
            gap: "10px",
          }}
        >
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            label="All Status"
            formatter={getStatusLabel}
          />

          <FilterSelect
            value={positionFilter}
            onChange={setPositionFilter}
            options={positionOptions}
            label="All Positions"
          />

          <FilterSelect
            value={franchiseeFilter}
            onChange={setFranchiseeFilter}
            options={franchiseeOptions}
            label="All Franchisees"
          />

          <FilterSelect
            value={teamLeaderFilter}
            onChange={setTeamLeaderFilter}
            options={teamLeaderOptions}
            label="All Team Leaders"
          />

          <button
            type="button"
            onClick={resetFilters}
            style={{
              border:
                "1px solid #d7c8ec",
              background:
                "#faf8ff",
              color:
                "#684d8c",
              borderRadius:
                "9px",
              padding:
                "9px 14px",
              fontWeight: 700,
              cursor:
                "pointer",
              whiteSpace:
                "nowrap",
            }}
          >
            Reset Filters
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          <ViewButton
            active={viewMode === "charts"}
            onClick={() => setViewMode("charts")}
            icon={<BarChart3 size={15} />}
            label="Charts"
          />

          <ViewButton
            active={viewMode === "table"}
            onClick={() => setViewMode("table")}
            icon={<Table2 size={15} />}
            label="Table View"
          />
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",
          gap: "14px",
        }}
      >
        <KpiCard
          icon={<ClipboardList size={19} />}
          label="Total Enquiries"
          value={formatNumber(kpis.total)}
          type="purple"
        />

        <KpiCard
          icon={<CheckCircle2 size={19} />}
          label="Closed / Converted"
          value={formatNumber(kpis.closed)}
          type="green"
        />

        <KpiCard
          icon={<Clock3 size={19} />}
          label="Open / In Progress"
          value={formatNumber(kpis.open)}
          type="blue"
        />

        <KpiCard
          icon={<TrendingUp size={19} />}
          label="Conversion Rate"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          type="orange"
        />
      </div>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      {viewMode === "charts" ? (
        <>
          {/* ==================================================
              ROW 1 - FUNNEL + STATUS
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <ChartCard
              title="Enquiry Conversion Funnel"
              subtitle="Movement from total enquiries toward closure"
            >
              <div
                style={{
                  height: "250px",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <FunnelChart>
                    <Tooltip />

                    <Funnel
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                    >
                      <LabelList
                        position="inside"
                        fill="#ffffff"
                        stroke="none"
                        dataKey="value"
                        formatter={(value) =>
                          formatNumber(value)
                        }
                      />

                      {funnelData.map(
                        (entry, index) => (
                          <Cell
                            key={`funnel-${index}`}
                            fill={entry.fill}
                          />
                        )
                      )}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "8px",
                }}
              >
                <MiniMetric
                  label="Total"
                  value={kpis.total}
                  color="#06b6d4"
                />

                <MiniMetric
                  label="Open"
                  value={kpis.open}
                  color="#8065a5"
                />

                <MiniMetric
                  label="Closed"
                  value={kpis.closed}
                  color="#10b981"
                />
              </div>
            </ChartCard>

            <ChartCard
              title="Enquiry Status Distribution"
              subtitle="Current status mix within selected filters"
            >
              <div
                style={{
                  height: "300px",
                }}
              >
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={102}
                        paddingAngle={3}
                      >
                        {statusChartData.map(
                          (entry, index) => (
                            <Cell
                              key={`status-${index}`}
                              fill={
                                STATUS_COLORS[
                                  entry.name
                                ] ||
                                COLORS[
                                  index %
                                    COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          formatNumber(value),
                          "Enquiries",
                        ]}
                      />

                      <Legend
                        verticalAlign="bottom"
                        height={45}
                        formatter={(value) =>
                          getStatusLabel(value)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </ChartCard>
          </div>

          {/* ==================================================
              ROW 2 - TREND + POSITION
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <ChartCard
              title="Enquiry Trend"
              subtitle="Enquiries received during the selected period"
            >
              <div
                style={{
                  height: "290px",
                }}
              >
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={monthlyTrend}
                      margin={{
                        top: 15,
                        right: 15,
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
                        dataKey="month"
                        tick={{
                          fill: "#756b7d",
                          fontSize: 10,
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#ddd5e7",
                        }}
                      />

                      <YAxis
                        tick={{
                          fill: "#756b7d",
                          fontSize: 10,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        formatter={(value) => [
                          formatNumber(value),
                          "Enquiries",
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="enquiries"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          fill: "#06b6d4",
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Enquiries by Position"
              subtitle="Highest enquiry volumes by position"
            >
              <div
                style={{
                  height: "290px",
                }}
              >
                {topPositions.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={topPositions}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#eee7f5"
                      />

                      <XAxis
                        type="number"
                        tick={{
                          fill: "#756b7d",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={135}
                        tick={{
                          fill: "#756b7d",
                          fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Enquiries"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={22}
                      >
                        {topPositions.map(
                          (_, index) => (
                            <Cell
                              key={`position-${index}`}
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
                  <EmptyChart />
                )}
              </div>
            </ChartCard>
          </div>

          {/* ==================================================
              ROW 3 - FRANCHISEES + TEAM LEADERS
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <RankingChart
              title="Top Franchisees"
              subtitle="Franchisees generating the highest enquiry volume"
              icon={<Building2 size={17} />}
              data={topFranchisees}
            />

            <RankingChart
              title="Top Team Leaders"
              subtitle="Team leaders handling the highest enquiry volume"
              icon={<UserRound size={17} />}
              data={topTeamLeaders}
            />
          </div>

          {/* ==================================================
              ROW 4 - BD MEMBERS + INSIGHTS
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <ChartCard
              title="Top BD Members"
              subtitle="Business development enquiry contribution"
            >
              <div
                style={{
                  height: "290px",
                }}
              >
                {topBDMembers.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={topBDMembers}
                      margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 55,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#eee7f5"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={75}
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
                        tick={{
                          fill: "#756b7d",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Enquiries"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      >
                        {topBDMembers.map(
                          (_, index) => (
                            <Cell
                              key={`bd-${index}`}
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
                  <EmptyChart />
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Enquiry Insights"
              subtitle="Automatically generated observations from the selected enquiry data"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <InsightBox
                  icon={<CheckCircle2 size={16} />}
                  title="Strong Conversion"
                  text={`${kpis.conversionRate.toFixed(
                    1
                  )}% of the filtered enquiries are currently classified as closed or converted.`}
                  type="green"
                />

                <InsightBox
                  icon={<Clock3 size={16} />}
                  title="Open Enquiries"
                  text={`${formatNumber(
                    kpis.open
                  )} enquiries remain open or in progress and may require follow-up.`}
                  type="purple"
                />

                <InsightBox
                  icon={
                    <BriefcaseBusiness size={16} />
                  }
                  title="Position Demand"
                  text={
                    topPositions.length > 0
                      ? `${topPositions[0].name} currently has the highest enquiry volume.`
                      : "Position data is not available."
                  }
                  type="blue"
                />

                <InsightBox
                  icon={<Users size={16} />}
                  title="Client Coverage"
                  text={`${formatNumber(
                    kpis.uniqueClients
                  )} unique clients are represented in the selected enquiry data.`}
                  type="orange"
                />
              </div>
            </ChartCard>
          </div>
        </>
      ) : (
        /* ======================================================
           TABLE VIEW
        ====================================================== */

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e7def5",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "17px 18px",
              borderBottom:
                "1px solid #eee7f5",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#3f344a",
                fontSize: "16px",
              }}
            >
              Enquiry Details
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "#857b8c",
                fontSize: "12px",
              }}
            >
              Showing{" "}
              {formatNumber(
                filteredEnquiries.length
              )}{" "}
              enquiry records
            </p>
          </div>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "1250px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#faf8ff",
                  }}
                >
                  {[
                    "Company",
                    "Candidate",
                    "Position",
                    "Status",
                    "BD Member",
                    "Team Leader",
                    "Franchisee",
                    "HR Executive",
                    "Allocation Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          "12px 14px",
                        textAlign: "left",
                        fontSize: "11px",
                        color: "#684d8c",
                        borderBottom:
                          "1px solid #e7def5",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredEnquiries
                  .slice(0, 500)
                  .map((enquiry, index) => {
                    const status =
                      getStatus(enquiry);

                    const category =
                      getStatusCategory(
                        status
                      );

                    const date =
                      getEnquiryDate(
                        enquiry
                      );

                    return (
                      <tr
                        key={
                          enquiry.id ||
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #f1edf5",
                        }}
                      >
                        <TableCell>
                          {getCompany(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {getCandidate(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {getPosition(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={status}
                            category={category}
                          />
                        </TableCell>

                        <TableCell>
                          {getBDMember(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {getTeamLeader(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {getFranchisee(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {getHRExecutive(
                            enquiry
                          )}
                        </TableCell>

                        <TableCell>
                          {date
                            ? date.toLocaleDateString(
                                "en-IN"
                              )
                            : "Not Available"}
                        </TableCell>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {filteredEnquiries.length > 500 && (
            <div
              style={{
                padding: "12px 16px",
                background: "#faf8ff",
                color: "#684d8c",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Showing the first 500 records for performance.
            </div>
          )}

          {filteredEnquiries.length === 0 && (
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                color: "#7a7083",
              }}
            >
              No enquiry records match the selected filters.
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#80758a",
          fontSize: "11px",
          padding: "4px 2px",
        }}
      >
        <span>
          Live enquiry data •{" "}
          {formatNumber(
            enquiries.length
          )}{" "}
          total API records
        </span>

        <button
          type="button"
          onClick={fetchEnquiries}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            border: "none",
            background: "transparent",
            color: "#684d8c",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} />
          Refresh
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
  type,
}) {
  const backgrounds = {
    purple: "#f3effb",
    green: "#ecfdf5",
    blue: "#ecfeff",
    orange: "#fff7ed",
  };

  const colors = {
    purple: "#8065a5",
    green: "#10b981",
    blue: "#06b6d4",
    orange: "#f59e0b",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e7def5",
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: 0,
        boxShadow:
          "0 3px 12px rgba(104,77,140,.04)",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "11px",
          background:
            backgrounds[type],
          color: colors[type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: "#766b7e",
            fontSize: "11px",
            marginBottom: "5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#3f344a",
            fontSize: "20px",
            fontWeight: 800,
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: "#a198aa",
            fontSize: "9px",
            marginTop: "2px",
          }}
        >
          Selected period
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CHART CARD
============================================================ */

function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e7def5",
        borderRadius: "15px",
        padding: "15px",
        minWidth: 0,
        boxShadow:
          "0 3px 12px rgba(104,77,140,.04)",
      }}
    >
      <div
        style={{
          marginBottom: "5px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#3f344a",
            fontSize: "14px",
            fontWeight: 800,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "3px 0 0",
            color: "#8a8091",
            fontSize: "10px",
          }}
        >
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   RANKING CHART
============================================================ */

function RankingChart({
  title,
  subtitle,
  icon,
  data,
}) {
  return (
    <ChartCard
      title={
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {icon}
          {title}
        </span>
      }
      subtitle={subtitle}
    >
      <div
        style={{
          height: "290px",
        }}
      >
        {data.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 15,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#eee7f5"
              />

              <XAxis
                type="number"
                tick={{
                  fill: "#756b7d",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={125}
                tick={{
                  fill: "#756b7d",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Enquiries"
                radius={[0, 6, 6, 0]}
                maxBarSize={22}
              >
                {data.map(
                  (_, index) => (
                    <Cell
                      key={`rank-${index}`}
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
          <EmptyChart />
        )}
      </div>
    </ChartCard>
  );
}

/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  value,
  onChange,
  options,
  label,
  formatter,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      style={{
        width: "100%",
        border: "1px solid #ddd4e8",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#51465b",
        padding: "9px 10px",
        fontSize: "11px",
        outline: "none",
      }}
    >
      <option value="All">
        {label}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {formatter
            ? formatter(option)
            : option}
        </option>
      ))}
    </select>
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
        border:
          "1px solid #d9cfea",
        borderRadius: "8px",
        padding: "7px 10px",
        background: active
          ? "#8065a5"
          : "#ffffff",
        color: active
          ? "#ffffff"
          : "#684d8c",
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
   MINI METRIC
============================================================ */

function MiniMetric({
  label,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: "#faf8ff",
        border:
          "1px solid #eee7f5",
        borderRadius: "9px",
        padding: "8px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#8a8091",
          fontSize: "9px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color,
          fontSize: "15px",
          fontWeight: 800,
          marginTop: "2px",
        }}
      >
        {formatNumber(value)}
      </div>
    </div>
  );
}

/* ============================================================
   INSIGHT
============================================================ */

function InsightBox({
  icon,
  title,
  text,
  type,
}) {
  const colors = {
    green: {
      bg: "#ecfdf5",
      color: "#059669",
    },
    purple: {
      bg: "#f3effb",
      color: "#8065a5",
    },
    blue: {
      bg: "#ecfeff",
      color: "#0891b2",
    },
    orange: {
      bg: "#fff7ed",
      color: "#d97706",
    },
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "11px",
        borderRadius: "10px",
        background:
          colors[type].bg,
        border:
          `1px solid ${colors[type].color}22`,
      }}
    >
      <div
        style={{
          color:
            colors[type].color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#4c4255",
            fontSize: "11px",
            fontWeight: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#766b7e",
            fontSize: "10px",
            lineHeight: 1.5,
            marginTop: "3px",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE CELL
============================================================ */

function TableCell({
  children,
}) {
  return (
    <td
      style={{
        padding: "10px 14px",
        fontSize: "11px",
        color: "#5d5366",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
  category,
}) {
  let background = "#f3effb";
  let color = "#684d8c";

  if (category === "Closed") {
    background = "#ecfdf5";
    color = "#047857";
  }

  if (category === "Cancelled") {
    background = "#fef2f2";
    color = "#b91c1c";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "10px",
        fontWeight: 700,
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* ============================================================
   EMPTY CHART
============================================================ */

function EmptyChart() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9b82bd",
        background: "#faf8ff",
        borderRadius: "10px",
        fontSize: "11px",
      }}
    >
      No data available for the selected filters.
    </div>
  );
}

export default Enquiries;