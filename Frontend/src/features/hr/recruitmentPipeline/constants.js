/**
 * File Type: Feature Constants
 * Input Type: None
 * Output Type:
 * {
 *   FLOW_STAGE_OPTIONS: string[],
 *   PIPELINE_VIEWS: Record<string, string>,
 *   PIPELINE_NAV_ITEMS: { key: string, label: string }[],
 *   PIPELINE_VIEW_HEADERS: Record<string, { title: string, subtitle: string }>
 * }
 */
export const FLOW_STAGE_OPTIONS = ["Aptitude Test", "GD Round", "PI Round", "Final Selection"];

export const PIPELINE_VIEWS = {
  HOME: "home",
  BUILDER: "custom-flow-builder",
  LIST: "flow-list",
};

export const PIPELINE_NAV_ITEMS = [
  { key: PIPELINE_VIEWS.HOME, label: "Home" },
  { key: PIPELINE_VIEWS.BUILDER, label: "Custom Flow Builder" },
  { key: PIPELINE_VIEWS.LIST, label: "Flows Assigned to Jobs" },
];

export const PIPELINE_VIEW_HEADERS = {
  [PIPELINE_VIEWS.HOME]: {
    title: "Recruitment Pipeline",
    subtitle: "Monitor pipeline configuration health across drives, jobs, and custom flows.",
  },
  [PIPELINE_VIEWS.BUILDER]: {
    title: "Custom Flow Builder",
    subtitle: "Build and assign custom interview flow templates by drive and job.",
  },
  [PIPELINE_VIEWS.LIST]: {
    title: "Flows Assigned to Jobs",
    subtitle: "Track saved flow templates mapped to each job with Job ID visibility.",
  },
};
