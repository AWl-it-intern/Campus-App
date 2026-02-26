import { Bell, FileText } from "lucide-react";

export default function ActionButtons({ onViewApplication, onViewNotifications }) {
  return (
    <div className="mt-6 space-y-2">
      <button
        type="button"
        onClick={onViewApplication}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B8A8C] px-4 text-[16px] font-semibold text-white transition hover:bg-[#087578]"
      >
        <FileText size={16} />
        View Application
      </button>

      <button
        type="button"
        onClick={onViewNotifications}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0B8A8C] bg-transparent px-4 text-[16px] font-semibold text-[#0B8A8C] transition hover:bg-[#E8F5F5]"
      >
        <Bell size={16} />
        View All Notifications
      </button>
    </div>
  );
}
