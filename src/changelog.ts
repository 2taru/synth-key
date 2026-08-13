import raw from '../CHANGELOG.md?raw';

export interface ChangelogSection {
  title: string; // "Added" | "Fixed" | "Changed" | ...
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

/**
 * Parse the Keep-a-Changelog Markdown into structured entries so the UI and the
 * CHANGELOG.md file stay a single source of truth. Recognizes:
 *   `## [version] - date`  → an entry
 *   `### Title`            → a section
 *   `- item` (+ indented   → a list item (wrapped continuation lines are joined)
 *      continuation lines)
 */
function parseChangelog(md: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let entry: ChangelogEntry | null = null;
  let section: ChangelogSection | null = null;

  for (const line of md.split('\n')) {
    const versionMatch = line.match(/^##\s+\[([^\]]+)\]\s*-\s*(.+?)\s*$/);
    if (versionMatch) {
      entry = { version: versionMatch[1], date: versionMatch[2], sections: [] };
      entries.push(entry);
      section = null;
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+?)\s*$/);
    if (sectionMatch && entry) {
      section = { title: sectionMatch[1], items: [] };
      entry.sections.push(section);
      continue;
    }

    const itemMatch = line.match(/^-\s+(.+?)\s*$/);
    if (itemMatch && section) {
      section.items.push(itemMatch[1]);
      continue;
    }

    // Wrapped continuation of the previous list item (indented, not a new bullet).
    if (/^\s+\S/.test(line) && section && section.items.length > 0) {
      section.items[section.items.length - 1] += ` ${line.trim()}`;
    }
  }

  return entries;
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = parseChangelog(raw);

/** Latest version = the first entry in the changelog. */
export const APP_VERSION: string = CHANGELOG_ENTRIES[0]?.version ?? '0.0.0';
