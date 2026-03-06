import {
  Award,
  BarChart3,
  Briefcase,
  Link2,
  LogOut,
  MapPin,
  TrendingUp,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import HR_COLORS from "../../theme/hrPalette";

const MAIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/HR/dashboard",
    icon: TrendingUp,
    activePrefixes: ["/HR/dashboard"],
    exact: true,
  },
  {
    label: "Drive Management",
    path: "/HR/dashboard/Drives",
    icon: MapPin,
    activePrefixes: ["/HR/dashboard/Drives", "/HR/dashboard/drive/"],
  },
  {
    label: "Create Jobs",
    path: "/HR/dashboard/Create-Job",
    icon: Briefcase,
    activePrefixes: ["/HR/dashboard/Create-Job"],
  },
  {
    label: "Candidate Management",
    path: "/HR/dashboard/Create-Users",
    icon: Users,
    activePrefixes: ["/HR/dashboard/Create-Users"],
  },
  {
    label: "Panelist Management",
    path: "/HR/dashboard/Manage-Panelists",
    icon: UsersRound,
    activePrefixes: ["/HR/dashboard/Manage-Panelists"],
  },
];

const FLOW_NAV_ITEMS = [
  {
    label: "Recruitment Pipeline",
    path: "/HR/dashboard/Recruitment-Pipeline",
    icon: Award,
    activePrefixes: ["/HR/dashboard/Recruitment-Pipeline"],
  },
  {
    label: "Aptitude Tests",
    path: "/HR/dashboard/Aptitude-Test-Management",
    icon: Link2,
    activePrefixes: ["/HR/dashboard/Aptitude-Test-Management"],
  },
  {
    label: "Offer Approvals",
    path: "/HR/dashboard/Offer-Approvals",
    icon: Briefcase,
    activePrefixes: ["/HR/dashboard/Offer-Approvals"],
  },
  {
    label: "Candidate Scoreboard",
    path: "/HR/dashboard/Drive-Job-Scoreboard",
    icon: BarChart3,
    activePrefixes: ["/HR/dashboard/Drive-Job-Scoreboard"],
  },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.path;
  return (item.activePrefixes || []).some((prefix) => pathname.startsWith(prefix));
}

function DrawerSection({ title, items, pathname, onNavigate, colors }) {
  return (
    <section>
      <p className="px-3 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-500">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={active ? { backgroundColor: colors.stonewash } : undefined}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function HrSlideDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const colors = HR_COLORS;

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_auth");
    localStorage.removeItem("hr_email");
    navigate("/login");
    onClose?.();
  };

  return (
    <>
      <button
        aria-label="Close navigation overlay"
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-screen w-[320px] max-w-[90vw] z-50 bg-white border-r border-gray-200 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-gray-100" style={{ backgroundColor: `${colors.softFlow}22` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500 mb-1">
                Navigation
              </p>
              <h2 className="text-xl font-bold" style={{ color: colors.stonewash }}>
                AWL Recruit
              </h2>
              <p className="text-sm text-gray-600 mt-1">Hiring operations menu</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-all flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <DrawerSection
            title="Core Navigation"
            items={MAIN_NAV_ITEMS}
            pathname={location.pathname}
            onNavigate={handleNavigate}
            colors={colors}
          />
          <DrawerSection
            title="Process & Decisions"
            items={FLOW_NAV_ITEMS}
            pathname={location.pathname}
            onNavigate={handleNavigate}
            colors={colors}
          />
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
