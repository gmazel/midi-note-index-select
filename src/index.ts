import { initialize, MidiClip } from "@ableton-extensions/sdk";
import type { ActivationContext, Handle } from "@ableton-extensions/sdk";
import { applyFilter } from "./applyFilter.js";
import type { IndexFilter, TransposeOptions, PanelOutbound } from "./types.js";

declare const __PANEL_HTML__: string;

export function activate(activationContext: ActivationContext) {
  const context = initialize(activationContext, "1.0.0");
  const { commands, ui } = context;

  function run(handle: Handle, filter: IndexFilter, transpose: TransposeOptions) {
    const clip = context.getObjectFromHandle(handle, MidiClip);
    console.log(`[midi-note-index-select] Clip has ${clip.notes.length} notes.`);
    const result = context.withinTransaction(() => applyFilter(clip, filter, transpose));
    if (result) {
      console.log(`[midi-note-index-select] Transposed ${result.affected}/${result.total} notes by ${transpose.semitones} semitones.`);
    }
  }

  commands.registerCommand("midi-note-index-select.odd-up",    (...a: unknown[]) => run(a[0] as Handle, { kind: "odd" },  { semitones:  1 }));
  commands.registerCommand("midi-note-index-select.odd-down",  (...a: unknown[]) => run(a[0] as Handle, { kind: "odd" },  { semitones: -1 }));
  commands.registerCommand("midi-note-index-select.even-up",   (...a: unknown[]) => run(a[0] as Handle, { kind: "even" }, { semitones:  1 }));
  commands.registerCommand("midi-note-index-select.even-down", (...a: unknown[]) => run(a[0] as Handle, { kind: "even" }, { semitones: -1 }));
  commands.registerCommand("midi-note-index-select.every2-up", (...a: unknown[]) => run(a[0] as Handle, { kind: "every", n: 2, offset: 1 }, { semitones:  1 }));
  commands.registerCommand("midi-note-index-select.every2-down",(...a: unknown[]) => run(a[0] as Handle, { kind: "every", n: 2, offset: 1 }, { semitones: -1 }));

  commands.registerCommand("midi-note-index-select.open-panel", (...args: unknown[]) => {
    const handle = args[0] as Handle;
    const url = `data:text/html,${encodeURIComponent(__PANEL_HTML__)}`;
    ui.showModalDialog(url, 560, 580)
      .then((result: string) => {
        if (!result) return;
        const msg: PanelOutbound = JSON.parse(result);
        if (msg.type === "CANCEL") return;
        run(handle, msg.options.filter, msg.options.transpose);
      })
      .catch((err: unknown) => console.error("[midi-note-index-select] Panel error:", err));
  });

  ui.registerContextMenuAction("MidiClip", "Odd notes +1 semitone",      "midi-note-index-select.odd-up");
  ui.registerContextMenuAction("MidiClip", "Odd notes −1 semitone",      "midi-note-index-select.odd-down");
  ui.registerContextMenuAction("MidiClip", "Even notes +1 semitone",     "midi-note-index-select.even-up");
  ui.registerContextMenuAction("MidiClip", "Even notes −1 semitone",     "midi-note-index-select.even-down");
  ui.registerContextMenuAction("MidiClip", "Every 2nd note +1 semitone", "midi-note-index-select.every2-up");
  ui.registerContextMenuAction("MidiClip", "Every 2nd note −1 semitone", "midi-note-index-select.every2-down");
  ui.registerContextMenuAction("MidiClip", "Note index selector…",       "midi-note-index-select.open-panel");

  console.log("[midi-note-index-select] Extension activated.");
}
