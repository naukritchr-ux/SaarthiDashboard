const express = require("express");
const cors = require("cors");

const {
  fetchClients,
  fetchEnquiries,
  fetchInvoices,
} = require("./services/apiService");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==================================================
// HELPERS
// ==================================================

function normalizeData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getPeriodRange(period) {
  const now = new Date();

  // ALL TIME
  if (!period || period === "all") {
    return {
      start: null,
      end: null,
      previousStart: null,
      previousEnd: null,
    };
  }

  // THIS MONTH
  if (period === "thisMonth") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const previousEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end: now,
      previousStart,
      previousEnd,
    };
  }

  // LAST MONTH
  if (period === "lastMonth") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const previousEnd = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
      previousStart,
      previousEnd,
    };
  }

  // THIS QUARTER
  if (period === "thisQuarter") {
    const quarterStartMonth =
      Math.floor(now.getMonth() / 3) * 3;

    const start = new Date(
      now.getFullYear(),
      quarterStartMonth,
      1
    );

    const previousStart = new Date(
      now.getFullYear(),
      quarterStartMonth - 3,
      1
    );

    const previousEnd = new Date(
      now.getFullYear(),
      quarterStartMonth,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end: now,
      previousStart,
      previousEnd,
    };
  }

  // THIS YEAR
  if (period === "thisYear") {
    const start = new Date(
      now.getFullYear(),
      0,
      1
    );

    const previousStart = new Date(
      now.getFullYear() - 1,
      0,
      1
    );

    const previousEnd = new Date(
      now.getFullYear(),
      0,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end: now,
      previousStart,
      previousEnd,
    };
  }

  return {
    start: null,
    end: null,
    previousStart: null,
    previousEnd: null,
  };
}

function isDateInRange(date, start, end) {
  if (!start || !end) {
    return true;
  }

  if (!date) {
    return false;
  }

  return date >= start && date <= end;
}

function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return 100;
  }

  return ((current - previous) / previous) * 100;
}

function getInvoiceAmount(invoice, field) {
  const value = Number(
    String(invoice?.[field] || 0).replace(/,/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.json({
    message: "Sarthi360 Dashboard Backend is running",
  });
});

// ==================================================
// RAW CLIENTS API
// ==================================================

app.get("/api/dashboard/clients", async (req, res) => {
  try {
    const clients = await fetchClients();

    res.json(clients);
  } catch (error) {
    console.error(
      "Clients API Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to fetch client data from Sarthi360",
      error: error.message,
    });
  }
});

// ==================================================
// RAW ENQUIRIES API
// ==================================================

app.get("/api/dashboard/enquiries", async (req, res) => {
  try {
    const enquiries = await fetchEnquiries();

    res.json(enquiries);
  } catch (error) {
    console.error(
      "Enquiries API Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to fetch enquiry data from Sarthi360",
      error: error.message,
    });
  }
});

// ==================================================
// RAW INVOICES API
// ==================================================

app.get("/api/dashboard/invoices", async (req, res) => {
  try {
    const invoices = await fetchInvoices();

    res.json(invoices);
  } catch (error) {
    console.error(
      "Invoice API Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to fetch invoice data from Sarthi360",
      error: error.message,
    });
  }
});

// ==================================================
// DASHBOARD SUMMARY
// ==================================================

