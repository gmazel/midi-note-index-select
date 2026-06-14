import type { MidiClip, ApiVersion, NoteDescription } from "@ableton-extensions/sdk";
import type { IndexFilter, TransposeOptions, ScaleName } from "./types.js";

const SCALE_INTERVALS: Record<ScaleName, number[]> = {
  chromatic:       [0,1,2,3,4,5,6,7,8,9,10,11],
  major:           [0,2,4,5,7,9,11],
  minor:           [0,2,3,5,7,8,10],
  dorian:          [0,2,3,5,7,9,10],
  phrygian:        [0,1,3,5,7,8,10],
  lydian:          [0,2,4,6,7,9,11],
  mixolydian:      [0,2,4,5,7,9,10],
  locrian:         [0,1,3,5,6,8,10],
  harmonicMinor:   [0,2,3,5,7,8,11],
  melodicMinor:    [0,2,3,5,7,9,11],
  wholeTone:       [0,2,4,6,8,10],
  diminished:      [0,2,3,5,6,8,9,11],
  pentatonicMajor: [0,2,4,7,9],
  pentatonicMinor: [0,3,5,7,10],
  blues:           [0,3,5,6,7,10],
};

export function snapToScale(pitch: number, root: number, scale: ScaleName): number {
  const intervals = SCALE_INTERVALS[scale];
  const octave = Math.floor(pitch / 12);
  const pc = pitch % 12;
  const shifted = ((pc - root) % 12 + 12) % 12;
  let bestInterval = intervals[0];
  let bestDist = 12;
  for (const interval of intervals) {
    const dist = Math.min(Math.abs(shifted - interval), 12 - Math.abs(shifted - interval));
    if (dist < bestDist) { bestDist = dist; bestInterval = interval; }
  }
  return octave * 12 + ((root + bestInterval) % 12);
}

export function selectIndices(totalNotes: number, filter: IndexFilter): Set<number> {
  const result = new Set<number>();
  for (let i = 1; i <= totalNotes; i++) {
    let keep = false;
    switch (filter.kind) {
      case "odd":    keep = i % 2 === 1; break;
      case "even":   keep = i % 2 === 0; break;
      case "every": {
        const offset = filter.offset ?? 1;
        keep = (i - offset) % filter.n === 0 && i >= offset;
        break;
      }
      case "modulo": keep = i % filter.mod === filter.remainder; break;
    }
    if (keep) result.add(i);
  }
  return result;
}

export function validateFilter(filter: IndexFilter): string | null {
  if (filter.kind === "every") {
    const { n, offset = 1 } = filter;
    if (!Number.isInteger(n) || n < 1) return `Invalid n: ${n}.`;
    if (!Number.isInteger(offset) || offset < 1 || offset > n) return `Invalid offset: ${offset}.`;
  }
  if (filter.kind === "modulo") {
    if (!Number.isInteger(filter.mod) || filter.mod < 1) return `Invalid mod: ${filter.mod}.`;
    if (filter.remainder < 0 || filter.remainder >= filter.mod) return `Invalid remainder: ${filter.remainder}.`;
  }
  return null;
}

export function applyFilter<V extends ApiVersion>(
  clip: MidiClip<V>,
  filter: IndexFilter,
  transpose: TransposeOptions
): { affected: number; total: number } | null {
  const err = validateFilter(filter);
  if (err) { console.error("[midi-note-index-select]", err); return null; }

  const notes: NoteDescription[] = clip.notes;
  if (notes.length === 0) { console.warn("[midi-note-index-select] No notes."); return null; }

  const sorted = [...notes].sort((a, b) => a.startTime - b.startTime || a.pitch - b.pitch);
  const targetIndices = selectIndices(sorted.length, filter);
  if (targetIndices.size === 0) { console.warn("[midi-note-index-select] No match."); return null; }

  clip.notes = sorted.map((note, idx) => {
    if (!targetIndices.has(idx + 1)) return note;
    let newPitch = Math.max(0, Math.min(127, note.pitch + transpose.semitones));
    if (transpose.snapToScale) {
      newPitch = Math.max(0, Math.min(127, snapToScale(newPitch, transpose.snapToScale.root, transpose.snapToScale.scale)));
    }
    return { ...note, pitch: newPitch };
  });

  return { affected: targetIndices.size, total: sorted.length };
}
