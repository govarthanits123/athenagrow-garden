export type RoadmapNode = {
  title: string;
  kind: "lesson" | "quiz" | "practice" | "viva" | "revision" | "assessment" | "summary";
  difficulty: "Easy" | "Medium" | "Hard";
  est_minutes: number;
};

const NOISE =
  /^(syllabus|course|subject|semester|department|university|college|index|contents|table of contents|credits|marks|total|reference|references|textbook|textbooks|outcomes?)\b/i;

function clean(line: string) {
  return line
    .replace(/^[\s•\-–—*·>]+/, "")
    .replace(/^(unit|module|chapter|week|section|part|topic|lesson)\s*[-–:.]?\s*\d*\s*[-–:.)]?\s*/i, "")
    .replace(/^\d+([.)]\d*)*[).:-]?\s*/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[.;,:]+$/, "")
    .trim();
}

function titleCase(s: string) {
  if (s === s.toUpperCase() && s.length > 3) {
    return s
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Detects a likely subject name from raw syllabus text. */
export function detectSubjectName(text: string, fallback = "My Subject"): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    const candidate = line
      .replace(/^(subject|course|paper|syllabus)\s*[:-]\s*/i, "")
      .replace(/\(.*?\)/g, "")
      .trim();
    if (candidate.length >= 3 && candidate.length <= 60 && !/^unit\b/i.test(candidate)) {
      return titleCase(candidate);
    }
  }
  return fallback;
}

/** Deterministic parse of syllabus/notes content into topic titles. */
export function parseTopics(text: string): string[] {
  const raw = text.split(/\r?\n|(?=\bUnit\s*\d)|(?=\bModule\s*\d)|(?=\bChapter\s*\d)|•/gi);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const line of raw) {
    let t = clean(line);
    if (!t) continue;
    if (t.length < 3 || t.length > 90) {
      // Try splitting comma lists inside long lines
      if (t.length > 90) {
        for (const part of t.split(/[,;]/)) {
          const p = clean(part);
          if (p.length >= 4 && p.length <= 60 && !NOISE.test(p)) {
            const key = p.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              out.push(titleCase(p));
            }
          }
          if (out.length >= 14) break;
        }
      }
      continue;
    }
    if (NOISE.test(t)) continue;
    if (!/[a-zA-Z]{3}/.test(t)) continue;
    t = titleCase(t);
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 14) break;
  }

  return out;
}

const DEFAULT_TOPICS = [
  "Introduction & Foundations",
  "Core Concepts",
  "Applied Practice",
  "Advanced Ideas",
  "Consolidation",
];

/** Builds a full journey (lessons interleaved with activities) from topic titles. */
export function buildRoadmap(topicTitles: string[]): RoadmapNode[] {
  const titles = (topicTitles.length ? topicTitles : DEFAULT_TOPICS).slice(0, 12);
  const nodes: RoadmapNode[] = [];
  const activities: RoadmapNode["kind"][] = ["summary", "quiz", "practice", "viva", "revision"];

  titles.forEach((title, i) => {
    nodes.push({
      title,
      kind: "lesson",
      difficulty: i < 2 ? "Easy" : i < titles.length - 2 ? "Medium" : "Hard",
      est_minutes: 25,
    });
    const activity = activities[i % activities.length] ?? "quiz";
    const labels: Record<string, string> = {
      summary: `Topic Summary: ${title}`,
      quiz: `Quiz Challenge: ${title}`,
      practice: `Practice Assignment: ${title}`,
      viva: `Viva Practice: ${title}`,
      revision: `Revision Session: ${title}`,
    };
    nodes.push({
      title: labels[activity] ?? `Practice: ${title}`,
      kind: activity,
      difficulty: "Medium",
      est_minutes: activity === "quiz" ? 10 : 15,
    });
  });

  nodes.push({
    title: "Final Assessment",
    kind: "assessment",
    difficulty: "Hard",
    est_minutes: 30,
  });
  return nodes;
}

export function fallbackRoadmap(text: string) {
  return buildRoadmap(parseTopics(text));
}
