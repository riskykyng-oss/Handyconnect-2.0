const KEY = 'handyconnect:prefs';

const DEFAULTS = {
  messages: true,
  jobs: true,
  community: false,
  payments: true,
  promotions: false,
  locationSharing: true,
};

export const getPrefs = () => {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch {
    return { ...DEFAULTS };
  }
};

export const setPref = (key, value) => {
  const next = { ...getPrefs(), [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  return next;
};
