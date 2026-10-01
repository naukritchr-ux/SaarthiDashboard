import { useEffect, useMemo, useState } from "react";

import {
  Users,
  MessageSquare,
  IndianRupee,
  AlertTriangle,
  Target,
  Clock3,
  Wallet,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CircleAlert,
  ListChecks,
} from "lucide-react";

/* ============================================================
   API
============================================================ */

const API_URL =
  "/api/dashboard/summary";

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  purple: "#8065a5",
  purpleDark: "#684d8c",
  purpleLight: "#f3effb",

  cyan: "#06b6d4",
  cyanLight: "#ecfeff",

  green: "#10b981",
  greenLight: "#ecfdf5",

  orange: "#f59e0b",
  orangeLight: "#fff7ed",

  red: "#ef4444",
  redLight: "#fef2f2",

  blue: "#3b82f6",
  blueLight: "#eff6ff",

  text: "#3f344a",
  muted: "#81768a",

  border: "#e7def5",
  page: "#faf8ff",
};

/* ============================================================
   HELPERS
============================================================ */

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString(
    "en-IN"
  );
}

function formatCurrency(value) {
  const amount = toNumber(value);

  if (Math.abs(amount) >= 10000000) {
    return `₹${(
      amount / 10000000
    ).toFixed(2)} Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `₹${(
      amount / 100000
    ).toFixed(2)} L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(
      amount / 1000
    ).toFixed(1)}K`;
  }

  return `₹${Math.round(
    amount
  ).toLocaleString("en-IN")}`;
}

function formatPercentage(value) {
  return `${toNumber(value).toFixed(
    1
  )}%`;
}

function getObject(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return value;
  }

  return {};
}

/* ============================================================
   BUSINESS INSIGHTS
============================================================ */

function BusinessInsights({
  period = "all",
}) {
  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     FETCH DATA
  ========================================================== */

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?period=${encodeURIComponent(
          period || "all"
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Business Insights data:",
        data
      );

      setSummary(data);
    } catch (err) {
      console.error(
        "Business Insights error:",
        err
      );

      setError(
        "Unable to load Business Insights data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [period]);

  /* ==========================================================
     DATA OBJECTS
  ========================================================== */

  const clients = getObject(
    summary?.clients
  );

  const enquiries = getObject(
    summary?.enquiries
  );

  const invoices = getObject(
    summary?.invoices
  );

  const aging = getObject(
    summary?.aging
  );

  const financialHealth =
    getObject(
      summary?.financialHealth
    );

  const attention = getObject(
    summary?.attention
  );

  /* ==========================================================
     MAIN METRICS
  ========================================================== */

  const metrics = useMemo(() => {
    const totalClients =
      toNumber(clients.total);

    const activeClients =
      toNumber(clients.active);

    const inactiveClients =
      toNumber(clients.inactive);

    const totalEnquiries =
      toNumber(enquiries.total);

    const closedEnquiries =
      toNumber(enquiries.closed);

    const openEnquiries =
      toNumber(
        enquiries.inProgress ??
          enquiries.open
      );

    const cancelledEnquiries =
      toNumber(
        enquiries.cancelled
      );

    const totalBilling =
      toNumber(
        invoices.totalBilling
      );

    const amountReceived =
      toNumber(
        invoices.amountReceived
      );

    const amountDue =
      toNumber(
        invoices.amountDue
      );

    const totalInvoices =
      toNumber(invoices.total);

    const activeRate =
      totalClients > 0
        ? (activeClients /
            totalClients) *
          100
        : 0;

    const closureRate =
      toNumber(
        enquiries.closureRate
      ) ||
      (totalEnquiries > 0
        ? (closedEnquiries /
            totalEnquiries) *
          100
        : 0);

    const collectionRate =
      toNumber(
        invoices.collectionRate
      ) ||
      (totalBilling > 0
        ? (amountReceived /
            totalBilling) *
          100
        : 0);

    return {
      totalClients,
      activeClients,
      inactiveClients,

      totalEnquiries,
      closedEnquiries,
      openEnquiries,
      cancelledEnquiries,

      totalBilling,
      amountReceived,
      amountDue,
      totalInvoices,

      activeRate,
      closureRate,
      collectionRate,
    };
  }, [
    clients,
    enquiries,
    invoices,
  ]);

  /* ==========================================================
     90+ DAY RECEIVABLES
  ========================================================== */

  const overdue90 = useMemo(() => {
    return toNumber(
      aging["90+"] ??
        aging["90+ Days"] ??
        aging.over90 ??
        aging.over90Days
    );
  }, [aging]);

  /* ==========================================================
     FINANCIAL HEALTH
  ========================================================== */

  const healthStatus =
    financialHealth.status ||
    financialHealth.label ||
    financialHealth.health ||
    (metrics.collectionRate >=
    75
      ? "Healthy"
      : metrics.collectionRate >=
        50
      ? "Moderate"
      : "Needs Attention");

  const healthDescription =
    financialHealth.description ||
    `Collection rate is ${formatPercentage(
      metrics.collectionRate
    )}.`;

  /* ==========================================================
     ATTENTION ITEMS
  ========================================================== */

  const attentionItems = useMemo(() => {
    const items = [];

    if (
      metrics.inactiveClients >
      0
    ) {
      items.push({
        type: "Clients",
        value:
          metrics.inactiveClients,
        description:
          "Inactive clients",
      });
    }

    if (
      metrics.openEnquiries >
      0
    ) {
      items.push({
        type: "Enquiries",
        value:
          metrics.openEnquiries,
        description:
          "Open / in-progress enquiries",
      });
    }

    if (metrics.amountDue > 0) {
      items.push({
        type: "Invoices",
        value:
          metrics.amountDue,
        description:
          "Outstanding invoice amount",
        currency: true,
      });
    }

    if (overdue90 > 0) {
      items.push({
        type: "Ageing",
        value: overdue90,
        description:
          "Amount in 90+ day ageing",
        currency: true,
      });
    }

    return items;
  }, [
    metrics,
    overdue90,
  ]);

  /* ==========================================================
     MANAGEMENT PRIORITIES
  ========================================================== */

  const priorities = useMemo(() => {
    const result = [];

    if (
      metrics.inactiveClients >
      0
    ) {
      result.push({
        number: 1,
        title:
          "Re-engage inactive clients",
        description: `${formatNumber(
          metrics.inactiveClients
        )} inactive clients should be reviewed and followed up.`,
        priority: "High",
        color: COLORS.red,
        bg: COLORS.redLight,
      });
    }

    if (
      metrics.openEnquiries >
      0
    ) {
      result.push({
        number:
          result.length + 1,
        title:
          "Improve enquiry conversion",
        description: `${formatNumber(
          metrics.openEnquiries
        )} enquiries remain open or in progress.`,
        priority: "High",
        color: COLORS.orange,
        bg: COLORS.orangeLight,
      });
    }

    if (
      metrics.amountDue > 0
    ) {
      result.push({
        number:
          result.length + 1,
        title:
          "Follow up outstanding payments",
        description: `${formatCurrency(
          metrics.amountDue
        )} is currently outstanding.`,
        priority: "High",
        color: COLORS.red,
        bg: COLORS.redLight,
      });
    }

    if (overdue90 > 0) {
      result.push({
        number:
          result.length + 1,
        title:
          "Review 90+ day receivables",
        description: `${formatCurrency(
          overdue90
        )} is currently in the 90+ day ageing bucket.`,
        priority: "High",
        color: COLORS.orange,
        bg: COLORS.orangeLight,
      });
    }

    if (
      metrics.inactiveClients ===
        0 &&
      metrics.openEnquiries ===
        0 &&
      metrics.amountDue ===
        0
    ) {
      result.push({
        number: 1,
        title:
          "Maintain current performance",
        description:
          "No major attention item was identified for the selected period.",
        priority: "Good",
        color: COLORS.green,
        bg: COLORS.greenLight,
      });
    }

    return result.slice(0, 5);
  }, [
    metrics,
    overdue90,
  ]);

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
          justifyContent:
            "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: COLORS.purple,
          }}
        >
          <RefreshCw
            size={30}
            style={{
              animation:
                "businessInsightsSpin 1s linear infinite",
            }}
          />

          <div
            style={{
              marginTop: "10px",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            Loading Business Insights...
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              color: COLORS.muted,
            }}
          >
            Analysing Sarthi360 business data
          </div>
        </div>

        <style>
          {`
            @keyframes businessInsightsSpin {
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

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div
        style={{
          padding: "25px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #f3cccc",
            borderRadius: "14px",
            padding: "35px",
            textAlign: "center",
          }}
        >
          <AlertTriangle
            size={34}
            color={COLORS.red}
          />

          <h3
            style={{
              margin:
                "10px 0 5px",
              color: COLORS.text,
            }}
          >
            Business Insights could not be loaded
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: COLORS.muted,
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={
              fetchInsights
            }
            style={{
              marginTop: "15px",
              border: "none",
              background:
                COLORS.purple,
              color: "#ffffff",
              borderRadius: "8px",
              padding:
                "8px 14px",
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
     MAIN PAGE
  ========================================================== */

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >

      {/* ======================================================
          PAGE INTRO
      ====================================================== */}

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
        <div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 800,
              color: COLORS.purple,
              textTransform:
                "uppercase",
              letterSpacing:
                "0.06em",
            }}
          >
            Management View
          </div>

          <h2
            style={{
              margin:
                "3px 0 0",
              fontSize: "19px",
              fontWeight: 800,
              color: COLORS.text,
            }}
          >
            Business Insights
          </h2>

          <p
            style={{
              margin:
                "4px 0 0",
              fontSize: "9px",
              color: COLORS.muted,
            }}
          >
            Understand what is happening across clients, enquiries and financial performance.
          </p>
        </div>

        <button
          type="button"
          onClick={
            fetchInsights
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border:
              "1px solid #ded4e8",
            background: "#ffffff",
            color:
              COLORS.purpleDark,
            borderRadius: "8px",
            padding:
              "8px 12px",
            fontSize: "9px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <RefreshCw
            size={12}
          />
          Refresh
        </button>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <KpiCard
          type="cyan"
          icon={
            <Users size={16} />
          }
          title="Client Activity"
          value={formatPercentage(
            metrics.activeRate
          )}
          subtitle={`${formatNumber(
            metrics.activeClients
          )} active of ${formatNumber(
            metrics.totalClients
          )}`}
          trend={
            metrics.activeRate >=
            70
          }
        />

        <KpiCard
          type="purple"
          icon={
            <MessageSquare
              size={16}
            />
          }
          title="Enquiry Closure"
          value={formatPercentage(
            metrics.closureRate
          )}
          subtitle={`${formatNumber(
            metrics.closedEnquiries
          )} closed enquiries`}
          trend={
            metrics.closureRate >=
            60
          }
        />

        <KpiCard
          type="green"
          icon={
            <IndianRupee
              size={16}
            />
          }
          title="Collection Rate"
          value={formatPercentage(
            metrics.collectionRate
          )}
          subtitle={`${formatCurrency(
            metrics.amountReceived
          )} received`}
          trend={
            metrics.collectionRate >=
            60
          }
        />

        <KpiCard
          type="red"
          icon={
            <Wallet size={16} />
          }
          title="Outstanding"
          value={formatCurrency(
            metrics.amountDue
          )}
          subtitle="Amount currently due"
          warning={
            metrics.amountDue >
            0
          }
        />
      </div>

      {/* ======================================================
          KEY BUSINESS OBSERVATIONS
      ====================================================== */}

      <InsightSection
        title="Key Business Observations"
        subtitle="Automatically generated from the current dashboard data."
        icon={
          <Target size={15} />
        }
        iconColor={
          COLORS.purple
        }
        iconBackground={
          COLORS.purpleLight
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "8px",
          }}
        >
          <ObservationCard
            type={
              metrics.activeRate >=
              70
                ? "positive"
                : "attention"
            }
            icon={
              <Users size={14} />
            }
            title={
              metrics.activeRate >=
              70
                ? "Healthy Client Activity"
                : "Client Activity Needs Attention"
            }
            text={
              metrics.activeRate >=
              70
                ? `${formatPercentage(
                    metrics.activeRate
                  )} of clients are currently active.`
                : `Only ${formatPercentage(
                    metrics.activeRate
                  )} of clients are active. Re-engagement of inactive clients could be an opportunity.`
            }
          />

          <ObservationCard
            type={
              metrics.closureRate >=
              60
                ? "positive"
                : "attention"
            }
            icon={
              <MessageSquare
                size={14}
              />
            }
            title={
              metrics.closureRate >=
              60
                ? "Healthy Enquiry Closure"
                : "Enquiry Conversion Opportunity"
            }
            text={`The current enquiry closure rate is ${formatPercentage(
              metrics.closureRate
            )}. Reviewing open enquiries may improve conversion.`}
          />

          <ObservationCard
            type={
              metrics.collectionRate >=
              60
                ? "positive"
                : "attention"
            }
            icon={
              <IndianRupee
                size={14}
              />
            }
            title={
              metrics.collectionRate >=
              60
                ? "Collection Position"
                : "Collection Requires Focus"
            }
            text={`${formatPercentage(
              metrics.collectionRate
            )} of billed value has been collected. Outstanding receivables should be monitored.`}
          />

          <ObservationCard
            type={
              overdue90 > 0
                ? "attention"
                : "positive"
            }
            icon={
              <Clock3 size={14} />
            }
            title={
              overdue90 > 0
                ? "Long-Aged Receivables"
                : "Ageing Position"
            }
            text={
              overdue90 > 0
                ? `${formatCurrency(
                    overdue90
                  )} is currently in the 90+ day ageing bucket.`
                : "No 90+ day receivable amount is currently identified."
            }
          />
        </div>
      </InsightSection>

      {/* ======================================================
          MANAGEMENT PRIORITIES
      ====================================================== */}

      <InsightSection
        title="Management Priorities"
        subtitle="Areas that management may want to review."
        icon={
          <ListChecks size={15} />
        }
        iconColor={
          COLORS.red
        }
        iconBackground={
          COLORS.redLight
        }
        borderColor="#f3d8d8"
      >
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "7px",
          }}
        >
          {priorities.map(
            (item) => (
              <PriorityRow
                key={`${item.number}-${item.title}`}
                {...item}
              />
            )
          )}
        </div>
      </InsightSection>

      {/* ======================================================
          FINANCIAL POSITION + ATTENTION SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: "10px",
        }}
      >

        {/* FINANCIAL POSITION */}

        <InsightSection
          title="Financial Position"
          subtitle="Current billing and collection position."
          icon={
            <IndianRupee
              size={15}
            />
          }
          iconColor={
            COLORS.orange
          }
          iconBackground={
            COLORS.orangeLight
          }
        >
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            <FinancialProgress
              label="Total Billing"
              value={formatCurrency(
                metrics.totalBilling
              )}
              percentage={100}
              color={
                COLORS.cyan
              }
            />

            <FinancialProgress
              label="Received"
              value={formatCurrency(
                metrics.amountReceived
              )}
              percentage={
                metrics.totalBilling >
                0
                  ? Math.min(
                      100,
                      (metrics.amountReceived /
                        metrics.totalBilling) *
                        100
                    )
                  : 0
              }
              color={
                COLORS.green
              }
            />

            <FinancialProgress
              label="Outstanding"
              value={formatCurrency(
                metrics.amountDue
              )}
              percentage={
                metrics.totalBilling >
                0
                  ? Math.min(
                      100,
                      (metrics.amountDue /
                        metrics.totalBilling) *
                        100
                    )
                  : 0
              }
              color={
                COLORS.red
              }
            />

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                background:
                  COLORS.greenLight,
                border:
                  "1px solid #d1f0e2",
                borderRadius:
                  "8px",
                padding:
                  "8px 10px",
              }}
            >
              <span
                style={{
                  fontSize:
                    "9px",
                  color:
                    COLORS.muted,
                }}
              >
                Financial Health
              </span>

              <span
                style={{
                  fontSize:
                    "10px",
                  fontWeight:
                    800,
                  color:
                    healthStatus
                      .toLowerCase()
                      .includes(
                        "healthy"
                      )
                      ? COLORS.green
                      : COLORS.orange,
                }}
              >
                {healthStatus}
              </span>
            </div>
          </div>
        </InsightSection>

        {/* ATTENTION SUMMARY */}

        <InsightSection
          title="Attention Summary"
          subtitle="Items that may require follow-up."
          icon={
            <AlertTriangle
              size={15}
            />
          }
          iconColor={
            COLORS.red
          }
          iconBackground={
            COLORS.redLight
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "8px",
            }}
          >
            <SummaryBox
              icon={
                <MessageSquare
                  size={13}
                />
              }
              label="Enquiries"
              value={formatNumber(
                metrics.openEnquiries
              )}
              description="Need attention"
              color={
                COLORS.purple
              }
              background={
                COLORS.purpleLight
              }
            />

            <SummaryBox
              icon={
                <FileIcon
                  size={13}
                />
              }
              label="Invoices"
              value={formatNumber(
                metrics.totalInvoices
              )}
              description="Revenue-generating records"
              color={
                COLORS.orange
              }
              background={
                COLORS.orangeLight
              }
            />

            <div
              style={{
                gridColumn:
                  "1 / -1",
                border:
                  "1px solid #f0d3d3",
                background:
                  COLORS.redLight,
                borderRadius:
                  "9px",
                padding:
                  "10px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "8px",
                    fontWeight:
                      800,
                    color:
                      COLORS.red,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Total Attention Items
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",
                    fontSize:
                      "18px",
                    fontWeight:
                      800,
                    color:
                      COLORS.text,
                  }}
                >
                  {formatNumber(
                    attentionItems.length
                  )}
                </div>
              </div>

              <CircleAlert
                size={19}
                color={
                  COLORS.red
                }
              />
            </div>
          </div>
        </InsightSection>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          padding:
            "2px 3px 6px",
          fontSize:
            "8px",
          color:
            COLORS.muted,
        }}
      >
        <span>
          Business Insights are based on the selected dashboard period.
        </span>

        <span
          style={{
            fontWeight:
              800,
            color:
              COLORS.purple,
          }}
        >
          {period === "all"
            ? "All Time"
            : period}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  type,
  icon,
  title,
  value,
  subtitle,
  trend,
  warning,
}) {
  const styleMap = {
    cyan: {
      background:
        "#effcff",
      border:
        "#bfeef4",
      iconBackground:
        "#d9f8fc",
      iconColor:
        "#0891b2",
    },

    purple: {
      background:
        "#f7f3ff",
      border:
        "#e3d9f3",
      iconBackground:
        "#eee6fa",
      iconColor:
        COLORS.purple,
    },

    green: {
      background:
        "#effcf6",
      border:
        "#c9efdf",
      iconBackground:
        "#ddf8ea",
      iconColor:
        COLORS.green,
    },

    red: {
      background:
        "#fff7f7",
      border:
        "#f3d4d4",
      iconBackground:
        "#ffe5e5",
      iconColor:
        COLORS.red,
    },
  };

  const styles =
    styleMap[type];

  return (
    <div
      style={{
        background:
          styles.background,
        border:
          `1px solid ${styles.border}`,
        borderRadius:
          "10px",
        padding:
          "11px",
        minHeight:
          "72px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
        }}
      >
        <div
          style={{
            width:
              "29px",
            height:
              "29px",
            borderRadius:
              "8px",
            background:
              styles.iconBackground,
            color:
              styles.iconColor,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          {icon}
        </div>

        {warning ? (
          <AlertTriangle
            size={13}
            color={
              COLORS.red
            }
          />
        ) : trend !==
          undefined ? (
          trend ? (
            <ArrowUpRight
              size={13}
              color={
                COLORS.green
              }
            />
          ) : (
            <ArrowDownRight
              size={13}
              color={
                COLORS.red
              }
            />
          )
        ) : null}
      </div>

      <div
        style={{
          marginTop:
            "7px",
          fontSize:
            "8px",
          color:
            COLORS.muted,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop:
            "2px",
          fontSize:
            "17px",
          fontWeight:
            800,
          color:
            COLORS.text,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop:
            "2px",
          fontSize:
            "7px",
          color:
            COLORS.muted,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

/* ============================================================
   SECTION
============================================================ */

function InsightSection({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  borderColor,
  children,
}) {
  return (
    <section
      style={{
        background:
          "#ffffff",
        border:
          `1px solid ${
            borderColor ||
            COLORS.border
          }`,
        borderRadius:
          "10px",
        padding:
          "11px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "7px",
          marginBottom:
            "9px",
        }}
      >
        <div
          style={{
            width:
              "27px",
            height:
              "27px",
            borderRadius:
              "8px",
            background:
              iconBackground,
            color:
              iconColor,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize:
                "10px",
              fontWeight:
                800,
              color:
                COLORS.text,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop:
                "2px",
              fontSize:
                "7px",
              color:
                COLORS.muted,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   OBSERVATION
============================================================ */

function ObservationCard({
  type,
  icon,
  title,
  text,
}) {
  const positive =
    type ===
    "positive";

  return (
    <div
      style={{
        background:
          positive
            ? "#f3fcf8"
            : "#fffaf0",
        border:
          positive
            ? "1px solid #d0efe2"
            : "1px solid #f5dfb0",
        borderRadius:
          "8px",
        padding:
          "9px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "7px",
        }}
      >
        <div
          style={{
            width:
              "24px",
            height:
              "24px",
            borderRadius:
              "7px",
            background:
              positive
                ? "#dff7eb"
                : "#fff0ce",
            color:
              positive
                ? COLORS.green
                : COLORS.orange,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize:
              "8px",
            fontWeight:
              800,
            color:
              COLORS.text,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          marginTop:
            "5px",
          marginLeft:
            "31px",
          fontSize:
            "7px",
          lineHeight:
            1.45,
          color:
            COLORS.muted,
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* ============================================================
   PRIORITY
============================================================ */

function PriorityRow({
  number,
  title,
  description,
  priority,
  color,
  bg,
}) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "8px",
        background:
          "#fafbfc",
        border:
          "1px solid #edf0f3",
        borderRadius:
          "8px",
        padding:
          "7px 9px",
      }}
    >
      <div
        style={{
          width:
            "22px",
          height:
            "22px",
          borderRadius:
            "6px",
          background:
            "#ffffff",
          border:
            "1px solid #e7e9ed",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "8px",
          fontWeight:
            800,
          color:
            COLORS.purple,
          flexShrink: 0,
        }}
      >
        {number}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "6px",
            flexWrap:
              "wrap",
          }}
        >
          <span
            style={{
              fontSize:
                "8px",
              fontWeight:
                800,
              color:
                COLORS.text,
            }}
          >
            {title}
          </span>

          <span
            style={{
              background:
                bg,
              color,
              borderRadius:
                "999px",
              padding:
                "2px 6px",
              fontSize:
                "6px",
              fontWeight:
                800,
            }}
          >
            {priority}
          </span>
        </div>

        <div
          style={{
            marginTop:
              "2px",
            fontSize:
              "7px",
            color:
              COLORS.muted,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FINANCIAL PROGRESS
============================================================ */

function FinancialProgress({
  label,
  value,
  percentage,
  color,
}) {
  return (
    <div>
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          fontSize:
            "7px",
          color:
            COLORS.muted,
        }}
      >
        <span>
          {label}
        </span>

        <strong
          style={{
            color,
            fontSize:
              "8px",
          }}
        >
          {value}
        </strong>
      </div>

      <div
        style={{
          marginTop:
            "5px",
          height:
            "5px",
          background:
            "#edf0f3",
          borderRadius:
            "999px",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.max(
              0,
              Math.min(
                100,
                percentage
              )
            )}%`,
            height:
              "100%",
            background:
              color,
            borderRadius:
              "999px",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY BOX
============================================================ */

function SummaryBox({
  icon,
  label,
  value,
  description,
  color,
  background,
}) {
  return (
    <div
      style={{
        background,
        border:
          `1px solid ${color}22`,
        borderRadius:
          "8px",
        padding:
          "9px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "5px",
          color,
          fontSize:
            "7px",
          fontWeight:
            800,
        }}
      >
        {icon}
        {label}
      </div>

      <div
        style={{
          marginTop:
            "3px",
          fontSize:
            "16px",
          fontWeight:
            800,
          color:
            COLORS.text,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop:
            "2px",
          fontSize:
            "6px",
          color:
            COLORS.muted,
        }}
      >
        {description}
      </div>
    </div>
  );
}

/* ============================================================
   FILE ICON
============================================================ */

function FileIcon({
  size = 14,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

export default BusinessInsights;
