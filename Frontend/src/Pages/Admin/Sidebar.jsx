// import React from "react"; 
// import { NavLink } from "react-router-dom"; // Optional if you want active states

const Sidebar = () => {
  return (
    <div className="drawer-side">
      <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

      <aside className="w-72 min-h-full bg-[#003329] text-[#E6FFF6] shadow-xl">
        {/* Header */}
        <div className="p-5 text-2xl font-bold border-b border-[#00988D]/40 flex items-center gap-2">
          <span>HR Pannel</span>
        </div>

        {/* Menu */}
        <ul className="menu p-4 gap-3">
          <li>
            <a
              href="/Admin/dashboard/Create-Users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                         hover:bg-[#00988D] hover:text-white
                         active:scale-[0.98]"
            >
              <span className="text-lg">👤</span>
              <span className="font-medium">User Management</span>
            </a>
          </li>

          <li>
            <a
              href="/Admin/dashboard/Create-job"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                         hover:bg-[#00988D] hover:text-white
                         active:scale-[0.98]"
            >
              <span className="text-lg">💼</span>
              <span className="font-medium">Job Management</span>
            </a>
          </li>
        </ul>

        {/* Footer / Accent */}
        <div className="mt-auto p-4 text-sm text-[#66D095]/80">
          <div className="h-1 w-full rounded-full bg-linear-to-r from-[#66D095] to-[#00988D] mb-3"></div>
          AWL Agri Business Ltd 
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
