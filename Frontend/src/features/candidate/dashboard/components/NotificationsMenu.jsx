import { Bell } from "lucide-react";

export default function NotificationsMenu({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  containerRef,
  getNotificationAccent,
}) {
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full p-2 text-[#111827] transition hover:bg-[#F3F4F6]"
        aria-label="View notifications"
      >
        <Bell size={19} />
        <span className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B3B] px-1 text-[11px] font-semibold text-white">
          {unreadCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[310px] rounded-2xl border border-[#D6D6DC] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:w-90">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#001F3F]">Notifications</h4>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs font-medium text-[#475467] hover:bg-[#F2F4F7]"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={`${notification.type}-${notification.message}`}
                className={`rounded-xl border px-3 py-2 ${getNotificationAccent(
                  notification.type,
                )}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{notification.type}</p>
                  {notification.unread && (
                    <span className="rounded-full bg-[#FF3B3B] px-2 py-0.5 text-[10px] font-semibold text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-5">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
