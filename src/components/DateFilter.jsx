import {
  MONTHS,
  QUARTERS,
  getAvailableYears,
  getPeriodLabel,
  getPeriodDescription,
} from "../utils/dateFilter";

function DateFilter({ value, onChange }) {
  const years = getAvailableYears(2000);

  const parts = value.split(":");
  const type = parts[0];

  const currentYear = new Date().getFullYear();

  const selectedYear =
    type === "month" ||
    type === "quarter" ||
    type === "year"
      ? Number(parts[1])
      : currentYear;

  const selectedMonth =
    type === "month"
      ? Number(parts[2])
      : new Date().getMonth() + 1;

  const selectedQuarter =
    type === "quarter"
      ? parts[2]
      : "Q1";

  const handleTypeChange = (newType) => {
    if (newType === "all") {
      onChange("all");
      return;
    }

    if (newType === "month") {
      onChange(`month:${selectedYear}:1`);
      return;
    }

    if (newType === "quarter") {
      onChange(`quarter:${selectedYear}:Q1`);
      return;
    }

    if (newType === "year") {
      onChange(`year:${selectedYear}`);
    }
  };

  const handleYearChange = (event) => {
    const year = Number(event.target.value);

    if (type === "month") {
      onChange(`month:${year}:${selectedMonth}`);
      return;
    }

    if (type === "quarter") {
      onChange(`quarter:${year}:${selectedQuarter}`);
      return;
    }

    if (type === "year") {
      onChange(`year:${year}`);
    }
  };

  const handleMonthChange = (event) => {
    const month = Number(event.target.value);

    onChange(`month:${selectedYear}:${month}`);
  };

  const handleQuarterChange = (event) => {
    const quarter = event.target.value;

    onChange(`quarter:${selectedYear}:${quarter}`);
  };

  return (
    <div className="period-filter">

      {/* FILTER TYPE */}
      <div className="period-filter-main">

        <div className="period-type-buttons">

          <button
            type="button"
            className={type === "all" ? "active" : ""}
            onClick={() => handleTypeChange("all")}
          >
            All Time
          </button>

          <button
            type="button"
            className={type === "month" ? "active" : ""}
            onClick={() => handleTypeChange("month")}
          >
            Monthly
          </button>

          <button
            type="button"
            className={type === "quarter" ? "active" : ""}
            onClick={() => handleTypeChange("quarter")}
          >
            Quarterly
          </button>

          <button
            type="button"
            className={type === "year" ? "active" : ""}
            onClick={() => handleTypeChange("year")}
          >
            Yearly
          </button>

        </div>

        {/* YEAR / MONTH / QUARTER SELECTORS */}
        {type !== "all" && (
          <div className="period-selectors">

            {/* YEAR */}
            <div className="period-select-group">
              <label>Year</label>

              <select
                value={selectedYear}
                onChange={handleYearChange}
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* MONTH */}
            {type === "month" && (
              <div className="period-select-group">
                <label>Month</label>

                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  {MONTHS.map((month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* QUARTER */}
            {type === "quarter" && (
              <div className="period-select-group">
                <label>Quarter</label>

                <select
                  value={selectedQuarter}
                  onChange={handleQuarterChange}
                >
                  {QUARTERS.map((quarter) => (
                    <option
                      key={quarter.value}
                      value={quarter.value}
                    >
                      {quarter.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        )}

      </div>

      {/* SELECTED PERIOD */}
      <div className="period-selected-info">

        <strong>
          {getPeriodLabel(value)}
        </strong>

        <span>
          {getPeriodDescription(value)}
        </span>

      </div>

    </div>
  );
}

export default DateFilter;
