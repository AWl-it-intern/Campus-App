export const FLOW_TEMPLATE_STORAGE_KEY = "recruitment_flow_templates_v1";

const FLOW_JOB_WILDCARD = "*";

const safeText = (value) => String(value || "").trim();

const safeLower = (value) => safeText(value).toLowerCase();

const toTemplateKey = (driveRef, jobName) =>
  `${safeLower(driveRef) || FLOW_JOB_WILDCARD}::${safeLower(jobName)}`;

const splitTemplateKey = (key) => {
  const [driveRefPart = "", jobNamePart = ""] = String(key || "").split("::");
  return {
    driveRef: safeLower(driveRefPart),
    jobName: safeLower(jobNamePart),
  };
};

const getStorage = () =>
  typeof window !== "undefined" ? window.localStorage : null;

function normalizeStages(stages = []) {
  return Array.from(
    new Set(
      (stages || [])
        .map((stage) => safeText(stage))
        .filter(Boolean),
    ),
  );
}

export function readRecruitmentFlowTemplates() {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(FLOW_TEMPLATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeRecruitmentFlowTemplates(templates = {}) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(FLOW_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

export function upsertRecruitmentFlowTemplate({
  driveRef,
  driveLabel,
  jobName,
  jobId,
  stages = [],
}) {
  const normalizedJobName = safeText(jobName);
  const normalizedStages = normalizeStages(stages);
  if (!normalizedJobName || normalizedStages.length === 0) {
    return null;
  }

  const normalizedDriveRef = safeText(driveRef);
  const nextTemplate = {
    driveRef: normalizedDriveRef,
    driveLabel: safeText(driveLabel),
    jobId: safeText(jobId),
    jobName: normalizedJobName,
    stages: normalizedStages,
    updatedAt: new Date().toISOString(),
  };

  const templates = readRecruitmentFlowTemplates();
  const nextKey = toTemplateKey(normalizedDriveRef, normalizedJobName);

  // Remove stale duplicates for same drive+job that may exist under legacy keys.
  Object.keys(templates).forEach((key) => {
    if (key === nextKey) return;
    const template = templates[key];
    const { driveRef: keyDriveRef, jobName: keyJobName } = splitTemplateKey(key);
    const existingDriveRef = safeLower(template?.driveRef || keyDriveRef);
    const existingJobName = safeLower(template?.jobName || keyJobName);
    if (existingDriveRef === safeLower(normalizedDriveRef) && existingJobName === safeLower(normalizedJobName)) {
      delete templates[key];
    }
  });

  templates[nextKey] = nextTemplate;
  // Cleanup legacy wildcard template for this job; templates are now strictly drive+job scoped.
  delete templates[toTemplateKey(FLOW_JOB_WILDCARD, normalizedJobName)];
  writeRecruitmentFlowTemplates(templates);

  return nextTemplate;
}

export function deleteRecruitmentFlowTemplate({ driveRef, jobName, driveLabel }) {
  const normalizedDriveRef = safeText(driveRef);
  const normalizedJobName = safeText(jobName);
  const normalizedDriveLabel = safeText(driveLabel);

  if (!normalizedJobName || (!normalizedDriveRef && !normalizedDriveLabel)) {
    return false;
  }

  const templates = readRecruitmentFlowTemplates();
  const keysToDelete = new Set();
  const targetDriveRefLower = safeLower(normalizedDriveRef);
  const targetDriveLabelLower = safeLower(normalizedDriveLabel);
  const targetJobNameLower = safeLower(normalizedJobName);

  Object.entries(templates).forEach(([key, template]) => {
    const { driveRef: keyDriveRef, jobName: keyJobName } = splitTemplateKey(key);
    const rowDriveRef = safeLower(template?.driveRef || keyDriveRef);
    const rowDriveLabel = safeLower(template?.driveLabel);
    const rowJobName = safeLower(template?.jobName || keyJobName);

    if (rowJobName !== targetJobNameLower) return;

    const driveMatches =
      (targetDriveRefLower && rowDriveRef === targetDriveRefLower) ||
      (targetDriveLabelLower && rowDriveLabel === targetDriveLabelLower);

    if (driveMatches || keyDriveRef === FLOW_JOB_WILDCARD) {
      keysToDelete.add(key);
    }
  });

  if (keysToDelete.size === 0) {
    return false;
  }

  keysToDelete.forEach((key) => {
    delete templates[key];
  });
  writeRecruitmentFlowTemplates(templates);
  return true;
}

export function listRecruitmentFlowTemplates() {
  const templates = Object.entries(readRecruitmentFlowTemplates() || {})
    .map(([key, template]) => {
      const { driveRef: keyDriveRef, jobName: keyJobName } = splitTemplateKey(key);
      return {
        ...template,
        driveRef: safeText(template?.driveRef || keyDriveRef),
        jobName: safeText(template?.jobName || keyJobName),
      };
    })
    .filter((template) => {
      const driveRef = safeText(template?.driveRef);
      const jobName = safeText(template?.jobName);
      return Boolean(jobName) && Boolean(driveRef) && driveRef !== FLOW_JOB_WILDCARD;
    });
  const deduped = new Map();

  templates.forEach((template) => {
    const key = `${safeLower(template?.driveRef)}::${safeLower(template?.jobName)}`;
    if (!key) return;
    const previous = deduped.get(key);
    if (!previous) {
      deduped.set(key, template);
      return;
    }
    const prevTime = new Date(previous.updatedAt || 0).getTime();
    const nextTime = new Date(template.updatedAt || 0).getTime();
    if (nextTime >= prevTime) {
      deduped.set(key, template);
    }
  });

  return Array.from(deduped.values()).sort((left, right) => {
    const leftTime = new Date(left?.updatedAt || 0).getTime();
    const rightTime = new Date(right?.updatedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

export function resolveRecruitmentFlowTemplate({ driveRefs = [], jobName }) {
  const normalizedJobName = safeText(jobName);
  if (!normalizedJobName) return null;

  const templates = readRecruitmentFlowTemplates();
  const refs = Array.from(
    new Set((driveRefs || []).map((ref) => safeText(ref)).filter(Boolean)),
  );

  for (const driveRef of refs) {
    const byDriveKey = toTemplateKey(driveRef, normalizedJobName);
    if (templates[byDriveKey]) return templates[byDriveKey];
  }

  return null;
}
