/**
 * File Type: Feature Constants
 * Input Type: None
 * Output Type: Aptitude views/navigation/storage keys
 */
export const APTITUDE_VIEWS = {
  HOME: "home",
  DISPATCH: "aptitude-dispatch",
  LIST: "aptitude-list",
};

export const APTITUDE_NAV_ITEMS = [
  { key: APTITUDE_VIEWS.HOME, label: "Home" },
  { key: APTITUDE_VIEWS.DISPATCH, label: "Aptitude Dispatch" },
  { key: APTITUDE_VIEWS.LIST, label: "List of Aptitude" },
];

export const APTITUDE_VIEW_HEADERS = {
  [APTITUDE_VIEWS.HOME]: {
    title: "Aptitude Test Management",
    subtitle: "Monitor aptitude activity with custom IDs for fast tracking.",
  },
  [APTITUDE_VIEWS.DISPATCH]: {
    title: "Aptitude Dispatch",
    subtitle: "Select drive/job, choose candidates, and dispatch aptitude links.",
  },
  [APTITUDE_VIEWS.LIST]: {
    title: "List of Aptitude",
    subtitle: "Track active aptitude dispatch records by custom Aptitude ID.",
  },
};

export const APTITUDE_LOG_STORAGE_KEY = "aptitude_dispatch_log_v1";
export const APTITUDE_COUNTER_STORAGE_KEY = "aptitude_dispatch_counter_v1";
