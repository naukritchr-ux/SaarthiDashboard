import { useEffect, useMemo, useState } from "react";

import {
  RefreshCw,
  Users,
  ClipboardList,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";

function BusinessInsights({ setActivePage }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch(
        "http://localhost:5000/api/dashboard/summary?period=all"
      );

      if (!response.ok) {
        throw new Error("Unable to load business insights");
      }

      const data = await response.json();

      setSummary(data);
    } catch (err) {
      console.error("Business Insights Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // ==================================================
  // SAFE DATA
  // ==================================================

  const clients = summary?.clients || {};
  const enquiries = summary?.enquiries || {};
  const invoices = summary?.invoices || {};
  const aging = summary?.aging || {};
  const attention = summary?.attention || {};

  // ==================================================
  // FORMATTERS
  // ==================================================

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }

    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }

    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatPercentage = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

  // ==================================================
  // CALCULATED BUSINESS METRICS
  // ==================================================

  const metrics = useMemo(() => {
    const totalClients = Number(clients.total || 0);
    const activeClients = Number(clients.active || 0);

    const totalEnquiries = Number(
      enquiries.total || 0
    );

    const closedEnquiries = Number(
      enquiries.closed || 0
    );

    const billing = Number(
      invoices.totalBilling || 0
    );

    const received = Number(
      invoices.amountReceived || 0
    );

    const outstanding = Number(
      invoices.amountDue || 0
    );

    const activeRate =
      totalClients > 0
        ? (activeClients / totalClients) * 100
        : 0;

    const closureRate =
      totalEnquiries > 0
        ? (closedEnquiries / totalEnquiries) * 100
        : 0;

    const collectionRate =
      billing > 0
        ? (received / billing) * 100
        : 0;

    return {
      totalClients,
      activeClients,
      totalEnquiries,
      closedEnquiries,
      billing,
      received,
      outstanding,
      activeRate,
      closureRate,
      collectionRate,
    };
  }, [
    clients,
    enquiries,
    invoices,
  ]);

  // ==================================================
  // BUSINESS INSIGHTS
  // ==================================================

  const insights = useMemo(() => {
    const result = [];

    // CLIENT INSIGHT

    if (metrics.activeRate >= 75) {
      result.push({
        type: "positive",
        icon: Users,
        title: "Healthy Client Activity",
        text: `${metrics.activeRate.toFixed(
          1
        )}% of the client base is currently active. This indicates strong ongoing engagement.`,
      });
    } else {
      result.push({
        type: "attention",
        icon: Users,
        title: "Client Activity Needs Attention",
        text: `Only ${metrics.activeRate.toFixed(
          1
        )}% of clients are active. Re-engagement of inactive clients could be an opportunity.`,
      });
    }

    // ENQUIRY INSIGHT

    if (metrics.closureRate >= 60) {
      result.push({
        type: "positive",
        icon: ClipboardList,
        title: "Good Enquiry Closure",
        text: `${metrics.closureRate.toFixed(
          1
        )}% of enquiries have been closed, showing a healthy conversion position.`,
      });
    } else {
      result.push({
        type: "attention",
        icon: ClipboardList,
        title: "Enquiry Conversion Opportunity",
        text: `The current enquiry closure rate is ${metrics.closureRate.toFixed(
          1
        )}%. Reviewing open enquiries may improve conversions.`,
      });
    }

    // COLLECTION INSIGHT

    if (metrics.collectionRate >= 75) {
      result.push({
        type: "positive",
        icon: IndianRupee,
        title: "Strong Collection Position",
        text: `${metrics.collectionRate.toFixed(
          1
        )}% of billed value has been collected.`,
      });
    } else {
      result.push({
        type: "attention",
        icon: IndianRupee,
        title: "Collection Requires Focus",
        text: `Only ${metrics.collectionRate.toFixed(
          1
        )}% of billed value has been collected. Outstanding receivables require attention.`,
      });
    }

    // AGEING INSIGHT

    const overdue90 = Number(
      aging["90+"] || 0
    );

    if (overdue90 > 0) {
      result.push({
        type: "attention",
        icon: Clock,
        title: "Long-Aged Receivables",
        text: `${formatCurrency(
          overdue90
        )} is currently in the 90+ day ageing bucket.`,
      });
    } else {
      result.push({
        type: "positive",
        icon: CheckCircle2,
        title: "No 90+ Day Receivables",
        text: "There is currently no amount recorded in the 90+ day ageing bucket.",
      });
    }

    return result;
  }, [
    metrics,
    aging,
  ]);

  // ==================================================
  // TOP PRIORITIES
  // ==================================================

  const priorities = useMemo(() => {
    const result = [];

    if (metrics.activeRate < 75) {
      result.push({
        priority: "High",
        title: "Re-engage inactive clients",
        description:
          "Identify inactive clients and plan follow-up activities.",
      });
    }

    if (metrics.closureRate < 60) {
      result.push({
        priority: "High",
        title: "Improve enquiry conversion",
        description:
          "Review open enquiries and identify reasons for non-closure.",
      });
    }

    if (metrics.collectionRate < 75) {
      result.push({
        priority: "High",
        title: "Follow up outstanding payments",
        description:
          "Prioritize overdue invoices and improve collection follow-ups.",
      });
    }

    if (Number(aging["90+"] || 0) > 0) {
      result.push({
        priority: "High",
        title: "Review 90+ day receivables",
        description:
          "Long-aged outstanding amounts should be reviewed by the finance team.",
      });
    }

    if (result.length === 0) {
      result.push({
        priority: "Low",
        title: "Maintain current performance",
        description:
          "Current major business indicators are in a healthy position.",
      });
    }

    return result;
  }, [
    metrics,
    aging,
  ]);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">

        <div className="flex flex-col items-center justify-center">

          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading Business Insights...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Analysing current Sarthi360 business data.
          </p>

        </div>

      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-12 shadow-sm">

        <div className="mx-auto flex max-w-md flex-col items-center text-center">

          <div className="rounded-2xl bg-rose-100 p-4">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-800">
            Unable to Load Business Insights
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            The dashboard API could not be reached.
            Make sure your backend is running on port 5000.
          </p>

          <button
            onClick={fetchInsights}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          TOP ACTION BAR
      ================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
            MANAGEMENT VIEW
          </p>

          <h3 className="mt-1 text-2xl font-bold text-slate-800">
            Business Insights
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Understand what is happening across clients,
            enquiries and financial performance.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              setActivePage("Dashboard")
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={fetchInsights}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

        </div>

      </div>

      {/* ==================================================
          KPI SUMMARY
      ================================================== */}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* CLIENT ACTIVITY */}

        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-cyan-100 p-3">
              <Users className="h-5 w-5 text-cyan-600" />
            </div>

            {metrics.activeRate >= 75 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )}

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Client Activity
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {formatPercentage(
              metrics.activeRate
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatNumber(
              metrics.activeClients
            )}{" "}
            active of{" "}
            {formatNumber(
              metrics.totalClients
            )}
          </p>

        </div>

        {/* ENQUIRY CLOSURE */}

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-violet-100 p-3">
              <ClipboardList className="h-5 w-5 text-violet-600" />
            </div>

            {metrics.closureRate >= 60 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )}

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Enquiry Closure
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {formatPercentage(
              metrics.closureRate
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatNumber(
              metrics.closedEnquiries
            )}{" "}
            closed enquiries
          </p>

        </div>

        {/* COLLECTION */}

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-emerald-100 p-3">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
            </div>

            {metrics.collectionRate >= 75 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )}

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Collection Rate
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {formatPercentage(
              metrics.collectionRate
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatCurrency(
              metrics.received
            )}{" "}
            received
          </p>

        </div>

        {/* OUTSTANDING */}

        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-rose-100 p-3">
              <IndianRupee className="h-5 w-5 text-rose-600" />
            </div>

            <AlertTriangle className="h-5 w-5 text-rose-500" />

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Outstanding
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {formatCurrency(
              metrics.outstanding
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Amount currently due
          </p>

        </div>

      </section>

      {/* ==================================================
          KEY BUSINESS OBSERVATIONS
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">
            <Lightbulb className="h-5 w-5 text-violet-600" />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800">
              Key Business Observations
            </h3>

            <p className="text-sm text-slate-500">
              Automatically generated from the current dashboard data.
            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {insights.map(
            (insight, index) => {

              const Icon = insight.icon;

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-5 ${
                    insight.type === "positive"
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-amber-100 bg-amber-50"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`rounded-lg p-2 ${
                        insight.type === "positive"
                          ? "bg-emerald-100"
                          : "bg-amber-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          insight.type === "positive"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      />
                    </div>

                    <div>

                      <p className="font-bold text-slate-800">
                        {insight.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
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

      {/* ==================================================
          MANAGEMENT PRIORITIES
      ================================================== */}

      <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-rose-100 p-3">
            <Target className="h-5 w-5 text-rose-600" />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800">
              Management Priorities
            </h3>

            <p className="text-sm text-slate-500">
              Areas that management may want to review.
            </p>

          </div>

        </div>

        <div className="mt-5 space-y-3">

          {priorities.map(
            (item, index) => (

              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-violet-600 shadow-sm">
                  {index + 1}
                </div>

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="font-semibold text-slate-800">
                      {item.title}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.priority === "High"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {item.priority}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* ==================================================
          FINANCIAL SUMMARY
      ================================================== */}

      <section className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-orange-100 p-3">
              <IndianRupee className="h-5 w-5 text-orange-600" />
            </div>

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Financial Position
              </h3>

              <p className="text-sm text-slate-500">
                Current billing and collection position.
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Total Billing
              </span>

              <span className="font-bold text-slate-800">
                {formatCurrency(
                  metrics.billing
                )}
              </span>

            </div>

            <div className="h-2 rounded-full bg-slate-100">

              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(
                    metrics.collectionRate,
                    100
                  )}%`,
                }}
              />

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Received
              </span>

              <span className="font-bold text-emerald-600">
                {formatCurrency(
                  metrics.received
                )}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Outstanding
              </span>

              <span className="font-bold text-rose-500">
                {formatCurrency(
                  metrics.outstanding
                )}
              </span>

            </div>

          </div>

        </div>

        {/* ATTENTION SUMMARY */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-rose-100 p-3">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Attention Summary
              </h3>

              <p className="text-sm text-slate-500">
                Items that may require follow-up.
              </p>

            </div>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-violet-50 p-4">

              <p className="text-xs text-violet-600">
                Enquiries
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatNumber(
                  attention.enquiries
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Need attention
              </p>

            </div>

            <div className="rounded-xl bg-orange-50 p-4">

              <p className="text-xs text-orange-600">
                Invoices
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatNumber(
                  attention.invoices
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Overdue
              </p>

            </div>

          </div>

          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Total Attention Items
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {formatNumber(
                    attention.total
                  )}
                </p>

              </div>

              <AlertTriangle className="h-6 w-6 text-rose-500" />

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default BusinessInsights;