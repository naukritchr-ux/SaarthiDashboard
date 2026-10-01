const {
  fetchClients,
  fetchEnquiries,
  fetchInvoices,
} = require("./apiService.cjs");

const {
  parseDate,
  getPeriodRange,
  isDateInRange,
} = require("../utils/periodUtils.cjs");

function toArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  if (data && typeof data === "object") {
    const possibleArray = Object.values(data).find(
      (value) => Array.isArray(value)
    );

    if (possibleArray) {
      return possibleArray;
    }
  }

  return [];
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const cleaned = String(value)
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  if (!cleaned) {
    return 0;
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function percentageChange(current, previous) {
  if (!previous) {
    if (current > 0) {
      return 100;
    }

    return 0;
  }

  return Number(
    (((current - previous) / Math.abs(previous)) * 100).toFixed(2)
  );
}

function percentagePointChange(current, previous) {
  return Number((current - previous).toFixed(2));
}

function getClientDate(client) {
  return (
    client.dateClientAcquired ||
    client.dateOfClientAllocation ||
    client.created_at ||
    client.createdAt ||
    client.createdDate ||
    null
  );
}

function getEnquiryDate(enquiry) {
  return (
    enquiry.created_at ||
    enquiry.createdAt ||
    enquiry.createdDate ||
    null
  );
}

function getInvoiceDate(invoice) {
  return (
    invoice.billDate ||
    invoice.bill_date ||
    invoice.created_at ||
    invoice.createdAt ||
    null
  );
}

function getInvoiceAmount(invoice, fieldNames) {
  for (const field of fieldNames) {
    if (
      invoice[field] !== undefined &&
      invoice[field] !== null &&
      invoice[field] !== ""
    ) {
      return toNumber(invoice[field]);
    }
  }

  return 0;
}

function getEnquiryStatus(enquiry) {
  return normalizeText(
    enquiry.enquiryStatus ||
      enquiry.enquiry_status ||
      enquiry.status ||
      ""
  );
}

function getBdMember(enquiry) {
  return (
    enquiry.bdMemberName ||
    enquiry.bd_member_name ||
    enquiry.bdMember ||
    enquiry.bd_member ||
    enquiry.bdMembersName ||
    "Unknown"
  );
}

function isClosedEnquiry(enquiry) {
  return getEnquiryStatus(enquiry) === "closed";
}

function isAllocatedEnquiry(enquiry) {
  return Boolean(
    enquiry.dateOfAllocation ||
      enquiry.date_of_allocation ||
      enquiry.allocationDate ||
      enquiry.dateAllocated
  );
}

function calculateClientMetrics(clients, start, end) {
  const filtered = clients.filter((client) =>
    isDateInRange(getClientDate(client), start, end)
  );

  const active = filtered.filter(
    (client) => normalizeText(client.status) === "active"
  );

  return {
    total: filtered.length,
    active: active.length,
    inactive: filtered.length - active.length,
  };
}

function calculateEnquiryMetrics(enquiries, start, end) {
  const filtered = enquiries.filter((enquiry) =>
    isDateInRange(getEnquiryDate(enquiry), start, end)
  );

  const closed = filtered.filter(isClosedEnquiry).length;

  const inProgress = filtered.filter(
    (enquiry) => getEnquiryStatus(enquiry) === "inprogress"
  ).length;

  const allocated = filtered.filter(isAllocatedEnquiry).length;

  const closureRate =
    filtered.length > 0
      ? Number(((closed / filtered.length) * 100).toFixed(2))
      : 0;

  return {
    total: filtered.length,
    closed,
    inProgress,
    allocated,
    closureRate,
  };
}

function calculateInvoiceMetrics(invoices, start, end) {
  const filtered = invoices.filter((invoice) =>
    isDateInRange(getInvoiceDate(invoice), start, end)
  );

  let totalBilling = 0;
  let amountReceived = 0;
  let amountDue = 0;

  filtered.forEach((invoice) => {
    totalBilling += getInvoiceAmount(invoice, [
      "totalBillAmt",
      "totalBillAmount",
      "totalAmount",
      "billAmount",
      "invoiceAmount",
    ]);

    amountReceived += getInvoiceAmount(invoice, [
      "amountReceived",
      "receivedAmount",
      "paidAmount",
      "amountPaid",
    ]);

    amountDue += getInvoiceAmount(invoice, [
      "amountDue",
      "dueAmount",
      "outstandingAmount",
    ]);
  });

  const collectionRate =
    totalBilling > 0
      ? Number(((amountReceived / totalBilling) * 100).toFixed(2))
      : 0;

  return {
    total: filtered.length,
    totalBilling: Number(totalBilling.toFixed(2)),
    amountReceived: Number(amountReceived.toFixed(2)),
    amountDue: Number(amountDue.toFixed(2)),
    collectionRate,
    records: filtered,
  };
}

function buildYearlyMembers(clients) {
  const yearly = {};

  clients.forEach((client) => {
    const date = parseDate(client.created_at);

    if (!date) {
      return;
    }

    const year = date.getFullYear();

    yearly[year] = (yearly[year] || 0) + 1;
  });

  return Object.entries(yearly)
    .map(([year, count]) => ({
      year: Number(year),
      count,
    }))
    .sort((a, b) => a.year - b.year);
}

function buildBdMembers(enquiries, start, end) {
  const filtered = enquiries.filter((enquiry) =>
    isDateInRange(getEnquiryDate(enquiry), start, end)
  );

  const members = {};

  filtered.forEach((enquiry) => {
    const name = getBdMember(enquiry);

    if (!members[name]) {
      members[name] = {
        name,
        enquiries: 0,
        closed: 0,
      };
    }

    members[name].enquiries += 1;

    if (isClosedEnquiry(enquiry)) {
      members[name].closed += 1;
    }
  });

  return Object.values(members)
    .map((member) => ({
      ...member,
      closureRate:
        member.enquiries > 0
          ? Number(
              ((member.closed / member.enquiries) * 100).toFixed(2)
            )
          : 0,
    }))
    .sort((a, b) => b.enquiries - a.enquiries);
}

function buildAging(invoices, start, end) {
  const filtered = invoices.filter((invoice) =>
    isDateInRange(getInvoiceDate(invoice), start, end)
  );

  const aging = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  const today = new Date();

  filtered.forEach((invoice) => {
    const amountDue = getInvoiceAmount(invoice, [
      "amountDue",
      "dueAmount",
      "outstandingAmount",
    ]);

    if (amountDue <= 0) {
      return;
    }

    const dueDate = parseDate(
      invoice.dueDate ||
        invoice.due_date ||
        invoice.paymentDueDate
    );

    if (!dueDate) {
      return;
    }

    const difference =
      Math.floor(
        (today.getTime() - dueDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (difference <= 30) {
      aging["0-30"] += amountDue;
    } else if (difference <= 60) {
      aging["31-60"] += amountDue;
    } else if (difference <= 90) {
      aging["61-90"] += amountDue;
    } else {
      aging["90+"] += amountDue;
    }
  });

  return Object.entries(aging).map(([bucket, amount]) => ({
    bucket,
    amount: Number(amount.toFixed(2)),
  }));
}

function buildAttention(enquiries, invoices, start, end) {
  const today = new Date();

  const filteredEnquiries = enquiries.filter((enquiry) =>
    isDateInRange(getEnquiryDate(enquiry), start, end)
  );

  const attentionEnquiries = filteredEnquiries.filter((enquiry) => {
    if (isClosedEnquiry(enquiry)) {
      return false;
    }

    const createdDate = parseDate(getEnquiryDate(enquiry));

    if (!createdDate) {
      return false;
    }

    const age =
      Math.floor(
        (today.getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    return age >= 30;
  });

  const filteredInvoices = invoices.filter((invoice) =>
    isDateInRange(getInvoiceDate(invoice), start, end)
  );

  const attentionInvoices = filteredInvoices.filter((invoice) => {
    const amountDue = getInvoiceAmount(invoice, [
      "amountDue",
      "dueAmount",
      "outstandingAmount",
    ]);

    const dueDate = parseDate(
      invoice.dueDate ||
        invoice.due_date ||
        invoice.paymentDueDate
    );

    return (
      amountDue > 0 &&
      dueDate &&
      dueDate < today
    );
  });

  return {
    enquiries: attentionEnquiries.length,
    invoices: attentionInvoices.length,
    total:
      attentionEnquiries.length +
      attentionInvoices.length,
  };
}

function getFinancialHealth(invoiceMetrics) {
  const {
    totalBilling,
    amountDue,
    collectionRate,
  } = invoiceMetrics;

  if (totalBilling > 0 && amountDue === 0) {
    return "Fully Collected";
  }

  if (collectionRate < 50) {
    return "Needs Attention";
  }

  if (collectionRate < 75) {
    return "Moderate";
  }

  return "Healthy";
}

function buildComparison(current, previous) {
  return {
    clients: {
      total: percentageChange(
        current.clients.total,
        previous.clients.total
      ),
      active: percentageChange(
        current.clients.active,
        previous.clients.active
      ),
    },

    enquiries: {
      total: percentageChange(
        current.enquiries.total,
        previous.enquiries.total
      ),
      closed: percentageChange(
        current.enquiries.closed,
        previous.enquiries.closed
      ),
      closureRate: percentagePointChange(
        current.enquiries.closureRate,
        previous.enquiries.closureRate
      ),
    },

    invoices: {
      total: percentageChange(
        current.invoices.total,
        previous.invoices.total
      ),
      totalBilling: percentageChange(
        current.invoices.totalBilling,
        previous.invoices.totalBilling
      ),
      amountReceived: percentageChange(
        current.invoices.amountReceived,
        previous.invoices.amountReceived
      ),
      amountDue: percentageChange(
        current.invoices.amountDue,
        previous.invoices.amountDue
      ),
      collectionRate: percentagePointChange(
        current.invoices.collectionRate,
        previous.invoices.collectionRate
      ),
    },
  };
}

async function getDashboardSummary(period = "all") {
  const [clientsResponse, enquiriesResponse, invoicesResponse] =
    await Promise.all([
      fetchClients(),
      fetchEnquiries(),
      fetchInvoices(),
    ]);

  const clients = toArray(clientsResponse);
  const enquiries = toArray(enquiriesResponse);
  const invoices = toArray(invoicesResponse);

  const {
    start,
    end,
    previousStart,
    previousEnd,
  } = getPeriodRange(period);

  const currentClients = calculateClientMetrics(
    clients,
    start,
    end
  );

  const currentEnquiries = calculateEnquiryMetrics(
    enquiries,
    start,
    end
  );

  const currentInvoices = calculateInvoiceMetrics(
    invoices,
    start,
    end
  );

  let previousClients;
  let previousEnquiries;
  let previousInvoices;

  if (previousStart && previousEnd) {
    previousClients = calculateClientMetrics(
      clients,
      previousStart,
      previousEnd
    );

    previousEnquiries = calculateEnquiryMetrics(
      enquiries,
      previousStart,
      previousEnd
    );

    previousInvoices = calculateInvoiceMetrics(
      invoices,
      previousStart,
      previousEnd
    );
  } else {
    previousClients = {
      total: 0,
      active: 0,
      inactive: 0,
    };

    previousEnquiries = {
      total: 0,
      closed: 0,
      inProgress: 0,
      allocated: 0,
      closureRate: 0,
    };

    previousInvoices = {
      total: 0,
      totalBilling: 0,
      amountReceived: 0,
      amountDue: 0,
      collectionRate: 0,
      records: [],
    };
  }

  const funnel = {
    total: currentEnquiries.total,
    allocated: currentEnquiries.allocated,
    closed: currentEnquiries.closed,
  };

  return {
    success: true,

    period,

    clients: {
      total: currentClients.total,
      active: currentClients.active,
      inactive: currentClients.inactive,
    },

    enquiries: {
      total: currentEnquiries.total,
      closed: currentEnquiries.closed,
      inProgress: currentEnquiries.inProgress,
      allocated: currentEnquiries.allocated,
      closureRate: currentEnquiries.closureRate,
    },

    invoices: {
      total: currentInvoices.total,
      totalBilling: currentInvoices.totalBilling,
      amountReceived: currentInvoices.amountReceived,
      amountDue: currentInvoices.amountDue,
      collectionRate: currentInvoices.collectionRate,
    },

    funnel,

    yearlyMembers: buildYearlyMembers(clients),

    bdMembers: buildBdMembers(
      enquiries,
      start,
      end
    ),

    financialHealth: getFinancialHealth(
      currentInvoices
    ),

    aging: buildAging(
      invoices,
      start,
      end
    ),

    attention: buildAttention(
      enquiries,
      invoices,
      start,
      end
    ),

    comparison: buildComparison(
      {
        clients: currentClients,
        enquiries: currentEnquiries,
        invoices: currentInvoices,
      },
      {
        clients: previousClients,
        enquiries: previousEnquiries,
        invoices: previousInvoices,
      }
    ),

    previousPeriod: {
      clients: {
        total: previousClients.total,
        active: previousClients.active,
      },

      enquiries: {
        total: previousEnquiries.total,
        closed: previousEnquiries.closed,
        closureRate: previousEnquiries.closureRate,
      },

      invoices: {
        total: previousInvoices.total,
        totalBilling: previousInvoices.totalBilling,
        amountReceived: previousInvoices.amountReceived,
        amountDue: previousInvoices.amountDue,
        collectionRate: previousInvoices.collectionRate,
      },
    },
  };
}

module.exports = {
  getDashboardSummary,
};