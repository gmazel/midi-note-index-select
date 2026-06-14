export type IndexFilter =
  | { kind: "odd" }
  | { kind: "even" }
  | { kind: "every"; n: number; offset?: number }
  | { kind: "modulo"; mod: number; remainder: number };

export type FilterMode = "deselect" | "select" | "select-only";

export type ScaleName =
  | "chromatic" | "major" | "minor" | "dorian" | "phrygian"
  | "lydian" | "mixolydian" | "locrian" | "harmonicMinor"
  | "melodicMinor" | "wholeTone" | "diminished"
  | "pentatonicMajor" | "pentatonicMinor" | "blues";

export interface TransposeOptions {
  semitones: number;
  snapToScale?: { root: number; scale: ScaleName };
}

export interface ApplyOptions {
  filter: IndexFilter;
  transpose: TransposeOptions;
}

export type PanelOutbound =
  | { type: "APPLY"; options: ApplyOptions }
  | { type: "CANCEL" };
