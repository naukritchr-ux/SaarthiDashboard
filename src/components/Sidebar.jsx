import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Building2,
  BarChart3,
  Trophy,
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
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
      icon: ClipboardList,
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

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white">

      {/* LOGO */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-md">
            <LayoutDashboard className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Sarthi360
            </h1>

            <p className="text-xs text-slate-400">
              Business Intelligence
            </p>
          </div>

        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() =>
                  setActivePage(item.name)
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />

                <span>{item.name}</span>
              </button>
            );
          })}

        </div>
      </nav>

      {/* BUSINESS INSIGHTS CARD */}
      <div className="m-4 rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-4">

        <button
          onClick={() =>
            setActivePage("Business Insights")
          }
          className="w-full text-left"
        >

          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <BarChart3 className="h-5 w-5 text-violet-500" />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            Business Insights Analytics
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Explore your business performance and discover useful insights.
          </p>

          <p className="mt-3 text-xs font-semibold text-violet-600">
            View Insights →
          </p>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;