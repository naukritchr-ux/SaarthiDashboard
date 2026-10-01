function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  // Handle DD/MM/YYYY
  const indianDate = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (indianDate) {
    const day = Number(indianDate[1]);
    const month = Number(indianDate[2]) - 1;
    const year = Number(indianDate[3]);

    const date = new Date(year, month, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Handle DD-MM-YYYY
  const dashDate = text.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  );

  if (dashDate) {
    const day = Number(dashDate[1]);
    const month = Number(dashDate[2]) - 1;
    const year = Number(dashDate[3]);

    const date = new Date(year, month, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getPeriodRange(period = "all", now = new Date()) {
  const currentDate = new Date(now);

  if (!period || period === "all") {
    return {
      start: null,
      end: null,
      previousStart: null,
      previousEnd: null,
    };
  }

  // Monthly
  if (period.startsWith("month:")) {
    const parts = period.split(":");

    const year = Number(parts[1]);
    const month = Number(parts[2]);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return {
        start: null,
        end: null,
        previousStart: null,
        previousEnd: null,
      };
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const previousStart = new Date(year, month - 2, 1);
    const previousEnd = new Date(year, month - 1, 0);

    return {
      start: startOfDay(start),
      end: endOfDay(end),
      previousStart: startOfDay(previousStart),
      previousEnd: endOfDay(previousEnd),
    };
  }

  // Quarterly
  if (period.startsWith("quarter:")) {
    const parts = period.split(":");

    const year = Number(parts[1]);
    const quarter = Number(
      String(parts[2]).replace("Q", "")
    );

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(quarter) ||
      quarter < 1 ||
      quarter > 4
    ) {
      return {
        start: null,
        end: null,
        previousStart: null,
        previousEnd: null,
      };
    }

    const startMonth = (quarter - 1) * 3;

    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0);

    let previousYear = year;
    let previousQuarter = quarter - 1;

    if (previousQuarter === 0) {
      previousQuarter = 4;
      previousYear -= 1;
    }

    const previousStartMonth =
      (previousQuarter - 1) * 3;

    const previousStart = new Date(
      previousYear,
      previousStartMonth,
      1
    );

    const previousEnd = new Date(
      previousYear,
      previousStartMonth + 3,
      0
    );

    return {
      start: startOfDay(start),
      end: endOfDay(end),
      previousStart: startOfDay(previousStart),
      previousEnd: endOfDay(previousEnd),
    };
  }

  // Yearly
  if (period.startsWith("year:")) {
    const year = Number(period.split(":")[1]);

    if (!Number.isInteger(year)) {
      return {
        start: null,
        end: null,
        previousStart: null,
        previousEnd: null,
      };
    }

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const previousStart = new Date(year - 1, 0, 1);
    const previousEnd = new Date(year - 1, 11, 31);

    return {
      start: startOfDay(start),
      end: endOfDay(end),
      previousStart: startOfDay(previousStart),
      previousEnd: endOfDay(previousEnd),
    };
  }

  return {
    start: null,
    end: null,
    previousStart: null,
    previousEnd: null,
  };
}

function isDateInRange(dateValue, start, end) {
  const date = parseDate(dateValue);

  if (!date) {
    return false;
  }

  if (start && date < start) {
    return false;
  }

  if (end && date > end) {
    return false;
  }

  return true;
}

module.exports = {
  startOfDay,
  endOfDay,
  parseDate,
  getPeriodRange,
  isDateInRange,
};