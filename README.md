# midi-note-index-select

An Ableton Live 12 Beta extension that transposes MIDI notes by index pattern.

**By Gregg Mazel — [mazelmusicalarts.org](https://www.mazelmusicalarts.org)**  
*Built with help from Claude AI*

## What it does

Right-click any MIDI clip to:
- Transpose odd/even notes up or down by semitone
- Transpose every Nth note (with offset) by any interval
- Snap transposed notes to a scale and root
- Open the full panel UI for custom interval + transpose settings

## Install

Download the latest `.ablx` from [Releases](../../releases) and drag it into  
Live 12 Beta → Settings → Extensions.

## Development

Requires Node.js ≥ 24 and the Ableton Extensions SDK (beta).

```bash
npm install
npm run start    # dev mode — connects to Live directly
npm run package  # builds .ablx for distribution
```

## Requirements

- Ableton Live 12 Beta
- The Extensions SDK from Centercode
