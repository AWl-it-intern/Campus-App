import { useContext } from "react";
import { ToastContext } from "../context/toastContext";

export default function useToast() {
  const context = useContext(ToastContext);
  if (context) return context;

  return {
    show: (message) => window.alert(message),
    success: (message) => window.alert(message),
    error: (message) => window.alert(message),
    info: (message) => window.alert(message),
    warning: (message) => window.alert(message),
  };
}
