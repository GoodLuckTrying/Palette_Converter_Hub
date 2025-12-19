# Palette Converter Hub

A collection of palette converters for retro game development. Convert between different color palette formats used in classic arcade and console games.

## What is this?

This is a web-based toolkit for converting color palettes between different formats. It's useful if you're working with sprites or graphics from retro games and need to convert palettes between formats like RGB hex, arcade formats, Genesis CRAM, SNES BGR, and TPL files.

## Converters

### Arcade Goblins
Convert palettes for Ghosts 'n Goblins arcade format. Handles RGB hex and separate RG/B byte formats.

### Arcade Ghouls
Convert palettes for Ghosts 'n Ghouls arcade format. Supports RGB hex and arcade "Fr gb" format conversion. Includes a color rearrangement tool.

### Genesis CRAM
Convert palettes for Sega Genesis/Mega Drive CRAM format. Made for Ghouls 'n Ghosts but may work for other Genesis games. Supports multiple Genesis palette formats including BGR32 and RGB32.

### SNES Palette
Convert palettes for Super Nintendo (SNES) format. Made for Super Ghouls N' Ghosts (Works for the GBA port too) but may work for other SNES games. Handles RGB hex and 15-bit BGR LSB format.

## Features

- **Dynamic color previews** - See colors update in real-time as you type
- **Default Arthur palettes** - Each converter tab comes pre-loaded with Arthur's default palette as stored in the respective game's ROM hex
- **TPL file generation** - Generate Tile Layer Pro/Tile Molester compatible palette files
- **File upload** - Upload existing TPL files to extract palette data
- **No limits** - Enter as many colors as you need (not limited to 16) for visualization purposes

## How to use

1. Open `index.html` in your web browser
2. Click on the converter you need
3. Enter your palette data in the input field
4. Use the conversion buttons to switch between formats
5. Click "Convert to TPL" to generate a TPL file
6. Download the file when you're done

## File structure

```
├── index.html (main hub page)
├── Icons/ (icon files for each converter)
├── Arcade Goblins Palette Converter/
├── Arcade Ghouls Palette Converter/
├── Genesis GNG CRAM Palette Converter/
└── SNES GNG Palette Converter/
```

Each converter folder contains its own `index.html`, `script.js`, and `styles.css` files.

## Notes

- All converters support dynamic color previews - you can enter any number of colors
- TPL files are generated in binary format for Tile Layer Pro compatibility
- The converters were originally made for specific games but may work with other games on the same platforms
- No server required - everything runs in your browser

