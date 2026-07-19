const EDUCATION_KEYWORDS = {
  PHD: /\bph\.?d\b/i,
  MASTER: /\bmaster'?s?\b|\bmsc\b|\bm\.a\.\b/i,
  BACHELOR: /\bbachelor'?s?\b|\bbsc\b|\bb\.a\.\b|\bdegree\b/i,
  DIPLOMA: /\bdiploma\b/i,
};

const EXPERIENCE_KEYWORDS = {
  INTERNSHIP: /\bintern(ship)?\b/i,
  JUNIOR: /\bjunior\b|\bentry.level\b|\bfresh graduate\b/i,
  SENIOR: /\bsenior\b|\blead\b|\bmanager\b/i,
  MID: /\bmid.level\b|\b\d\+?\s*years?\b/i,
};

const EMPLOYMENT_KEYWORDS = {
  INTERNSHIP: /\binternship\b/i,
  PART_TIME: /\bpart.time\b/i,
  CONTRACT: /\bcontract\b/i,
  FULL_TIME: /\bfull.time\b|\bpermanent\b/i,
};

const DEADLINE_PATTERNS = [
  /deadline[:\s]+([a-z0-9,\s]+\d{4})/i,
  /apply\s+before[:\s]+([a-z0-9,\s]+\d{4})/i,
  /closing date[:\s]+([a-z0-9,\s]+\d{4})/i,
];

const ANY_FIELD_PATTERNS =
  /\bany\s+field\b|\bany\s+discipline\b|\ball\s+fields\s+welcome\b|\bopen\s+to\s+all\s+background/i;

const MIN_YEARS_PATTERN = /(\d+)\+?\s*years?\s+(of\s+)?experience/i;

const extractMinYearsRequired = (text) => {
  const match = text.match(MIN_YEARS_PATTERN);
  return match ? Number(match[1]) : null;
};

const isAnyFieldEligible = (text) => ANY_FIELD_PATTERNS.test(text);

const matchFirst = (text, keywordMap) => {
  for (const [key, pattern] of Object.entries(keywordMap)) {
    if (pattern.test(text)) return key;
  }
  return null;
};

const extractTitle = (text) => {
  const firstLine =
    text.split("\n").find((line) => line.trim().length > 0) ||
    "Untitled Position";
  return firstLine
    .replace(/[*_#>-]/g, "")
    .trim()
    .slice(0, 200);
};

const extractDeadline = (text) => {
  for (const pattern of DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
};

const extractLocation = (text) => {
  const known = [
    "Addis Ababa",
    "Adama",
    "Hawassa",
    "Bahir Dar",
    "Mekelle",
    "Remote",
    "Ethiopia",
  ];
  const found = known.find((location) =>
    new RegExp(`\\b${location}\\b`, "i").test(text),
  );
  return found || null;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSkills = (text, knownSkillNames = []) =>
  knownSkillNames.filter((skill) =>
    new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(text),
  );

const extractOrganization = (text) => {
  const match = text.match(
    /^([A-Z][A-Za-z0-9&.\s]{2,60}?)\s+(is\s+hiring|is\s+looking\s+for|seeks)/i,
  );
  return match ? match[1].trim() : null;
};

export const parseJobPosting = (rawContent, knownSkillNames = []) => ({
  title: extractTitle(rawContent),
  organizationName: extractOrganization(rawContent),
  location: extractLocation(rawContent),
  educationRequirement: matchFirst(rawContent, EDUCATION_KEYWORDS),
  experienceLevel: matchFirst(rawContent, EXPERIENCE_KEYWORDS),
  employmentType: matchFirst(rawContent, EMPLOYMENT_KEYWORDS) || "FULL_TIME",
  skills: extractSkills(rawContent, knownSkillNames),
  deadlineAt: extractDeadline(rawContent),
  anyFieldEligible: isAnyFieldEligible(rawContent),
  minYearsRequired: extractMinYearsRequired(rawContent),
});
