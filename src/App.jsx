import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Building2,
  Trophy,
  Menu,
  X,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Enquiries from "./pages/Enquiries";
import Invoices from "./pages/Invoices";
import Franchisees from "./pages/Franchisees";
import BusinessInsights from "./pages/BusinessInsights";
import TopPerformance from "./pages/TopPerformance";

import DateFilter from "./components/DateFilter";

import "./index.css";

function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [selectedPeriod, setSelectedPeriod] =
    useState("all");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =========================================================
     MAIN NAVIGATION
     Business Insights is intentionally NOT included here.
  ========================================================= */

  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Clients",
      icon: Users,
    },
    {
      name: "Enquiries",
      icon: MessageSquare,
    },
    {
      name: "Invoices",
      icon: FileText,
    },
    {
      name: "Franchisees",
      icon: Building2,
    },
    {
      name: "Top Performance",
      icon: Trophy,
    },
  ];

  /* =========================================================
     PAGE CHANGE
  ========================================================= */

  const handlePageChange = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  /* =========================================================
     PAGE RENDER
  ========================================================= */

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <Dashboard
            period={selectedPeriod}
          />
        );

      case "Clients":
        return (
          <Clients
            period={selectedPeriod}
          />
        );

      case "Enquiries":
        return (
          <Enquiries
            period={selectedPeriod}
          />
        );

      case "Invoices":
        return (
          <Invoices
            period={selectedPeriod}
          />
        );

      case "Franchisees":
        return (
          <Franchisees
            period={selectedPeriod}
          />
        );

      case "Business Insights":
        return (
          <BusinessInsights
            period={selectedPeriod}
          />
        );

      case "Top Performance":
        return <TopPerformance />;

      default:
        return (
          <Dashboard
            period={selectedPeriod}
          />
        );
    }
  };

  return (
    <div className="app">
      <div className="app-shell">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className={`sidebar ${
            sidebarOpen ? "open" : ""
          }`}
        >

          {/* BRAND */}

          <div className="sidebar-brand">

            <img
              src="/src/assets/talent-corner-logo.png"
              alt="Talent Corner"
              className="sidebar-logo"
            />

            <div className="sidebar-brand-text">

              <h2 className="sidebar-brand-title">
                Sarthi360
              </h2>

              <p className="sidebar-brand-subtitle">
                Talent Corner HR Services
              </p>

            </div>

          </div>

          {/* =================================================
              MAIN MENU
          ================================================= */}

          <nav className="sidebar-nav">

            <div className="sidebar-section-title">
              Main Menu
            </div>

            {navigationItems.map(
              (item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`nav-item ${
                      activePage ===
                      item.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handlePageChange(
                        item.name
                      )
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                    />

                    <span>
                      {item.name}
                    </span>
                  </button>
                );
              }
            )}

          </nav>

          {/* =================================================
              BUSINESS INSIGHTS SPECIAL CARD
          ================================================= */}

          <div
            style={{
              marginTop: "auto",
              padding: "14px 12px 16px",
            }}
          >

            <button
              type="button"
              onClick={() =>
                handlePageChange(
                  "Business Insights"
                )
              }
              style={{
                width: "100%",
                border:
                  activePage ===
                  "Business Insights"
                    ? "1px solid #cdb9e5"
                    : "1px solid #e4d8ef",

                borderRadius: "14px",

                background:
                  activePage ===
                  "Business Insights"
                    ? "linear-gradient(135deg, #f0e7fa 0%, #ffffff 100%)"
                    : "linear-gradient(135deg, #faf7ff 0%, #ffffff 100%)",

                padding: "13px 12px",

                textAlign: "left",

                cursor: "pointer",

                boxShadow:
                  activePage ===
                  "Business Insights"
                    ? "0 5px 16px rgba(104, 77, 140, 0.10)"
                    : "0 3px 10px rgba(104, 77, 140, 0.06)",

                transition:
                  "all 0.2s ease",
              }}
            >

              {/* ICON + TITLE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >

                <div
                  style={{
                    width: "31px",
                    height: "31px",
                    borderRadius: "9px",
                    background:
                      "#ede5f7",
                    color:
                      "#8065a5",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    flexShrink: 0,
                  }}
                >
                  <BarChart3
                    size={16}
                    strokeWidth={2}
                  />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#684d8c",
                      lineHeight: 1.2,
                    }}
                  >
                    Business Insights
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "7.5px",
                      lineHeight: 1.35,
                      color: "#81768a",
                    }}
                  >
                    Explore your business
                    performance
                  </div>

                </div>

              </div>

              {/* BOTTOM ACTION */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  marginTop: "10px",
                  paddingTop: "8px",
                  borderTop:
                    "1px solid #ebe3f2",
                }}
              >

                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 800,
                    color: "#8065a5",
                  }}
                >
                  View Insights
                </span>

                <ArrowRight
                  size={12}
                  color="#8065a5"
                />

              </div>

            </button>

          </div>

        </aside>

        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            className="sidebar-overlay visible"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* ===================================================
            MAIN AREA
        =================================================== */}

        <main className="main-area">

          {/* HEADER */}

          <header className="top-header">

            <div className="header-left">

              <button
                type="button"
                className="mobile-menu-button"
                onClick={() =>
                  setSidebarOpen(
                    !sidebarOpen
                  )
                }
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>

              <div>

                <h1 className="page-title">
                  {activePage}
                </h1>

                <p className="page-subtitle">
                  Sarthi360 Management Dashboard
                </p>

              </div>

            </div>

            {/* =================================================
                SHARED PERIOD FILTER
                Top Performance does NOT use it.
            ================================================= */}

            {activePage !==
              "Top Performance" && (
              <div className="header-right">

                <DateFilter
                  value={
                    selectedPeriod
                  }
                  onChange={
                    setSelectedPeriod
                  }
                />

              </div>
            )}

          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <section className="page-content">
            {renderPage()}
          </section>

        </main>

      </div>
    </div>
  );
}

export default App;