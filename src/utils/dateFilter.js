const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const QUARTERS = [
  { value: "Q1", label: "Q1 — Jan to Mar" },
  { value: "Q2", label: "Q2 — Apr to Jun" },
  { value: "Q3", label: "Q3 — Jul to Sep" },
  { value: "Q4", label: "Q4 — Oct to Dec" },
];

/*
  Keep a wide range of years available.
  This prevents the filter from being restricted to only
  the recent years such as 2022–2026.
*/
function getAvailableYears(startYear = 2000) {
  const currentYear = new Date().getFullYear();

  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getPeriodRange(period) {
  const now = new Date();

  if (!period || period === "all") {
    return {
      startDate: null,
      endDate: null,
    };
  }

  const parts = period.split(":");
  const type = parts[0];

  if (type === "month") {
    const year = Number(parts[1]);
    const month = Number(parts[2]);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return {
      startDate,
      endDate,
    };
  }

  if (type === "quarter") {
    const year = Number(parts[1]);
    const quarter = parts[2];

    const quarterNumber = Number(quarter.replace("Q", ""));

    const startMonth = (quarterNumber - 1) * 3;

    const startDate = new Date(year, startMonth, 1);

    const endDate = new Date(
      year,
      startMonth + 3,
      0,
      23,
      59,
      59,
      999
    );

    return {
      startDate,
      endDate,
    };
  }

  if (type === "year") {
    const year = Number(parts[1]);

    const startDate = new Date(year, 0, 1);

    const endDate = new Date(
      year,
      11,
      31,
      23,
      59,
      59,
      999
    );

    return {
      startDate,
      endDate,
    };
  }

  return {
    startDate: null,
    endDate: null,
  };
}

function getPeriodLabel(period) {
  if (!period || period === "all") {
    return "All Time";
  }

  const parts = period.split(":");
  const type = parts[0];

  if (type === "month") {
    const year = Number(parts[1]);
    const month = Number(parts[2]);

    const monthName =
      MONTHS.find((item) => item.value === month)?.label || "";

    return `${monthName} ${year}`;
  }

  if (type === "quarter") {
    const year = Number(parts[1]);
    const quarter = parts[2];

    return `${quarter} ${year}`;
  }

  if (type === "year") {
    return `${parts[1]}`;
  }

  return "All Time";
}

function getPeriodDescription(period) {
  const { startDate, endDate } = getPeriodRange(period);

  if (!startDate || !endDate) {
    return "Showing data for all available periods";
  }

  const formatDate = (date) => {
    return `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;
  };

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export {
  MONTHS,
  QUARTERS,
  getAvailableYears,
  getPeriodRange,
  getPeriodLabel,
  getPeriodDescription,
};