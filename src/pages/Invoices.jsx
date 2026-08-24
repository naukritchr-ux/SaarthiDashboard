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
  CalendarDays,
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

function Invoices() {
  // =====================================================
  // STATE
  // =====================================================

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [period, setPeriod] = useState("all");
  const [infoFilter, setInfoFilter] = useState("all");

  // Chart View / Table View
  const [viewMode, setViewMode] = useState("charts");

  // =====================================================
  // FETCH INVOICES
  // =====================================================

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/dashboard/invoices"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setInvoices(data);
    } catch (err) {
      console.error("Invoice API Error:", err);

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

  // =====================================================
  // FIELD HELPERS
  // =====================================================

  const getBillDate = (invoice) => {
    const value =
      invoice?.billDate ||
      invoice?.bill_date ||
      invoice?.invoiceDate ||
      invoice?.invoice_date;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const getDueDate = (invoice) => {
    const value =
      invoice?.dueDate ||
      invoice?.due_date;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const getBilling = (invoice) => {
    const raw =
      invoice?.totalBillAmt ??
      invoice?.total_bill_amt ??
      invoice?.billing ??
      invoice?.totalAmount ??
      invoice?.total_amount ??
      0;

    const value = Number(
      String(raw).replace(/,/g, "")
    );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  const getReceived = (invoice) => {
    const raw =
      invoice?.amountReceived ??
      invoice?.amount_received ??
      invoice?.received ??
      0;

    const value = Number(
      String(raw).replace(/,/g, "")
    );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  const getDue = (invoice) => {
    const raw =
      invoice?.amountDue ??
      invoice?.amount_due ??
      invoice?.due ??
      0;

    const value = Number(
      String(raw).replace(/,/g, "")
    );

    return Number.isFinite(value)
      ? value
      : 0;
  };

  // =====================================================
  // INFO FIELD
  // =====================================================

  const getInfo = (invoice) => {
    const value = invoice?.info;

    if (
      value === null ||
      value === undefined
    ) {
      return "Unknown";
    }

    const text = String(value).trim();

    return text || "Unknown";
  };

  // =====================================================
  // PERIOD RANGE
  // =====================================================

  const getPeriodRange = (selectedPeriod) => {
    const now = new Date();

    if (selectedPeriod === "all") {
      return {
        start: null,
        end: null,
      };
    }

    if (selectedPeriod === "thisMonth") {
      return {
        start: new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ),
        end: now,
      };
    }

    if (selectedPeriod === "lastMonth") {
      return {
        start: new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        ),
        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        ),
      };
    }

    if (selectedPeriod === "thisQuarter") {
      const quarterStart =
        Math.floor(
          now.getMonth() / 3
        ) * 3;

      return {
        start: new Date(
          now.getFullYear(),
          quarterStart,
          1
        ),
        end: now,
      };
    }

    if (selectedPeriod === "thisYear") {
      return {
        start: new Date(
          now.getFullYear(),
          0,
          1
        ),
        end: now,
      };
    }

    return {
      start: null,
      end: null,
    };
  };

  const periodRange = useMemo(
    () => getPeriodRange(period),
    [period]
  );

  // =====================================================
  // INFO OPTIONS
  // =====================================================

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

  // =====================================================
  // FILTERED INVOICES
  // =====================================================

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const billDate =
        getBillDate(invoice);

      // Period filter
      if (periodRange.start) {
        if (!billDate) {
          return false;
        }

        if (
          billDate <
            periodRange.start ||
          billDate >
            periodRange.end
        ) {
          return false;
        }
      }

      // Info filter
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
  // TOTAL BILLING
  // =====================================================

  const totalBilling = useMemo(
    () =>
      filteredInvoices.reduce(
        (sum, invoice) =>
          sum + getBilling(invoice),
        0
      ),
    [filteredInvoices]
  );

  // =====================================================
  // TOTAL RECEIVED
  // =====================================================

  const amountReceived = useMemo(
    () =>
      filteredInvoices.reduce(
        (sum, invoice) =>
          sum + getReceived(invoice),
        0
      ),
    [filteredInvoices]
  );

  // =====================================================
  // TOTAL DUE
  // =====================================================

  const amountDue = useMemo(
    () =>
      filteredInvoices.reduce(
        (sum, invoice) =>
          sum + getDue(invoice),
        0
      ),
    [filteredInvoices]
  );

  // =====================================================
  // COLLECTION RATE
  // =====================================================

  const collectionRate =
    totalBilling > 0
      ? (amountReceived /
          totalBilling) *
        100
      : 0;

  // =====================================================
  // BILLING TREND
  // =====================================================

  const billingTrend = useMemo(() => {
    const monthly = {};

    filteredInvoices.forEach((invoice) => {
      const date =
        getBillDate(invoice);

      if (!date) return;

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
    });

    return Object.values(monthly)
      .sort((a, b) =>
        a.key.localeCompare(b.key)
      )
      .slice(-12);
  }, [filteredInvoices]);

  // =====================================================
  // RECEIVED VS OUTSTANDING
  // =====================================================

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

  // =====================================================
  // INFO DISTRIBUTION
  // =====================================================

  const infoData = useMemo(() => {
    const counts = {};

    filteredInvoices.forEach((invoice) => {
      const info =
        getInfo(invoice);

      counts[info] =
        (counts[info] || 0) + 1;
    });

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

  // =====================================================
  // INVOICE AGEING
  // =====================================================

  const agingData = useMemo(() => {
    const today = new Date();

    const aging = {
      "0–30 Days": 0,
      "31–60 Days": 0,
      "61–90 Days": 0,
      "90+ Days": 0,
    };

    filteredInvoices.forEach((invoice) => {
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
        (1000 * 60 * 60 * 24);

      if (days <= 30) {
        aging["0–30 Days"] += due;
      } else if (days <= 60) {
        aging["31–60 Days"] += due;
      } else if (days <= 90) {
        aging["61–90 Days"] += due;
      } else {
        aging["90+ Days"] += due;
      }
    });

    return Object.entries(aging).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
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

  // =====================================================
  // FINANCIAL HEALTH
  // =====================================================

  let healthTitle = "Healthy";
  let healthText =
    "Collection performance is currently healthy.";
  let healthColor = "emerald";

  if (totalBilling === 0) {
    healthTitle = "No Billing Data";

    healthText =
      "There is no billing amount available for the selected filters.";

    healthColor = "slate";
  } else if (amountDue === 0) {
    healthTitle =
      "Fully Collected";

    healthText =
      "There is no outstanding amount in the selected data.";

    healthColor = "emerald";
  } else if (collectionRate < 50) {
    healthTitle =
      "Needs Attention";

    healthText =
      "A large portion of billing remains outstanding.";

    healthColor = "rose";
  } else if (collectionRate < 75) {
    healthTitle = "Moderate";

    healthText =
      "Collections are progressing, but outstanding billing should be monitored.";

    healthColor = "amber";
  }

  // =====================================================
  // SMART INSIGHTS
  // =====================================================

  const insights = useMemo(() => {
    const result = [];

    if (totalBilling === 0) {
      return [
        {
          title: "No billing data",
          text:
            "No invoice billing amount was found for the selected period and Info filter.",
          type: "info",
        },
      ];
    }

    if (collectionRate >= 75) {
      result.push({
        title:
          "Strong collection performance",
        text: `${collectionRate.toFixed(
          1
        )}% of total billing has been received.`,
        type: "positive",
      });
    } else if (collectionRate >= 50) {
      result.push({
        title:
          "Collection performance is moderate",
        text: `${collectionRate.toFixed(
          1
        )}% of billing has been collected. Outstanding amounts should continue to be monitored.`,
        type: "info",
      });
    } else {
      result.push({
        title:
          "Collection requires attention",
        text: `Only ${collectionRate.toFixed(
          1
        )}% of billing has been received.`,
        type: "attention",
      });
    }

    if (amountDue > 0) {
      result.push({
        title:
          "Outstanding amount",
        text: `${formatCurrency(
          amountDue
        )} remains outstanding.`,
        type: "attention",
      });
    }

    if (overdue31Plus > 0) {
      result.push({
        title:
          "Ageing requires monitoring",
        text: `${formatCurrency(
          overdue31Plus
        )} is in the 31+ day ageing buckets.`,
        type: "attention",
      });
    }

    if (overdue90Plus > 0) {
      result.push({
        title:
          "90+ day outstanding detected",
        text: `${formatCurrency(
          overdue90Plus
        )} is sitting in the 90+ day bucket and should be prioritised for follow-up.`,
        type: "attention",
      });
    }

    if (
      amountReceived > 0 &&
      collectionRate >= 75
    ) {
      result.push({
        title:
          "Collections are progressing well",
        text: `${formatCurrency(
          amountReceived
        )} has already been received.`,
        type: "positive",
      });
    }

    return result.slice(0, 4);
  }, [
    totalBilling,
    collectionRate,
    amountDue,
    overdue31Plus,
    overdue90Plus,
    amountReceived,
  ]);

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setPeriod("all");
    setInfoFilter("all");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading invoice data...
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

        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">

          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Invoice data could not be loaded
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchInvoices}
            className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-violet-500">
            Sarthi360 Analytics
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Invoice Financial Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor billing, collections, outstanding amounts and invoice ageing.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* CHART / TABLE TOGGLE */}

          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

            <button
              type="button"
              onClick={() =>
                setViewMode("charts")
              }
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                viewMode === "charts"
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Chart View
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode("table")
              }
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                viewMode === "table"
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Table2 className="h-4 w-4" />
              Table View
            </button>

          </div>

          <CalendarDays className="h-4 w-4 text-violet-500" />

          {/* PERIOD FILTER */}

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm outline-none focus:border-violet-400"
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

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-violet-100 p-2.5">
              <Filter className="h-5 w-5 text-violet-600" />
            </div>

            <div>

              <h3 className="font-semibold text-slate-800">
                Invoice Filters
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Filter invoice analytics using the Info field and period.
              </p>

            </div>

          </div>

          <button
            onClick={resetFilters}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            Reset Filters
          </button>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* INFO FILTER */}

          <select
            value={infoFilter}
            onChange={(e) =>
              setInfoFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-violet-400"
          >

            <option value="all">
              All Info
            </option>

            {infoOptions.map((info) => (
              <option
                key={info}
                value={info}
              >
                {info}
              </option>
            ))}

          </select>

          {/* CURRENT COUNT */}

          <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">

            <Receipt className="mr-2 h-4 w-4 text-slate-400" />

            {filteredInvoices.length.toLocaleString(
              "en-IN"
            )}{" "}
            invoices in current selection

          </div>

        </div>

      </section>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL BILLING */}

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
            <IndianRupee className="h-6 w-6 text-cyan-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Billing
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {formatCurrency(totalBilling)}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Across selected invoices
          </p>

        </div>

        {/* RECEIVED */}

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <WalletCards className="h-6 w-6 text-emerald-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Amount Received
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {formatCurrency(amountReceived)}
          </h2>

          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">

            <TrendingUp className="h-3.5 w-3.5" />

            Collected

          </div>

        </div>

        {/* DUE */}

        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100">
            <CircleDollarSign className="h-6 w-6 text-rose-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Amount Due
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {formatCurrency(amountDue)}
          </h2>

          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-600">

            <TrendingDown className="h-3.5 w-3.5" />

            Outstanding

          </div>

        </div>

        {/* COLLECTION RATE */}

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <CheckCircle2 className="h-6 w-6 text-violet-600" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Collection Rate
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            {collectionRate.toFixed(1)}%
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Received / Total Billing
          </p>

        </div>

      </section>

      {/* =====================================================
          TABLE VIEW
          PAYMENT STATUS COMPLETELY REMOVED
      ===================================================== */}

      {viewMode === "table" ? (

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                Invoice Table View
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing invoices from the current period and Info filter.
              </p>

            </div>

            <div className="rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">

              {filteredInvoices.length.toLocaleString(
                "en-IN"
              )}{" "}
              invoices

            </div>

          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">

            <table className="min-w-full divide-y divide-slate-200 text-sm">

              <thead className="bg-slate-50">

                <tr>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    #
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    Bill Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    Due Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">
                    Billing
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">
                    Received
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-600">
                    Amount Due
                  </th>

                  {/* ONLY INFO - NO PAYMENT STATUS */}

                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    Info
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">

                {filteredInvoices.length > 0 ? (

                  filteredInvoices.map(
                    (invoice, index) => {

                      const billDate =
                        getBillDate(invoice);

                      const dueDate =
                        getDueDate(invoice);

                      const info =
                        getInfo(invoice);

                      return (
                        <tr
                          key={
                            invoice.id ??
                            invoice._id ??
                            index
                          }
                          className="hover:bg-slate-50"
                        >

                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                            {index + 1}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {billDate
                              ? billDate.toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {dueDate
                              ? dueDate.toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-700">
                            {formatCurrency(
                              getBilling(invoice)
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                            {formatCurrency(
                              getReceived(invoice)
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-rose-600">
                            {formatCurrency(
                              getDue(invoice)
                            )}
                          </td>

                          {/* INFO */}

                          <td className="whitespace-nowrap px-4 py-3">

                            <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              {info}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      No invoices found for the selected filters.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      ) : (

        /* =====================================================
           CHART VIEW
        ===================================================== */

        <>

          {/* BILLING & COLLECTION TREND */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-100 p-2.5">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Billing & Collection Trend
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monthly billing, received amount and outstanding amount.
                </p>

              </div>

            </div>

            <div className="mt-5 h-80">

              {billingTrend.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart data={billingTrend}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          Number(value)
                        )
                      }
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="billing"
                      name="Billing"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="received"
                      name="Received"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="due"
                      name="Outstanding"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No billing date data available for the selected filters.
                </div>

              )}

            </div>

          </section>

          {/* RECEIVED VS OUTSTANDING + INFO DISTRIBUTION */}

          <section className="grid gap-6 xl:grid-cols-2">

            {/* RECEIVED VS OUTSTANDING */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-100 p-2.5">
                  <WalletCards className="h-5 w-5 text-emerald-600" />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Received vs Outstanding
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current financial collection position.
                  </p>

                </div>

              </div>

              <div className="mt-4 h-64">

                {paymentData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={4}
                      >

                        <Cell fill="#10b981" />

                        <Cell fill="#f43f5e" />

                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(
                            Number(value)
                          )
                        }
                      />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No financial values available.
                  </div>

                )}

              </div>

            </div>

            {/* INFO DISTRIBUTION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-violet-100 p-2.5">
                  <Receipt className="h-5 w-5 text-violet-600" />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Invoice Info Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution of invoices by Info.
                  </p>

                </div>

              </div>

              <div className="mt-4 h-64">

                {infoData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={infoData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                      >

                        {infoData.map(
                          (item, index) => (
                            <Cell
                              key={`${item.name}-${index}`}
                              fill={
                                [
                                  "#8b5cf6",
                                  "#06b6d4",
                                  "#10b981",
                                  "#f59e0b",
                                  "#f43f5e",
                                  "#6366f1",
                                  "#14b8a6",
                                  "#ec4899",
                                ][
                                  index % 8
                                ]
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
                    No Info data available.
                  </div>

                )}

              </div>

            </div>

          </section>

          {/* FINANCIAL HEALTH */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    healthColor === "emerald"
                      ? "bg-emerald-100"
                      : healthColor === "amber"
                      ? "bg-amber-100"
                      : healthColor === "rose"
                      ? "bg-rose-100"
                      : "bg-slate-100"
                  }`}
                >

                  {healthColor === "emerald" ? (

                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />

                  ) : (

                    <AlertCircle
                      className={`h-7 w-7 ${
                        healthColor === "amber"
                          ? "text-amber-600"
                          : healthColor === "rose"
                          ? "text-rose-600"
                          : "text-slate-500"
                      }`}
                    />

                  )}

                </div>

                <div>

                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Financial Health
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-800">
                    {healthTitle}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    {healthText}
                  </p>

                </div>

              </div>

              <div className="w-full max-w-md">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm font-semibold text-slate-600">
                    Collection Progress
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {collectionRate.toFixed(1)}%
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{
                      width: `${Math.min(
                        collectionRate,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs text-slate-500">
                  Total Billing
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {formatCurrency(totalBilling)}
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 p-4">

                <p className="text-xs text-emerald-600">
                  Received
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-700">
                  {formatCurrency(amountReceived)}
                </p>

              </div>

              <div className="rounded-xl bg-rose-50 p-4">

                <p className="text-xs text-rose-600">
                  Outstanding
                </p>

                <p className="mt-1 text-lg font-bold text-rose-700">
                  {formatCurrency(amountDue)}
                </p>

              </div>

            </div>

          </section>

          {/* INVOICE AGEING */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-amber-100 p-2.5">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Invoice Ageing
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Outstanding invoice amount grouped by ageing period.
                </p>

              </div>

            </div>

            <div className="mt-5 h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={agingData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        Number(value)
                      )
                    }
                  />

                  <Bar
                    dataKey="value"
                    name="Outstanding"
                    fill="#f59e0b"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">

              {agingData.map((item) => (

                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 p-4"
                >

                  <p className="text-xs text-slate-500">
                    {item.name}
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {formatCurrency(
                      item.value
                    )}
                  </p>

                </div>

              ))}

            </div>

          </section>

          {/* ATTENTION REQUIRED */}

          <section className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-rose-100 p-3">

                  <AlertCircle className="h-6 w-6 text-rose-600" />

                </div>

                <div>

                  <p className="text-sm font-semibold uppercase tracking-wider text-rose-600">
                    Attention Required
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-800">
                    {formatCurrency(
                      overdue31Plus
                    )}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Outstanding amount is sitting in the 31+ day ageing buckets. These invoices should receive priority during collection follow-up.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-white p-4 text-center shadow-sm">

                  <p className="text-xs text-slate-500">
                    31+ Days
                  </p>

                  <p className="mt-1 text-lg font-bold text-rose-600">
                    {formatCurrency(
                      overdue31Plus
                    )}
                  </p>

                </div>

                <div className="rounded-xl bg-white p-4 text-center shadow-sm">

                  <p className="text-xs text-slate-500">
                    90+ Days
                  </p>

                  <p className="mt-1 text-lg font-bold text-rose-700">
                    {formatCurrency(
                      overdue90Plus
                    )}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* SMART FINANCIAL INSIGHTS */}

          <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-violet-100 p-2.5">
                <Lightbulb className="h-5 w-5 text-violet-600" />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Smart Financial Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Key observations generated from the selected invoice data.
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

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

                      <div className="flex gap-3">

                        {attention ? (

                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />

                        ) : positive ? (

                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

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

        </>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-5">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Invoice analytics
            </p>

            <p className="mt-1 text-xs text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-700">
                {filteredInvoices.length.toLocaleString(
                  "en-IN"
                )}
              </span>{" "}

              invoices matching the selected filters.

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

export default Invoices;