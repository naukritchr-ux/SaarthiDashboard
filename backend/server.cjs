const express = require("express");
const cors = require("cors");

const {
  fetchClients,
  fetchEnquiries,
  fetchInvoices,
} = require("./services/apiService.cjs");

const {
  getDashboardSummary,
} = require("./services/summaryService.cjs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sarthi360 backend is running",
  });
});

app.get("/api/dashboard/clients", async (req, res) => {
  try {
    const data = await fetchClients();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("CLIENTS ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch clients data",
      error: error.message,
    });
  }
});

app.get("/api/dashboard/enquiries", async (req, res) => {
  try {
    const data = await fetchEnquiries();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ENQUIRIES ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries data",
      error: error.message,
    });
  }
});

app.get("/api/dashboard/invoices", async (req, res) => {
  try {
    const data = await fetchInvoices();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("INVOICES ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices data",
      error: error.message,
    });
  }
});

app.get("/api/dashboard/summary", async (req, res) => {
  try {
    const period = req.query.period || "all";

    console.log("SUMMARY REQUEST PERIOD:", period);

    const summary = await getDashboardSummary(period);

    res.json(summary);
  } catch (error) {
    console.error("SUMMARY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate dashboard summary",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Sarthi360 backend running on http://localhost:${PORT}`
  );
});