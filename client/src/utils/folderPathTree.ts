import type { ParsedFolderPathDto } from "../types";

const norm = (value: unknown) => String(value ?? "").trim();

export type FolderLevel =
  "drive" | "parent" | "child1" | "child2" | "child3" | "child4";

/** Unique, sorted list of drive names available. */
export function getDriveOptions(paths: ParsedFolderPathDto[]): string[] {
  const set = new Set<string>();
  for (const p of paths) {
    const d = norm(p.driveName);
    if (d) set.add(d);
  }
  return Array.from(set).sort();
}

/** Unique parent folders under a chosen drive. */
export function getParentOptions(
  paths: ParsedFolderPathDto[],
  drive: string,
): string[] {
  const set = new Set<string>();
  for (const p of paths) {
    if (norm(p.driveName) !== drive) continue;
    const parent = norm(p.parentFolder);
    if (parent) set.add(parent);
  }
  return Array.from(set).sort();
}

/**
 * Unique options at a given child depth (1-4), given all selections made so far.
 * Returns [] if no rows go that deep — meaning the caller is at a leaf and should
 * only offer "Select this folder", not another dropdown level.
 */
export function getChildOptions(
  paths: ParsedFolderPathDto[],
  selections: {
    drive: string;
    parent: string;
    child1?: string;
    child2?: string;
    child3?: string;
  },
): {
  key: "childDepth1" | "childDepth2" | "childDepth3" | "childDepth4";
  options: string[];
} | null {
  const depth = !selections.child1
    ? 1
    : !selections.child2
      ? 2
      : !selections.child3
        ? 3
        : 4;
  const key = `childDepth${depth}` as unknown as
    "childDepth1" | "childDepth2" | "childDepth3" | "childDepth4";

  const matches = paths.filter((p) => {
    if (norm(p.driveName) !== selections.drive) return false;
    if (norm(p.parentFolder) !== selections.parent) return false;
    if (selections.child1 && norm(p.childDepth1) !== selections.child1)
      return false;
    if (selections.child2 && norm(p.childDepth2) !== selections.child2)
      return false;
    if (selections.child3 && norm(p.childDepth3) !== selections.child3)
      return false;
    return true;
  });

  const set = new Set<string>();
  for (const p of matches) {
    const v = norm((p as any)[key]);
    if (v) set.add(v);
  }

  if (set.size === 0) return null;
  return { key, options: Array.from(set).sort() };
}

/** Builds the backslash-joined full path string from whatever has been selected. */
export function buildFullPath(selections: {
  drive: string;
  parent?: string;
  child1?: string;
  child2?: string;
  child3?: string;
  child4?: string;
}): string {
  const segments = [
    selections.drive,
    selections.parent,
    selections.child1,
    selections.child2,
    selections.child3,
    selections.child4,
  ].filter(Boolean);
  return segments.join("\\");
}

/**
 * Parses an existing full path string (e.g. from editing/resubmitting a ticket)
 * back into level selections, so the selector can be pre-populated.
 */
export function parseFullPath(
  fullPath: string,
  paths: ParsedFolderPathDto[],
): {
  drive: string;
  parent: string;
  child1?: string;
  child2?: string;
  child3?: string;
  child4?: string;
} | null {
  if (!fullPath) return null;
  const match = paths.find((p) => {
    const built = buildFullPath({
      drive: norm(p.driveName),
      parent: norm(p.parentFolder),
      child1: norm(p.childDepth1) || undefined,
      child2: norm(p.childDepth2) || undefined,
      child3: norm(p.childDepth3) || undefined,
      child4: norm(p.childDepth4) || undefined,
    });
    return (
      built === fullPath ||
      built.startsWith(fullPath + "\\") ||
      fullPath.startsWith(built)
    );
  });
  if (!match) {
    // Fallback: best-effort split so the UI isn't blank on unmapped legacy paths
    const parts = fullPath.split("\\").filter(Boolean);
    return {
      drive: parts[0] || "",
      parent: parts[1] || "",
      child1: parts[2],
      child2: parts[3],
      child3: parts[4],
      child4: parts[5],
    };
  }
  return {
    drive: norm(match.driveName),
    parent: norm(match.parentFolder),
    child1: norm(match.childDepth1) || undefined,
    child2: norm(match.childDepth2) || undefined,
    child3: norm(match.childDepth3) || undefined,
    child4: norm(match.childDepth4) || undefined,
  };
}
