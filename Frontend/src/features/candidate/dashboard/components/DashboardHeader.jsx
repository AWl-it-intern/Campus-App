import { LogOut } from "lucide-react";
import NotificationsMenu from "./NotificationsMenu";

export default function DashboardHeader({
  logoSrc,
  unreadCount,
  notifications,
  isNotificationsOpen,
  notificationsRef,
  onToggleNotifications,
  onCloseNotifications,
  onLogout,
  getNotificationAccent,
}) {
  return (
    <header className="border-b border-[#D6D6DC] bg-white">
      <div className="mx-auto flex h-16 max-w-325 items-center justify-between px-4 sm:px-6">
        <img src={logoSrc} alt="AWL logo" className="h-10 w-auto" />

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationsMenu
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={isNotificationsOpen}
            onToggle={onToggleNotifications}
            onClose={onCloseNotifications}
            containerRef={notificationsRef}
            getNotificationAccent={getNotificationAccent}
          />

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full p-2 text-[#111827] transition hover:bg-[#F3F4F6]"
            aria-label="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
