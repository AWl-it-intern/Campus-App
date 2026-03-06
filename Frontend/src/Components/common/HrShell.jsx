import { Menu, Users } from "lucide-react";
import { useState } from "react";

import HrSlideDrawer from "./HrSlideDrawer";
import HR_COLORS from "../../theme/hrPalette";

export default function HrShell({
  title,
  subtitle,
  headerActions = null,
  topNav = null,
  children,
}) {
  const colors = HR_COLORS;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <HrSlideDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <header className="sticky top-0 z-30 shadow-md" style={{ backgroundColor: colors.stonewash }}>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.softFlow }}
              >
                <Users size={20} color={colors.stonewash} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">AWL Recruit</h1>
                <p className="text-xs sm:text-sm text-white/80">HR Dashboard</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {topNav ? topNav : null}

      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-[1500px] mx-auto">
          <main className="min-w-0">
            <header className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.stonewash }}>
                    {title}
                  </h2>
                  {subtitle ? <p className="text-gray-600 mt-2">{subtitle}</p> : null}
                </div>
                {headerActions ? (
                  <div className="flex items-center gap-2 flex-wrap">{headerActions}</div>
                ) : null}
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
