const BASE_URL = "https://api.sarthi360.in/api";

async function getData(endpoint) {
  const url = `${BASE_URL}/${endpoint}`;

  console.log("API REQUEST:", url);

  try {
    const response = await fetch(url);

    console.log(
      "API RESPONSE:",
      endpoint,
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(
        `${endpoint} API returned ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(
      "API DATA:",
      endpoint,
      Array.isArray(data)
        ? `${data.length} records`
        : "object received"
    );

    return data;
  } catch (error) {
    console.error(
      `API ERROR [${endpoint}]:`,
      error.message
    );

    throw error;
  }
}

async function fetchClients() {
  return await getData("clients_info");
}

async function fetchEnquiries() {
  return await getData("enquiries");
}

async function fetchInvoices() {
  return await getData("Invoice");
}

module.exports = {
  fetchClients,
  fetchEnquiries,
  fetchInvoices,
};