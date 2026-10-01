import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  IndianRupee,
  WalletCards,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Filter,
  Receipt,
  Table2,
  LayoutDashboard,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  getPeriodRange,
  getPeriodLabel,
} from "../utils/dateFilter";

const API_URL =
  "/api/dashboard/invoices";

const INFO_COLORS = [
  "#8065a5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#ec4899",
  "#8b5cf6",
  "#84cc16",
];

/* ============================================================
   INVOICES PAGE
============================================================ */

function Invoices({ period = "all" }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [infoFilter, setInfoFilter] = useState("all");
  const [viewMode, setViewMode] = useState("charts");

  /* ==========================================================
     FETCH DATA
  ========================================================== */

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data?.rows)) {
        data = response.data.rows;
      } else if (Array.isArray(response.data?.results)) {
        data = response.data.results;
      }

      console.log(
        "Sarthi360 Invoices received:",
        data.length
      );

      if (data.length > 0) {
        console.log(
          "First invoice record:",
          data[0]
        );
      }

      setInvoices(data);
    } catch (err) {
      console.error(
        "Invoice API Error:",
        err
      );

      setError(
        "Unable to load invoice data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ==========================================================
     DATE HELPERS
  ========================================================== */

  const parseDate = (value) => {
    if (!value) {
      return null;
    }

    const text = String(value).trim();

    if (!text) {
      return null;
    }

    const ddmmyyyySlash = text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

    if (ddmmyyyySlash) {
      const [, day, month, year] =
        ddmmyyyySlash;

      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      return Number.isNaN(date.getTime())
        ? null
        : date;
    }

    const ddmmyyyyDash = text.match(
      /^(\d{1,2})-(\d{1,2})-(\d{4})/
    );

    if (ddmmyyyyDash) {
      const [, day, month, year] =
        ddmmyyyyDash;

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
  };

  const getBillDate = (invoice) => {
    return parseDate(
      invoice?.billDate ||
        invoice?.bill_date ||
        invoice?.invoiceDate ||
        invoice?.invoice_date ||
        invoice?.date ||
        invoice?.created_at ||
        invoice?.createdAt
    );
  };

  const getDueDate = (invoice) => {
    return parseDate(
      invoice?.dueDate ||
        invoice?.due_date ||
        invoice?.paymentDueDate ||
        invoice?.payment_due_date
    );
  };

  /* ==========================================================
     MONEY HELPERS
  ========================================================== */

  const toNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const number = Number(
      String(value)
        .replace(/,/g, "")
        .replace(/₹/g, "")
        .replace(/\s/g, "")
    );

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const getBilling = (invoice) => {
    return toNumber(
      invoice?.totalBillAmt ??
        invoice?.total_bill_amt ??
        invoice?.billing ??
        invoice?.totalAmount ??
        invoice?.total_amount ??
        invoice?.billAmount ??
        invoice?.bill_amount ??
        0
    );
  };

  const getReceived = (invoice) => {
    return toNumber(
      invoice?.amountReceived ??
        invoice?.amount_received ??
        invoice?.received ??
        invoice?.receivedAmount ??
        invoice?.received_amount ??
        0
    );
  };

  const getDue = (invoice) => {
    const directDue =
      invoice?.amountDue ??
      invoice?.amount_due ??
      invoice?.due ??
      invoice?.outstanding ??
      invoice?.outstandingAmount ??
      invoice?.outstanding_amount;

    if (
      directDue !== null &&
      directDue !== undefined &&
      directDue !== ""
    ) {
      return toNumber(directDue);
    }

    const calculated =
      getBilling(invoice) -
      getReceived(invoice);

    return calculated > 0
      ? calculated
      : 0;
  };

  const getInfo = (invoice) => {
    const value =
      invoice?.info ??
      invoice?.Info ??
      invoice?.information;

    if (
      value === null ||
      value === undefined
    ) {
      return "Unknown";
    }

    const text = String(value).trim();

    return text || "Unknown";
  };

  /* ==========================================================
     CURRENCY
  ========================================================== */

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    const abs = Math.abs(number);

    if (abs >= 10000000) {
      return `₹${(
        number / 10000000
      ).toFixed(2)} Cr`;
    }

    if (abs >= 100000) {
      return `₹${(
        number / 100000
      ).toFixed(2)} L`;
    }

    if (abs >= 1000) {
      return `₹${(
        number / 1000
      ).toFixed(1)}K`;
    }

    return `₹${Math.round(
      number
    ).toLocaleString("en-IN")}`;
  };

  const formatFullCurrency = (value) => {
    return `₹${Math.round(
      Number(value || 0)
    ).toLocaleString("en-IN")}`;
  };

  /* ==========================================================
     PERIOD
  ========================================================== */

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  /* ==========================================================
     INFO OPTIONS
  ========================================================== */

  const infoOptions = useMemo(() => {
    return Array.from(
      new Set(
        invoices.map((invoice) =>
          getInfo(invoice)
        )
      )
    ).sort((a, b) =>
      a.localeCompare(
        b,
        undefined,
        {
          numeric: true,
        }
      )
    );
  }, [invoices]);

  /* ==========================================================
     FILTERED INVOICES
  ========================================================== */

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const billDate =
        getBillDate(invoice);

      if (
        periodRange.startDate &&
        periodRange.endDate
      ) {
        if (!billDate) {
          return false;
        }

        if (
          billDate <
            periodRange.startDate ||
          billDate >
            periodRange.endDate
        ) {
          return false;
        }
      }

      if (
        infoFilter !== "all" &&
        getInfo(invoice) !==
          infoFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    invoices,
    periodRange,
    infoFilter,
  ]);

  /* ==========================================================
     KPI VALUES
  ========================================================== */

  const totalBilling = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, invoice) =>
        sum + getBilling(invoice),
      0
    );
  }, [filteredInvoices]);

  const amountReceived = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, invoice) =>
        sum + getReceived(invoice),
      0
    );
  }, [filteredInvoices]);

  const amountDue = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, invoice) =>
        sum + getDue(invoice),
      0
    );
  }, [filteredInvoices]);

  const collectionRate =
    totalBilling > 0
      ? (amountReceived /
          totalBilling) *
        100
      : 0;

  /* ==========================================================
     BILLING TREND
  ========================================================== */

  const billingTrend = useMemo(() => {
    const monthly = {};

    filteredInvoices.forEach(
      (invoice) => {
        const date =
          getBillDate(invoice);

        if (!date) {
          return;
        }

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthly[key]) {
          monthly[key] = {
            key,
            month:
              date.toLocaleDateString(
                "en-IN",
                {
                  month: "short",
                  year: "numeric",
                }
              ),
            billing: 0,
            received: 0,
            due: 0,
          };
        }

        monthly[key].billing +=
          getBilling(invoice);

        monthly[key].received +=
          getReceived(invoice);

        monthly[key].due +=
          getDue(invoice);
      }
    );

    return Object.values(monthly)
      .sort((a, b) =>
        a.key.localeCompare(b.key)
      )
      .slice(-12);
  }, [filteredInvoices]);

  /* ==========================================================
     RECEIVED VS OUTSTANDING
  ========================================================== */

  const paymentData = [
    {
      name: "Received",
      value: amountReceived,
    },
    {
      name: "Outstanding",
      value: amountDue,
    },
  ].filter(
    (item) => item.value > 0
  );

  /* ==========================================================
     INFO DISTRIBUTION
  ========================================================== */

  const infoData = useMemo(() => {
    const counts = {};

    filteredInvoices.forEach(
      (invoice) => {
        const info =
          getInfo(invoice);

        counts[info] =
          (counts[info] || 0) + 1;
      }
    );

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [filteredInvoices]);

  /* ==========================================================
     INVOICE AGEING
  ========================================================== */

  const agingData = useMemo(() => {
    const today = new Date();

    const aging = {
      "0–30 Days": 0,
      "31–60 Days": 0,
      "61–90 Days": 0,
      "90+ Days": 0,
    };

    filteredInvoices.forEach(
      (invoice) => {
        const dueDate =
          getDueDate(invoice);

        const due =
          getDue(invoice);

        if (
          !dueDate ||
          due <= 0
        ) {
          return;
        }

        const difference =
          today.getTime() -
          dueDate.getTime();

        const days =
          difference /
          (1000 *
            60 *
            60 *
            24);

        if (days <= 30) {
          aging["0–30 Days"] +=
            due;
        } else if (
          days <= 60
        ) {
          aging["31–60 Days"] +=
            due;
        } else if (
          days <= 90
        ) {
          aging["61–90 Days"] +=
            due;
        } else {
          aging["90+ Days"] +=
            due;
        }
      }
    );

    return Object.entries(
      aging
    ).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredInvoices]);

  const overdue31Plus =
    agingData
      .filter(
        (item) =>
          item.name !==
          "0–30 Days"
      )
      .reduce(
        (sum, item) =>
          sum + item.value,
        0
      );

  const overdue90Plus =
    agingData.find(
      (item) =>
        item.name ===
        "90+ Days"
    )?.value || 0;

  /* ==========================================================
     FINANCIAL HEALTH
  ========================================================== */

  let healthTitle =
    "Healthy";

  let healthText =
    "Collection performance is currently healthy.";

  let healthType =
    "healthy";

  if (totalBilling === 0) {
    healthTitle =
      "No Billing Data";

    healthText =
      "There is no billing amount available for the selected period.";

    healthType = "neutral";
  } else if (
    amountDue === 0
  ) {
    healthTitle =
      "Fully Collected";

    healthText =
      "There is no outstanding amount in the selected data.";

    healthType = "healthy";
  } else if (
    collectionRate < 50
  ) {
    healthTitle =
      "Needs Attention";

    healthText =
      "A large portion of billing remains outstanding.";

    healthType = "danger";
  } else if (
    collectionRate < 75
  ) {
    healthTitle =
      "Moderate";

    healthText =
      "Collections are progressing, but outstanding billing should be monitored.";

    healthType = "warning";
  }

  /* ==========================================================
     RESET
  ========================================================== */

  const resetFilters = () => {
    setInfoFilter("all");
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
            color: "#8065a5",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border:
                "4px solid #e7def5",
              borderTopColor:
                "#8065a5",
              borderRadius: "50%",
              margin:
                "0 auto",
              animation:
                "invoiceSpin 0.9s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: "14px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Loading invoice data...
          </p>
        </div>

        <style>
          {`
            @keyframes invoiceSpin {
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
            border:
              "1px solid #fecaca",
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
              margin:
                "14px 0 8px",
              color: "#3f344a",
            }}
          >
            Invoice data could not be loaded
          </h2>

          <p
            style={{
              color: "#7a7083",
              fontSize: "13px",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={fetchInvoices}
            style={{
              marginTop: "16px",
              border: "none",
              background:
                "#8065a5",
              color: "#ffffff",
              borderRadius:
                "9px",
              padding:
                "10px 18px",
              fontWeight: 700,
              cursor:
                "pointer",
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
              color: "#8065a5",
              fontSize: "10px",
              fontWeight: 800,
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
            }}
          >
            Sarthi360 Analytics
          </div>

          <h1
            style={{
              margin:
                "4px 0 0",
              color: "#3f344a",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            Invoice Financial Overview
          </h1>

          <p
            style={{
              margin:
                "4px 0 0",
              color: "#81768a",
              fontSize: "11px",
            }}
          >
            Monitor billing, collections, outstanding amounts and invoice ageing.
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
            active={
              viewMode ===
              "charts"
            }
            onClick={() =>
              setViewMode(
                "charts"
              )
            }
            icon={
              <LayoutDashboard
                size={14}
              />
            }
            label="Chart View"
          />

          <ViewButton
            active={
              viewMode ===
              "table"
            }
            onClick={() =>
              setViewMode(
                "table"
              )
            }
            icon={
              <Table2
                size={14}
              />
            }
            label="Table View"
          />

          <div
            style={{
              background:
                "#f3effb",
              color:
                "#684d8c",
              borderRadius:
                "9px",
              padding:
                "8px 12px",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {getPeriodLabel(
              period
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <section
        style={{
          background: "#ffffff",
          border:
            "1px solid #e7def5",
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
            justifyContent:
              "space-between",
            gap: "10px",
            marginBottom:
              "12px",
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
                borderRadius:
                  "10px",
                background:
                  "#eee7f8",
                color:
                  "#8065a5",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Filter size={17} />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color:
                    "#3f344a",
                  fontSize:
                    "13px",
                  fontWeight: 800,
                }}
              >
                Invoice Filters
              </h3>

              <p
                style={{
                  margin:
                    "2px 0 0",
                  color:
                    "#8a8091",
                  fontSize:
                    "10px",
                }}
              >
                Filter invoice analytics using the Info field.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              resetFilters
            }
            style={{
              border: "none",
              background:
                "transparent",
              color:
                "#8065a5",
              fontSize:
                "10px",
              fontWeight: 700,
              cursor:
                "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0,1fr) minmax(0,1fr)",
            gap: "10px",
          }}
        >
          <select
            value={
              infoFilter
            }
            onChange={(event) =>
              setInfoFilter(
                event.target
                  .value
              )
            }
            style={{
              width: "100%",
              border:
                "1px solid #ddd4e8",
              borderRadius:
                "9px",
              background:
                "#ffffff",
              color:
                "#51465b",
              padding:
                "10px 12px",
              fontSize:
                "11px",
              outline: "none",
            }}
          >
            <option value="all">
              All Info
            </option>

            {infoOptions.map(
              (info) => (
                <option
                  key={info}
                  value={info}
                >
                  {info}
                </option>
              )
            )}
          </select>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "7px",
              background:
                "#faf8ff",
              border:
                "1px solid #eee7f5",
              borderRadius:
                "9px",
              padding:
                "9px 12px",
              color:
                "#776c80",
              fontSize:
                "10px",
            }}
          >
            <Receipt
              size={14}
              color="#8065a5"
            />

            <strong
              style={{
                color:
                  "#4e4358",
              }}
            >
              {filteredInvoices.length.toLocaleString(
                "en-IN"
              )}
            </strong>

            invoices in current selection
          </div>
        </div>
      </section>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",
          gap: "14px",
        }}
      >
        <KpiCard
          icon={
            <IndianRupee
              size={19}
            />
          }
          label="Total Billing"
          value={formatCurrency(
            totalBilling
          )}
          color="cyan"
          subtitle="Across selected invoices"
        />

        <KpiCard
          icon={
            <WalletCards
              size={19}
            />
          }
          label="Amount Received"
          value={formatCurrency(
            amountReceived
          )}
          color="green"
          subtitle="Collected"
        />

        <KpiCard
          icon={
            <CircleDollarSign
              size={19}
            />
          }
          label="Amount Due"
          value={formatCurrency(
            amountDue
          )}
          color="red"
          subtitle="Outstanding"
        />

        <KpiCard
          icon={
            <CheckCircle2
              size={19}
            />
          }
          label="Collection Rate"
          value={`${collectionRate.toFixed(
            1
          )}%`}
          color="purple"
          subtitle="Received / Total Billing"
        />
      </section>

      {/* ======================================================
          TABLE VIEW
      ====================================================== */}

      {viewMode === "table" ? (
        <InvoiceTable
          invoices={
            filteredInvoices
          }
          getBillDate={
            getBillDate
          }
          getDueDate={
            getDueDate
          }
          getBilling={
            getBilling
          }
          getReceived={
            getReceived
          }
          getDue={getDue}
          getInfo={getInfo}
          formatCurrency={
            formatCurrency
          }
        />
      ) : (
        <>
          {/* ==================================================
              BILLING & COLLECTION TREND
          ================================================== */}

          <ChartCard
            title="Billing & Collection Trend"
            subtitle="Monthly billing, received amount and outstanding amount."
            icon={
              <TrendingUp
                size={17}
              />
            }
            iconType="cyan"
            fullWidth
          >
            <div
              style={{
                height: "300px",
              }}
            >
              {billingTrend.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      billingTrend
                    }
                    margin={{
                      top: 10,
                      right: 15,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#eee7f5"
                      vertical={
                        false
                      }
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#756b7d",
                        fontSize: 9,
                      }}
                      axisLine={{
                        stroke:
                          "#ddd5e7",
                      }}
                      tickLine={
                        false
                      }
                    />

                    <YAxis
                      tick={{
                        fill: "#756b7d",
                        fontSize: 9,
                      }}
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                      tickFormatter={(
                        value
                      ) =>
                        formatCurrency(
                          value
                        )
                      }
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                        formatFullCurrency(
                          Number(
                            value
                          )
                        ),
                      ]}
                      contentStyle={{
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #e5dcef",
                        boxShadow:
                          "0 4px 14px rgba(104,77,140,.12)",
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize:
                          "10px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="billing"
                      name="Billing"
                      stroke="#06b6d4"
                      strokeWidth={
                        2.5
                      }
                      dot={{
                        r: 2.5,
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="received"
                      name="Received"
                      stroke="#10b981"
                      strokeWidth={
                        2.5
                      }
                      dot={{
                        r: 2.5,
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="due"
                      name="Outstanding"
                      stroke="#f43f5e"
                      strokeWidth={
                        2.5
                      }
                      dot={{
                        r: 2.5,
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No billing date data available for the selected period." />
              )}
            </div>
          </ChartCard>

          {/* ==================================================
              TWO CHARTS SIDE BY SIDE
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,minmax(0,1fr))",
              gap: "16px",
            }}
          >
            {/* RECEIVED VS OUTSTANDING */}

            <ChartCard
              title="Received vs Outstanding"
              subtitle="Current financial collection position."
              icon={
                <WalletCards
                  size={17}
                />
              }
              iconType="green"
            >
              <div
                style={{
                  height: "260px",
                }}
              >
                {paymentData.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          paymentData
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="46%"
                        innerRadius={
                          62
                        }
                        outerRadius={
                          94
                        }
                        paddingAngle={
                          4
                        }
                      >
                        <Cell
                          fill="#10b981"
                        />

                        <Cell
                          fill="#f43f5e"
                        />
                      </Pie>

                      <Tooltip
                        formatter={(
                          value
                        ) =>
                          formatFullCurrency(
                            Number(
                              value
                            )
                          )
                        }
                      />

                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                          fontSize:
                            "10px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No financial values available." />
                )}
              </div>
            </ChartCard>

            {/* INFO DISTRIBUTION */}

            <ChartCard
              title="Invoice Info Distribution"
              subtitle="Distribution of invoices by Info."
              icon={
                <Receipt
                  size={17}
                />
              }
              iconType="purple"
            >
              <div
                style={{
                  height: "260px",
                }}
              >
                {infoData.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          infoData
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="43%"
                        innerRadius={
                          58
                        }
                        outerRadius={
                          92
                        }
                        paddingAngle={
                          3
                        }
                      >
                        {infoData.map(
                          (
                            item,
                            index
                          ) => (
                            <Cell
                              key={`${item.name}-${index}`}
                              fill={
                                INFO_COLORS[
                                  index %
                                    INFO_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />

                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                          fontSize:
                            "9px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No Info data available." />
                )}
              </div>
            </ChartCard>
          </div>

          {/* ==================================================
              FINANCIAL HEALTH
          ================================================== */}

          <section
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e7def5",
              borderRadius:
                "15px",
              padding:
                "17px",
              boxShadow:
                "0 3px 12px rgba(104,77,140,.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "20px",
                flexWrap:
                  "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius:
                      "11px",
                    background:
                      healthType ===
                      "healthy"
                        ? "#ecfdf5"
                        : healthType ===
                          "danger"
                        ? "#fef2f2"
                        : healthType ===
                          "warning"
                        ? "#fff7ed"
                        : "#f3f4f6",
                    color:
                      healthType ===
                      "healthy"
                        ? "#10b981"
                        : healthType ===
                          "danger"
                        ? "#ef4444"
                        : healthType ===
                          "warning"
                        ? "#f59e0b"
                        : "#6b7280",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  {healthType ===
                  "healthy" ? (
                    <CheckCircle2
                      size={20}
                    />
                  ) : (
                    <AlertCircle
                      size={20}
                    />
                  )}
                </div>

                <div>
                  <div
                    style={{
                      color:
                        "#9a909f",
                      fontSize:
                        "9px",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.06em",
                    }}
                  >
                    Financial Health
                  </div>

                  <div
                    style={{
                      marginTop:
                        "2px",
                      color:
                        "#3f344a",
                      fontSize:
                        "17px",
                      fontWeight: 800,
                    }}
                  >
                    {healthTitle}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "2px",
                      color:
                        "#81768a",
                      fontSize:
                        "10px",
                    }}
                  >
                    {healthText}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width:
                    "min(420px, 100%)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "5px",
                  }}
                >
                  <span
                    style={{
                      color:
                        "#6f6479",
                      fontSize:
                        "10px",
                      fontWeight: 700,
                    }}
                  >
                    Collection Progress
                  </span>

                  <span
                    style={{
                      color:
                        "#3f344a",
                      fontSize:
                        "10px",
                      fontWeight: 800,
                    }}
                  >
                    {collectionRate.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>

                <div
                  style={{
                    height:
                      "8px",
                    background:
                      "#f0edf3",
                    borderRadius:
                      "999px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      height:
                        "100%",
                      width: `${Math.min(
                        collectionRate,
                        100
                      )}%`,
                      background:
                        "linear-gradient(90deg,#06b6d4,#10b981)",
                      borderRadius:
                        "999px",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",
                gap: "10px",
                marginTop:
                  "14px",
              }}
            >
              <HealthMetric
                label="Total Billing"
                value={formatCurrency(
                  totalBilling
                )}
                type="neutral"
              />

              <HealthMetric
                label="Received"
                value={formatCurrency(
                  amountReceived
                )}
                type="green"
              />

              <HealthMetric
                label="Outstanding"
                value={formatCurrency(
                  amountDue
                )}
                type="red"
              />
            </div>
          </section>

          {/* ==================================================
              INVOICE AGEING
          ================================================== */}

          <ChartCard
            title="Invoice Ageing"
            subtitle="Outstanding invoice amount grouped by ageing period."
            icon={
              <Clock3
                size={17}
              />
            }
            iconType="orange"
            fullWidth
          >
            <div
              style={{
                height: "285px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    agingData
                  }
                  margin={{
                    top: 10,
                    right: 15,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee7f5"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#756b7d",
                      fontSize: 10,
                    }}
                    axisLine={{
                      stroke:
                        "#ddd5e7",
                    }}
                    tickLine={
                      false
                    }
                  />

                  <YAxis
                    tick={{
                      fill: "#756b7d",
                      fontSize: 9,
                    }}
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tickFormatter={(
                      value
                    ) =>
                      formatCurrency(
                        value
                      )
                    }
                  />

                  <Tooltip
                    formatter={(
                      value
                    ) => [
                      formatFullCurrency(
                        Number(
                          value
                        )
                      ),
                      "Outstanding",
                    ]}
                  />

                  <Bar
                    dataKey="value"
                    name="Outstanding"
                    fill="#f59e0b"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                    maxBarSize={
                      90
                    }
                  >
                    {agingData.map(
                      (
                        item,
                        index
                      ) => (
                        <Cell
                          key={
                            item.name
                          }
                          fill={
                            index ===
                            3
                              ? "#f59e0b"
                              : "#fbbf24"
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4,minmax(0,1fr))",
                gap: "10px",
                marginTop:
                  "10px",
              }}
            >
              {agingData.map(
                (item) => (
                  <div
                    key={
                      item.name
                    }
                    style={{
                      background:
                        "#faf8ff",
                      border:
                        "1px solid #eee7f5",
                      borderRadius:
                        "10px",
                      padding:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        color:
                          "#857a8e",
                        fontSize:
                          "9px",
                      }}
                    >
                      {item.name}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "3px",
                        color:
                          "#3f344a",
                        fontSize:
                          "14px",
                        fontWeight: 800,
                      }}
                    >
                      {formatCurrency(
                        item.value
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </ChartCard>

          {/* ==================================================
              ATTENTION REQUIRED
          ================================================== */}

          <section
            style={{
              background:
                "linear-gradient(135deg,#fff7f7,#ffffff,#fffaf0)",
              border:
                "1px solid #f5d9d9",
              borderRadius:
                "15px",
              padding:
                "17px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "11px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius:
                      "11px",
                    background:
                      "#fef2f2",
                    color:
                      "#ef4444",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <AlertCircle
                    size={20}
                  />
                </div>

                <div>
                  <div
                    style={{
                      color:
                        "#dc2626",
                      fontSize:
                        "9px",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.06em",
                    }}
                  >
                    Attention Required
                  </div>

                  <div
                    style={{
                      marginTop:
                        "2px",
                      color:
                        "#3f344a",
                      fontSize:
                        "18px",
                      fontWeight: 800,
                    }}
                  >
                    {formatCurrency(
                      overdue31Plus
                    )}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "2px",
                      color:
                        "#81768a",
                      fontSize:
                        "10px",
                    }}
                  >
                    Outstanding amount in 31+ day ageing buckets.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(110px,1fr))",
                  gap: "9px",
                }}
              >
                <SmallAttention
                  label="31+ Days"
                  value={formatCurrency(
                    overdue31Plus
                  )}
                />

                <SmallAttention
                  label="90+ Days"
                  value={formatCurrency(
                    overdue90Plus
                  )}
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              SMART FINANCIAL INSIGHTS
          ================================================== */}

          <section
            style={{
              background:
                "linear-gradient(135deg,#f7f3ff,#ffffff,#effcff)",
              border:
                "1px solid #e5dbf3",
              borderRadius:
                "15px",
              padding:
                "17px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "10px",
                  background:
                    "#eee7f8",
                  color:
                    "#8065a5",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Lightbulb
                  size={17}
                />
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    color:
                      "#3f344a",
                    fontSize:
                      "14px",
                    fontWeight: 800,
                  }}
                >
                  Smart Financial Insights
                </h3>

                <p
                  style={{
                    margin:
                      "3px 0 0",
                    color:
                      "#81768a",
                    fontSize:
                      "10px",
                  }}
                >
                  Key observations from the selected invoice data.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: "10px",
                marginTop:
                  "12px",
              }}
            >
              <InsightCard
                icon={
                  collectionRate >=
                  75 ? (
                    <CheckCircle2
                      size={16}
                    />
                  ) : (
                    <AlertCircle
                      size={16}
                    />
                  )
                }
                title={
                  collectionRate >=
                  75
                    ? "Strong collection performance"
                    : "Collection requires attention"
                }
                text={`Collection rate is ${collectionRate.toFixed(
                  1
                )}% with ${formatCurrency(
                  amountDue
                )} currently outstanding.`}
                type={
                  collectionRate >=
                  75
                    ? "green"
                    : "red"
                }
              />

              <InsightCard
                icon={
                  <Clock3
                    size={16}
                  />
                }
                title="Ageing requires monitoring"
                text={`${formatCurrency(
                  overdue31Plus
                )} is currently in the 31+ day ageing buckets.`}
                type="orange"
              />

              <InsightCard
                icon={
                  <WalletCards
                    size={16}
                  />
                }
                title="Collections received"
                text={`${formatCurrency(
                  amountReceived
                )} has been received from the selected invoice records.`}
                type="green"
              />

              <InsightCard
                icon={
                  <Receipt
                    size={16}
                  />
                }
                title="Invoice records"
                text={`${filteredInvoices.length.toLocaleString(
                  "en-IN"
                )} invoice records are included in the current selection.`}
                type="purple"
              />
            </div>
          </section>
        </>
      )}

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
          gap: "10px",
          padding:
            "3px 2px",
          color:
            "#81768a",
          fontSize:
            "10px",
        }}
      >
        <span>
          Showing{" "}
          <strong
            style={{
              color:
                "#51465b",
            }}
          >
            {filteredInvoices.length.toLocaleString(
              "en-IN"
            )}
          </strong>{" "}
          invoices from the selected period.
        </span>

        <button
          type="button"
          onClick={
            fetchInvoices
          }
          style={{
            border: "none",
            background:
              "transparent",
            color:
              "#684d8c",
            fontWeight: 700,
            cursor:
              "pointer",
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
  color,
  subtitle,
}) {
  const palette = {
    cyan: {
      background:
        "#ecfeff",
      border:
        "#c7f4f8",
      icon:
        "#cffafe",
      text:
        "#0891b2",
    },

    green: {
      background:
        "#ecfdf5",
      border:
        "#c9f2df",
      icon:
        "#d1fae5",
      text:
        "#059669",
    },

    red: {
      background:
        "#fef2f2",
      border:
        "#fbd3d3",
      icon:
        "#fee2e2",
      text:
        "#dc2626",
    },

    purple: {
      background:
        "#f5f3ff",
      border:
        "#e5ddf8",
      icon:
        "#ede9fe",
      text:
        "#7c3aed",
    },
  };

  const p =
    palette[color];

  return (
    <div
      style={{
        background:
          p.background,
        border:
          `1px solid ${p.border}`,
        borderRadius:
          "14px",
        padding:
          "15px",
        minWidth: 0,
        boxShadow:
          "0 3px 12px rgba(104,77,140,.04)",
      }}
    >
      <div
        style={{
          width: "35px",
          height: "35px",
          borderRadius:
            "10px",
          background:
            p.icon,
          color: p.text,
          display: "flex",
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
          marginTop:
            "12px",
          color:
            "#756b7d",
          fontSize:
            "10px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            "3px",
          color:
            "#3f344a",
          fontSize:
            "20px",
          fontWeight: 800,
          whiteSpace:
            "nowrap",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop:
            "3px",
          color:
            p.text,
          fontSize:
            "9px",
          fontWeight: 600,
        }}
      >
        {subtitle}
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
  icon,
  iconType,
  children,
}) {
  const iconColors = {
    cyan: {
      background:
        "#cffafe",
      color:
        "#0891b2",
    },

    green: {
      background:
        "#d1fae5",
      color:
        "#059669",
    },

    purple: {
      background:
        "#ede9fe",
      color:
        "#7c3aed",
    },

    orange: {
      background:
        "#fef3c7",
      color:
        "#d97706",
    },
  };

  const selected =
    iconColors[
      iconType
    ] ||
    iconColors.purple;

  return (
    <section
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e7def5",
        borderRadius:
          "15px",
        padding:
          "15px",
        minWidth: 0,
        boxShadow:
          "0 3px 12px rgba(104,77,140,.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: "9px",
          marginBottom:
            "4px",
        }}
      >
        <div
          style={{
            width: "31px",
            height: "31px",
            borderRadius:
              "9px",
            background:
              selected.background,
            color:
              selected.color,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
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
          <h2
            style={{
              margin: 0,
              color:
                "#3f344a",
              fontSize:
                "13px",
              fontWeight: 800,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin:
                "2px 0 0",
              color:
                "#8a8091",
              fontSize:
                "9px",
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
        alignItems:
          "center",
        gap: "5px",
        border:
          "1px solid #ddd4e8",
        borderRadius:
          "8px",
        padding:
          "7px 10px",
        background:
          active
            ? "#f3effb"
            : "#ffffff",
        color:
          active
            ? "#684d8c"
            : "#756b7d",
        fontSize:
          "10px",
        fontWeight: 700,
        cursor:
          "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================
   HEALTH METRIC
============================================================ */

function HealthMetric({
  label,
  value,
  type,
}) {
  const styles = {
    neutral: {
      background:
        "#f8fafc",
      color:
        "#3f344a",
    },

    green: {
      background:
        "#ecfdf5",
      color:
        "#047857",
    },

    red: {
      background:
        "#fef2f2",
      color:
        "#dc2626",
    },
  };

  const selected =
    styles[type];

  return (
    <div
      style={{
        background:
          selected.background,
        borderRadius:
          "10px",
        padding:
          "10px",
      }}
    >
      <div
        style={{
          color:
            "#81768a",
          fontSize:
            "9px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            "3px",
          color:
            selected.color,
          fontSize:
            "14px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   ATTENTION SMALL CARD
============================================================ */

function SmallAttention({
  label,
  value,
}) {
  return (
    <div
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #f3dede",
        borderRadius:
          "10px",
        padding:
          "10px",
        minWidth:
          "115px",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          color:
            "#81768a",
          fontSize:
            "9px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            "3px",
          color:
            "#dc2626",
          fontSize:
            "14px",
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
  icon,
  title,
  text,
  type,
}) {
  const styles = {
    green: {
      background:
        "#ecfdf5",
      border:
        "#d1fae5",
      color:
        "#059669",
    },

    red: {
      background:
        "#fef2f2",
      border:
        "#fee2e2",
      color:
        "#dc2626",
    },

    orange: {
      background:
        "#fff7ed",
      border:
        "#fed7aa",
      color:
        "#d97706",
    },

    purple: {
      background:
        "#f5f3ff",
      border:
        "#e9d5ff",
      color:
        "#7c3aed",
    },
  };

  const selected =
    styles[type];

  return (
    <div
      style={{
        background:
          selected.background,
        border:
          `1px solid ${selected.border}`,
        borderRadius:
          "10px",
        padding:
          "11px",
        display: "flex",
        gap: "8px",
      }}
    >
      <div
        style={{
          color:
            selected.color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              "#4b4154",
            fontSize:
              "10px",
            fontWeight: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop:
              "3px",
            color:
              "#766b7e",
            fontSize:
              "9px",
            lineHeight:
              1.45,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  text,
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        color:
          "#9b82bd",
        background:
          "#faf8ff",
        borderRadius:
          "10px",
        fontSize:
          "10px",
      }}
    >
      {text}
    </div>
  );
}

/* ============================================================
   TABLE
============================================================ */

function InvoiceTable({
  invoices,
  getBillDate,
  getDueDate,
  getBilling,
  getReceived,
  getDue,
  getInfo,
  formatCurrency,
}) {
  return (
    <section
      style={{
        background:
          "#ffffff",
        border:
          "1px solid #e7def5",
        borderRadius:
          "15px",
        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          padding:
            "15px",
          borderBottom:
            "1px solid #eee7f5",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap: "10px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color:
                "#3f344a",
              fontSize:
                "14px",
              fontWeight: 800,
            }}
          >
            Invoice Table View
          </h2>

          <p
            style={{
              margin:
                "3px 0 0",
              color:
                "#81768a",
              fontSize:
                "10px",
            }}
          >
            Invoice records for the current selection.
          </p>
        </div>

        <div
          style={{
            background:
              "#f3effb",
            color:
              "#684d8c",
            borderRadius:
              "9px",
            padding:
              "7px 10px",
            fontSize:
              "10px",
            fontWeight: 800,
          }}
        >
          {invoices.length.toLocaleString(
            "en-IN"
          )}{" "}
          invoices
        </div>
      </div>

      <div
        style={{
          overflowX:
            "auto",
        }}
      >
        <table
          style={{
            width:
              "100%",
            minWidth:
              "900px",
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
              {[
                "#",
                "Bill Date",
                "Due Date",
                "Billing",
                "Received",
                "Amount Due",
                "Info",
              ].map(
                (heading) => (
                  <th
                    key={
                      heading
                    }
                    style={{
                      padding:
                        "11px 13px",
                      textAlign:
                        heading ===
                          "Billing" ||
                        heading ===
                          "Received" ||
                        heading ===
                          "Amount Due"
                          ? "right"
                          : "left",
                      color:
                        "#684d8c",
                      fontSize:
                        "10px",
                      borderBottom:
                        "1px solid #e7def5",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {invoices.length >
            0 ? (
              invoices
                .slice(0, 500)
                .map(
                  (
                    invoice,
                    index
                  ) => {
                    const billDate =
                      getBillDate(
                        invoice
                      );

                    const dueDate =
                      getDueDate(
                        invoice
                      );

                    return (
                      <tr
                        key={
                          invoice.id ??
                          invoice._id ??
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #f1edf5",
                        }}
                      >
                        <td
                          style={tableCell()}
                        >
                          {index +
                            1}
                        </td>

                        <td
                          style={tableCell()}
                        >
                          {billDate
                            ? billDate.toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td
                          style={tableCell()}
                        >
                          {dueDate
                            ? dueDate.toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td
                          style={tableCell(
                            "right"
                          )}
                        >
                          {formatCurrency(
                            getBilling(
                              invoice
                            )
                          )}
                        </td>

                        <td
                          style={{
                            ...tableCell(
                              "right"
                            ),
                            color:
                              "#059669",
                            fontWeight:
                              700,
                          }}
                        >
                          {formatCurrency(
                            getReceived(
                              invoice
                            )
                          )}
                        </td>

                        <td
                          style={{
                            ...tableCell(
                              "right"
                            ),
                            color:
                              "#dc2626",
                            fontWeight:
                              700,
                          }}
                        >
                          {formatCurrency(
                            getDue(
                              invoice
                            )
                          )}
                        </td>

                        <td
                          style={tableCell()}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              background:
                                "#f3effb",
                              color:
                                "#684d8c",
                              borderRadius:
                                "999px",
                              padding:
                                "4px 8px",
                              fontSize:
                                "9px",
                              fontWeight:
                                700,
                            }}
                          >
                            {getInfo(
                              invoice
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
            ) : (
              <tr>
                <td
                  colSpan={
                    7
                  }
                  style={{
                    padding:
                      "45px",
                    textAlign:
                      "center",
                    color:
                      "#8a8091",
                    fontSize:
                      "11px",
                  }}
                >
                  No invoices found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {invoices.length >
        500 && (
        <div
          style={{
            padding:
              "10px 14px",
            background:
              "#faf8ff",
            color:
              "#684d8c",
            fontSize:
              "9px",
            fontWeight:
              600,
          }}
        >
          Showing the first 500 invoice records for performance.
        </div>
      )}
    </section>
  );
}

/* ============================================================
   TABLE CELL
============================================================ */

function tableCell(
  align = "left"
) {
  return {
    padding:
      "10px 13px",
    textAlign: align,
    color:
      "#5d5366",
    fontSize:
      "10px",
    whiteSpace:
      "nowrap",
  };
}

export default Invoices;