app.get(
  "/api/dashboard/summary",
  async (req, res) => {
    try {
      const period =
        req.query.period || "all";

      // ==================================================
      // FETCH ALL DATA
      // ==================================================

      const [
        clientsResponse,
        enquiriesResponse,
        invoicesResponse,
      ] = await Promise.all([
        fetchClients(),
        fetchEnquiries(),
        fetchInvoices(),
      ]);

      const clients =
        normalizeData(clientsResponse);

      const enquiries =
        normalizeData(enquiriesResponse);

      const invoices =
        normalizeData(invoicesResponse);

      console.log(
        "Dashboard data:",
        "Clients =", clients.length,
        "Enquiries =", enquiries.length,
        "Invoices =", invoices.length
      );

      // ==================================================
      // PERIOD
      // ==================================================

      const {
        start,
        end,
        previousStart,
        previousEnd,
      } = getPeriodRange(period);

      // ==================================================
      // CLIENTS
      // ==================================================

      const currentClients = clients;

      const previousClients = clients;

      const totalClients =
        currentClients.length;

      const activeClients =
        currentClients.filter((client) => {
          const status = String(
            client?.status || ""
          ).toLowerCase();

          return status === "active";
        }).length;

      const inactiveClients =
        totalClients - activeClients;

      const previousTotalClients =
        previousClients.length;

      const previousActiveClients =
        previousClients.filter((client) => {
          const status = String(
            client?.status || ""
          ).toLowerCase();

          return status === "active";
        }).length;

      // ==================================================
      // YEARLY MEMBERS
      // ==================================================
      // Uses client created_at.
      // This feeds the existing Yearly Members chart.

      const yearlyMembersMap = {};

      clients.forEach((client) => {
        const date = parseDate(
          client?.created_at ||
          client?.createdAt ||
          client?.createdDate
        );

        if (!date) {
          return;
        }

        const year = String(
          date.getFullYear()
        );

        if (!yearlyMembersMap[year]) {
          yearlyMembersMap[year] = 0;
        }

        yearlyMembersMap[year] += 1;
      });

      const yearlyMembers =
        Object.entries(yearlyMembersMap)
          .sort(
            ([yearA], [yearB]) =>
              Number(yearA) - Number(yearB)
          )
          .map(([year, members]) => ({
            year,
            members,
          }));

      console.log(
        "Yearly Members:",
        yearlyMembers
      );

      // ==================================================
      // ENQUIRIES
      // ==================================================

      const currentEnquiries =
        enquiries.filter((enquiry) => {
          const date = parseDate(
            enquiry?.created_at
          );

          return isDateInRange(
            date,
            start,
            end
          );
        });

      const previousEnquiries =
        enquiries.filter((enquiry) => {
          const date = parseDate(
            enquiry?.created_at
          );

          return isDateInRange(
            date,
            previousStart,
            previousEnd
          );
        });

      const totalEnquiries =
        currentEnquiries.length;

      const closedEnquiries =
        currentEnquiries.filter((enquiry) => {
          return (
            String(
              enquiry?.enquiryStatus || ""
            ).toLowerCase() === "closed"
          );
        }).length;

      const inProgressEnquiries =
        currentEnquiries.filter((enquiry) => {
          return (
            String(
              enquiry?.enquiryStatus || ""
            ).toLowerCase() === "inprogress"
          );
        }).length;

      const allocatedEnquiries =
        currentEnquiries.filter((enquiry) => {
          return Boolean(
            enquiry?.dateOfAllocation
          );
        }).length;

      const previousTotalEnquiries =
        previousEnquiries.length;

      const previousClosedEnquiries =
        previousEnquiries.filter((enquiry) => {
          return (
            String(
              enquiry?.enquiryStatus || ""
            ).toLowerCase() === "closed"
          );
        }).length;

      const enquiryClosureRate =
        totalEnquiries > 0
          ? (closedEnquiries /
              totalEnquiries) *
            100
          : 0;

      const previousClosureRate =
        previousTotalEnquiries > 0
          ? (previousClosedEnquiries /
              previousTotalEnquiries) *
            100
          : 0;

      // ==================================================
      // BD MEMBER PERFORMANCE
      // ==================================================
      // Uses the actual enquiry field:
      // bdMemberName
      //
      // This feeds the existing BD Member Performance chart.

      const bdMembersMap = {};

      currentEnquiries.forEach(
        (enquiry) => {
          const name =
            enquiry?.bdMemberName ||
            enquiry?.bd_member_name ||
            enquiry?.bdMember ||
            enquiry?.bd_member ||
            "Unknown";

          if (!bdMembersMap[name]) {
            bdMembersMap[name] = {
              name,
              enquiries: 0,
              closed: 0,
              clients: 0,
            };
          }

          bdMembersMap[name]
            .enquiries += 1;

          const status = String(
            enquiry?.enquiryStatus || ""
          ).toLowerCase();

          if (status === "closed") {
            bdMembersMap[name]
              .closed += 1;
          }
        }
      );

      // Sort BD members by enquiry count.
      const bdMembers =
        Object.values(bdMembersMap)
          .sort(
            (a, b) =>
              b.enquiries -
              a.enquiries
          );

      console.log(
        "BD Members:",
        bdMembers
      );

      // ==================================================
      // INVOICES
      // ==================================================

      const currentInvoices =
        invoices.filter((invoice) => {
          const date = parseDate(
            invoice?.billDate
          );

          return isDateInRange(
            date,
            start,
            end
          );
        });

      const previousInvoices =
        invoices.filter((invoice) => {
          const date = parseDate(
            invoice?.billDate
          );

          return isDateInRange(
            date,
            previousStart,
            previousEnd
          );
        });

      // ==================================================
      // FINANCIAL METRICS
      // ==================================================

      const totalInvoices =
        currentInvoices.length;

      const totalBilling =
        currentInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "totalBillAmt"
              )
            );
          },
          0
        );

      const amountReceived =
        currentInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "amountReceived"
              )
            );
          },
          0
        );

      const amountDue =
        currentInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "amountDue"
              )
            );
          },
          0
        );

      const collectionRate =
        totalBilling > 0
          ? (amountReceived /
              totalBilling) *
            100
          : 0;

      // ==================================================
      // PREVIOUS FINANCIAL METRICS
      // ==================================================

      const previousTotalInvoices =
        previousInvoices.length;

      const previousTotalBilling =
        previousInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "totalBillAmt"
              )
            );
          },
          0
        );

      const previousAmountReceived =
        previousInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "amountReceived"
              )
            );
          },
          0
        );

      const previousAmountDue =
        previousInvoices.reduce(
          (total, invoice) => {
            return (
              total +
              getInvoiceAmount(
                invoice,
                "amountDue"
              )
            );
          },
          0
        );

      const previousCollectionRate =
        previousTotalBilling > 0
          ? (previousAmountReceived /
              previousTotalBilling) *
            100
          : 0;

      // ==================================================
      // INVOICE AGEING
      // ==================================================

      const today = new Date();

      const aging = {
        "0-30": 0,
        "31-60": 0,
        "61-90": 0,
        "90+": 0,
      };

      currentInvoices.forEach(
        (invoice) => {
          const due =
            getInvoiceAmount(
              invoice,
              "amountDue"
            );

          const dueDate = parseDate(
            invoice?.dueDate
          );

          if (
            due <= 0 ||
            !dueDate
          ) {
            return;
          }

          const ageInDays =
            Math.floor(
              (today.getTime() -
                dueDate.getTime()) /
                (1000 *
                  60 *
                  60 *
                  24)
            );

          if (ageInDays <= 30) {
            aging["0-30"] += due;
          } else if (
            ageInDays <= 60
          ) {
            aging["31-60"] += due;
          } else if (
            ageInDays <= 90
          ) {
            aging["61-90"] += due;
          } else {
            aging["90+"] += due;
          }
        }
      );

      // ==================================================
      // ATTENTION REQUIRED
      // ==================================================

      const attentionEnquiries =
        currentEnquiries.filter(
          (enquiry) => {
            const status =
              String(
                enquiry?.enquiryStatus ||
                  ""
              ).toLowerCase();

            if (
              status === "closed"
            ) {
              return false;
            }

            const createdDate =
              parseDate(
                enquiry?.created_at
              );

            if (!createdDate) {
              return false;
            }

            const ageInDays =
              Math.floor(
                (today.getTime() -
                  createdDate.getTime()) /
                  (1000 *
                    60 *
                    60 *
                    24)
              );

            return ageInDays >= 30;
          }
        ).length;

      const attentionInvoices =
        currentInvoices.filter(
          (invoice) => {
            const due =
              getInvoiceAmount(
                invoice,
                "amountDue"
              );

            const dueDate =
              parseDate(
                invoice?.dueDate
              );

            if (
              due <= 0 ||
              !dueDate
            ) {
              return false;
            }

            return dueDate < today;
          }
        ).length;

      // ==================================================
      // CONVERSION FUNNEL
      // ==================================================

      const funnel = {
        total: totalEnquiries,
        allocated: allocatedEnquiries,
        closed: closedEnquiries,
      };

      // ==================================================
      // PERIOD COMPARISON
      // ==================================================

      const comparison = {
        clients: {
          total:
            calculatePercentageChange(
              totalClients,
              previousTotalClients
            ),

          active:
            calculatePercentageChange(
              activeClients,
              previousActiveClients
            ),
        },

        enquiries: {
          total:
            calculatePercentageChange(
              totalEnquiries,
              previousTotalEnquiries
            ),

          closed:
            calculatePercentageChange(
              closedEnquiries,
              previousClosedEnquiries
            ),

          closureRate:
            enquiryClosureRate -
            previousClosureRate,
        },

        invoices: {
          total:
            calculatePercentageChange(
              totalInvoices,
              previousTotalInvoices
            ),

          billing:
            calculatePercentageChange(
              totalBilling,
              previousTotalBilling
            ),

          received:
            calculatePercentageChange(
              amountReceived,
              previousAmountReceived
            ),

          due:
            calculatePercentageChange(
              amountDue,
              previousAmountDue
            ),

          collectionRate:
            collectionRate -
            previousCollectionRate,
        },
      };

      // ==================================================
      // FINANCIAL HEALTH
      // ==================================================

      let financialHealth =
        "Healthy";

      if (collectionRate < 50) {
        financialHealth =
          "Needs Attention";
      } else if (
        collectionRate < 75
      ) {
        financialHealth =
          "Moderate";
      }

      if (
        totalBilling > 0 &&
        amountDue === 0
      ) {
        financialHealth =
          "Fully Collected";
      }

      // ==================================================
      // FINAL RESPONSE
      // ==================================================

      res.json({
        success: true,

        period,

        // ------------------------------
        // CLIENTS
        // ------------------------------

        clients: {
          total: totalClients,
          active: activeClients,
          inactive: inactiveClients,
        },

        // ------------------------------
        // ENQUIRIES
        // ------------------------------

        enquiries: {
          total: totalEnquiries,
          closed: closedEnquiries,
          inProgress:
            inProgressEnquiries,
          allocated:
            allocatedEnquiries,
          closureRate:
            enquiryClosureRate,
        },

        // ------------------------------
        // INVOICES
        // ------------------------------

        invoices: {
          total: totalInvoices,
          totalBilling,
          amountReceived,
          amountDue,
          collectionRate,
        },

        // ------------------------------
        // EXISTING CHART
        // ------------------------------

        funnel,

        // ------------------------------
        // NEW / FIXED CHART DATA
        // ------------------------------

        yearlyMembers,

        bdMembers,

        // ------------------------------
        // OTHER DASHBOARD DATA
        // ------------------------------

        financialHealth,

        aging,

        attention: {
          enquiries:
            attentionEnquiries,

          invoices:
            attentionInvoices,

          total:
            attentionEnquiries +
            attentionInvoices,
        },

        comparison,

        previousPeriod: {
          clients: {
            total:
              previousTotalClients,
            active:
              previousActiveClients,
          },

          enquiries: {
            total:
              previousTotalEnquiries,
            closed:
              previousClosedEnquiries,
            closureRate:
              previousClosureRate,
          },

          invoices: {
            total:
              previousTotalInvoices,
            totalBilling:
              previousTotalBilling,
            amountReceived:
              previousAmountReceived,
            amountDue:
              previousAmountDue,
            collectionRate:
              previousCollectionRate,
          },
        },
      });
    } catch (error) {
      console.error(
        "Dashboard Summary Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to generate dashboard summary",
        error: error.message,
      });
    }
  }
);

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(
    `Dashboard backend running on http://localhost:${PORT}`
  );
});