import { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContext } from "../../context/toastContext";

const DEFAULT_TIMEOUT = 4200;
const EXIT_ANIMATION_MS = 300;

let toastCounter = 0;

const nextToastId = () => {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
};

const inferToastType = (value) => {
  const message = String(value || "").toLowerCase();

  if (
    /(fail|error|invalid|unable|missing|cannot|can't|denied|not found|no valid)/.test(message)
  ) {
    return "error";
  }

  if (/(success|created|updated|deleted|scheduled|imported|submitted)/.test(message)) {
    return "success";
  }

  if (/(warning|please|required|already exists|fill)/.test(message)) {
    return "warning";
  }

  return "info";
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((toastId) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== toastId));
  }, []);

  const markLeaving = useCallback((toastId) => {
    setToasts((previous) =>
      previous.map((toast) =>
        toast.id === toastId
          ? {
              ...toast,
              leaving: true,
            }
          : toast,
      ),
    );
  }, []);

  const dismissToast = useCallback(
    (toastId) => {
      markLeaving(toastId);
      window.setTimeout(() => {
        removeToast(toastId);
      }, EXIT_ANIMATION_MS);
    },
    [markLeaving, removeToast],
  );

  const scheduleToastLifecycle = useCallback(
    (toastId, timeout) => {
      window.setTimeout(() => {
        dismissToast(toastId);
      }, timeout);
    },
    [dismissToast],
  );

  const showToast = useCallback(
    (message, options = {}) => {
      const text = String(message ?? "").trim();
      if (!text) return;

      const timeout =
        Number.isFinite(options.timeout) && options.timeout > 0
          ? Number(options.timeout)
          : DEFAULT_TIMEOUT;
      const type = options.type || inferToastType(text);
      const toastId = nextToastId();

      setToasts((previous) => [
        ...previous,
        {
          id: toastId,
          message: text,
          type,
          timeout,
          leaving: false,
        },
      ]);

      scheduleToastLifecycle(toastId, timeout);
    },
    [scheduleToastLifecycle],
  );

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message) => {
      showToast(message, { type: inferToastType(message) });
    };

    return () => {
      window.alert = nativeAlert;
    };
  }, [showToast]);

  const value = useMemo(
    () => ({
      show: (message, options) => showToast(message, options),
      success: (message, options = {}) => showToast(message, { ...options, type: "success" }),
      error: (message, options = {}) => showToast(message, { ...options, type: "error" }),
      info: (message, options = {}) => showToast(message, { ...options, type: "info" }),
      warning: (message, options = {}) => showToast(message, { ...options, type: "warning" }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type} ${toast.leaving ? "toast-leave" : "toast-enter"}`}
            role="status"
          >
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
            >
              x
            </button>
            <div
              className="toast-progress"
              style={{ animationDuration: `${toast.timeout}ms` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
