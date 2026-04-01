export const TRAINING_LOCATIONS = [
  {
    value: "bbs",
    label: "BBS Halle",
    shortLabel: "BBS",
    color: "#ef4444",
  },
  {
    value: "liebig",
    label: "Liebighalle",
    shortLabel: "Liebig",
    color: "#facc15",
  },
  {
    value: "billerbeck",
    label: "Billerbeckhalle",
    shortLabel: "Billerbeck",
    color: "#34d399",
  },
  {
    value: "tv",
    label: "TV-Halle",
    shortLabel: "TV",
    color: "#3b82f6",
  },
  {
    value: "os",
    label: "OS-Halle",
    shortLabel: "OS",
    color: "#a855f7",
  },
  {
    value: "realschulhalle",
    label: "Realschulhalle",
    shortLabel: "Realschule",
    color: "#10b981",
  },
  {
    value: "asli",
    label: "ASLI-Halle",
    shortLabel: "ASLI",
    color: "#f97316",
  },
];

// Helper to get color by location value
export const getLocationColor = (locationValue) => {
  const location = TRAINING_LOCATIONS.find(
    (loc) => loc.value === locationValue,
  );
  return location?.color || "#888888";
};

// Helper to get label by location value
export const getLocationLabel = (locationValue) => {
  const location = TRAINING_LOCATIONS.find(
    (loc) => loc.value === locationValue,
  );
  return location?.label || locationValue;
};

// Helper to get short label by location value
export const getLocationShortLabel = (locationValue) => {
  const location = TRAINING_LOCATIONS.find(
    (loc) => loc.value === locationValue,
  );
  return location?.shortLabel || locationValue;
};
