/**
 * robots.txt parsing and per-user-agent access decisions.
 *
 * Follows the RFC 9309 matching rules:
 * - A group (ruleset) matches a user agent when any of its user-agent lines
 *   matches, case-insensitively, with `*` as a wildcard.
 * - The applicable group is the most specific match: a literal agent name
 *   beats a wildcard, and among literals the longest name wins. When only
 *   wildcard groups match, their rules are merged.
 * - A path is allowed when no Disallow matches, or when a matching Allow is
 *   at least as specific (longest prefix; a tie goes to Allow).
 * - `Allow`/`Disallow` patterns support `*` anywhere and a trailing `$`
 *   anchor; the query string and fragment are ignored.
 */

export type RobotsRule = { type: "Allow" | "Disallow"; path: string };
export type RobotsGroup = { agents: string[]; rules: RobotsRule[]; crawlDelay: number | null };
export type RobotsParse = {
  groups: RobotsGroup[];
  sitemaps: string[];
  lineCount: number;
};

export type RuleMatch = { rule: RobotsRule; matched: boolean };
export type RobotsCheck = {
  groupFound: boolean;
  matchedAgents: string[];
  rules: RuleMatch[];
  allowed: boolean;
  reason: string;
  crawlDelay: number | null;
};

/** Parse a robots.txt document into agent groups, sitemaps and crawl delays. */
export function parseRobotsTxt(text: string): RobotsParse {
  const lines = text.split(/\r?\n/);
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue; // A line without a field is ignored.
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (value === "") continue;
      // A new group starts when this is the first agent, or when the previous
      // group already received a rule line.
      if (!current || current.rules.length > 0) {
        current = { agents: [value], rules: [], crawlDelay: null };
        groups.push(current);
      } else {
        current.agents.push(value);
      }
      continue;
    }
    if (key === "allow" || key === "disallow") {
      if (value === "") continue; // "Disallow:" with no value allows everything.
      if (!current) {
        current = { agents: ["*"], rules: [], crawlDelay: null };
        groups.push(current);
      }
      current.rules.push({ type: key === "allow" ? "Allow" : "Disallow", path: value });
      continue;
    }
    if (key === "crawl-delay") {
      const delay = Number(value);
      if (!Number.isFinite(delay) || delay < 0) continue;
      if (!current) {
        current = { agents: ["*"], rules: [], crawlDelay: delay };
        groups.push(current);
      } else {
        current.crawlDelay = delay;
      }
      continue;
    }
    if (key === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    // Unknown directives are ignored, as per spec.
  }

  return { groups, sitemaps, lineCount: lines.length };
}

function toAgentRegex(agent: string): RegExp {
  const escaped = agent
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function agentMatches(agent: string, userAgent: string): boolean {
  return toAgentRegex(agent).test(userAgent);
}

function ruleMatchesPath(pattern: string, path: string): boolean {
  let body = pattern;
  let anchored = false;
  if (body.endsWith("$")) {
    anchored = true;
    body = body.slice(0, -1);
  }
  const escaped = body
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`).test(path);
}

/**
 * Decide whether `userAgent` may fetch `path` under this robots.txt.
 * `path` may include a query string or fragment; those are ignored.
 */
export function checkPath(parse: RobotsParse, userAgent: string, path: string): RobotsCheck {
  const urlPath = path.trim().split(/[?#]/)[0] || "/";
  const matching = parse.groups.filter((group) =>
    group.agents.some((agent) => agentMatches(agent, userAgent)),
  );

  if (matching.length === 0) {
    return {
      groupFound: false,
      matchedAgents: [],
      rules: [],
      allowed: true,
      reason: "No user-agent group matches — the default behavior allows everything.",
      crawlDelay: null,
    };
  }

  // Specificity: a literal (non-wildcard) agent match always beats a wildcard
  // match; within a class, the longest matching agent name wins (so
  // "Bad*Bot" beats "*"). Groups tied at the top rank are merged.
  const specificity = (group: RobotsGroup): number =>
    Math.max(
      ...group.agents
        .filter((agent) => agentMatches(agent, userAgent))
        .map((agent) => (agent.includes("*") ? 0 : 1000) + agent.length),
    );
  const best = Math.max(...matching.map(specificity));
  const chosen = matching.filter((group) => specificity(group) === best);

  const matchedAgents = Array.from(
    new Set(
      chosen.flatMap((group) => group.agents.filter((agent) => agentMatches(agent, userAgent))),
    ),
  );
  const crawlDelay = chosen.map((group) => group.crawlDelay).find((delay) => delay !== null) ?? null;
  const rules: RuleMatch[] = chosen.flatMap((group) =>
    group.rules.map((rule) => ({ rule, matched: ruleMatchesPath(rule.path, urlPath) })),
  );

  const matchedDisallows = rules.filter((rule) => rule.matched && rule.rule.type === "Disallow");
  const matchedAllows = rules.filter((rule) => rule.matched && rule.rule.type === "Allow");

  let allowed: boolean;
  let reason: string;
  if (matchedDisallows.length === 0) {
    allowed = true;
    reason =
      matchedAllows.length > 0
        ? `An explicit Allow (${matchedAllows[0].rule.path}) matches and no Disallow does.`
        : "No Disallow rule matches this path.";
  } else {
    const longestDisallow = Math.max(...matchedDisallows.map((rule) => rule.rule.path.length));
    const longestAllow = Math.max(0, ...matchedAllows.map((rule) => rule.rule.path.length));
    allowed = matchedAllows.length > 0 && longestAllow >= longestDisallow;
    reason = allowed
      ? `Allow ${matchedAllows.find((rule) => rule.rule.path.length === longestAllow)?.rule.path} is at least as specific as the longest matching Disallow.`
      : `The longest matching rule is Disallow ${matchedDisallows.find((rule) => rule.rule.path.length === longestDisallow)?.rule.path}.`;
  }

  return { groupFound: true, matchedAgents, rules, allowed, reason, crawlDelay };
}
