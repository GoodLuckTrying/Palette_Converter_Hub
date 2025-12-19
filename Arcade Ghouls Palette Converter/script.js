// Arcade Palette Converter
class ArcadePaletteConverter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormat = 'rgb';
        // Initialize palette preview and example data after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.updatePalettePreviews();
            this.populateExampleData();
        }, 100);
    }

    initializeElements() {
        // Tab buttons
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.rgbInput = document.getElementById('rgb-input');
        this.arcadeInput = document.getElementById('arcade-input');
        
        // Input elements
        this.rgbPalette = document.getElementById('rgb-palette');
        this.arcadePalette = document.getElementById('arcade-palette');
        
        // Preview areas
        this.rgbPreview = document.getElementById('rgb-preview');
        this.arcadePreview = document.getElementById('arcade-preview');
        
        // Output elements
        this.outputSection = document.getElementById('output-section');
        this.tlpContent = document.getElementById('tlp-content');
        this.downloadBtn = document.getElementById('download-btn');
        this.filename = document.getElementById('filename');
        
        // Comparison elements
        this.originalColors = document.getElementById('original-colors');
        this.convertedColors = document.getElementById('converted-colors');
        
        // Convert button
        this.convertBtn = document.getElementById('convert-btn');
        
        // Upload elements
        this.tplUpload = document.getElementById('tpl-upload');
        this.uploadBtn = document.getElementById('upload-btn');
        
        // Rearrangement elements
        this.rearrangeBtn = document.getElementById('rearrange-btn');
        this.rearrangeBtnArcade = document.getElementById('rearrange-btn-arcade');
    }

    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.format));
        });

        // Input changes for real-time preview
        this.rgbPalette.addEventListener('input', () => this.updateRGBPreview());
        this.arcadePalette.addEventListener('input', () => this.updateArcadePreview());

        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertToTPL());

        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadTPL());
        
        // Conversion buttons
        document.getElementById('rgb-to-arcade-btn').addEventListener('click', () => this.convertRGBToArcade());
        document.getElementById('arcade-to-rgb-btn').addEventListener('click', () => this.convertArcadeToRGB());
        
        // Upload functionality
        this.uploadBtn.addEventListener('click', () => this.handleTPLUpload());
        
        // Rearrangement functionality
        this.rearrangeBtn.addEventListener('click', () => this.rearrangeColors());
        this.rearrangeBtnArcade.addEventListener('click', () => this.rearrangeColors());
    }

    switchTab(format) {
        this.currentFormat = format;
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });

        // Update input areas
        this.rgbInput.classList.toggle('active', format === 'rgb');
        this.arcadeInput.classList.toggle('active', format === 'arcade');

        // Update previews
        if (format === 'rgb') {
            this.updateRGBPreview();
        } else if (format === 'arcade') {
            this.updateArcadePreview();
        }
    }

    updateRGBPreview() {
        const colors = this.parseRGBInput();
        this.displayPalettePreview(this.rgbPreview, colors);
    }

    updateArcadePreview() {
        const colors = this.parseArcadeInput();
        this.displayPalettePreview(this.arcadePreview, colors);
    }

    updatePalettePreviews() {
        // Update all previews
        this.updateRGBPreview();
        this.updateArcadePreview();
    }

    parseRGBInput() {
        const input = this.rgbPalette.value.trim();
        if (!input) return [];

        let colors = [];

        // Check if input contains newlines (line-by-line format)
        if (input.includes('\n')) {
            // Line-by-line format
            const lines = input.split('\n').filter(line => line.trim());
            for (let i = 0; i < Math.min(lines.length, 16); i++) {
                const line = lines[i].trim();
                if (line.match(/^[0-9a-fA-F]{6}$/)) {
                    colors.push(line);
                }
            }
        } else {
            // Space-separated format
            const colorStrings = input.split(/\s+/).filter(str => str.trim());
            for (let i = 0; i < Math.min(colorStrings.length, 16); i++) {
                const colorStr = colorStrings[i].trim();
                if (colorStr.match(/^[0-9a-fA-F]{6}$/)) {
                    colors.push(colorStr);
                }
            }
        }

        // Pad to 16 colors if needed
        while (colors.length < 16) {
            colors.push('000000');
        }

        return colors;
    }

    parseArcadeInput() {
        const input = this.arcadePalette.value.trim();
        if (!input) return [];

        // Split by spaces and filter out empty strings
        const hexStrings = input.split(/\s+/).filter(str => str.trim());
        const colors = [];

        // Process pairs of hex bytes (each color is 2 bytes)
        for (let i = 0; i < hexStrings.length - 1; i += 2) {
            if (i + 1 < hexStrings.length) {
                const byte1 = hexStrings[i].trim();
                const byte2 = hexStrings[i + 1].trim();
                
                // Validate hex format
                if (byte1.match(/^[0-9a-fA-F]{2}$/) && byte2.match(/^[0-9a-fA-F]{2}$/)) {
                    const color = this.convertArcadeBytesToRGB(byte1, byte2);
                    colors.push(color);
                }
            }
        }

        // Pad to 16 colors if needed
        while (colors.length < 16) {
            colors.push('000000');
        }

        return colors;
    }

    convertArcadeBytesToRGB(byte1, byte2) {
        // Arcade format: Individual hex digits Fr gb
        // F = flags, r = red, g = green, b = blue
        // Each color component is a single hex digit from 0 to F
        
        const byte1Str = byte1.padStart(2, '0');
        const byte2Str = byte2.padStart(2, '0');
        
        const r = parseInt(byte1Str[1], 16);  // Second digit of first byte (red)
        const g = parseInt(byte2Str[0], 16);  // First digit of second byte (green)
        const b = parseInt(byte2Str[1], 16);  // Second digit of second byte (blue)
        
        // Convert 4-bit values (0-15) to 8-bit values (0-255)
        const r8bit = Math.round(r * 17);  // 255/15 = 17
        const g8bit = Math.round(g * 17);
        const b8bit = Math.round(b * 17);
        
        // Convert to hex string
        const hexColor = (r8bit << 16 | g8bit << 8 | b8bit).toString(16).padStart(6, '0');
        
        console.log(`Arcade: ${byte1} ${byte2} -> R=${r}(${r8bit}), G=${g}(${g8bit}), B=${b}(${b8bit}) -> #${hexColor}`);
        
        return hexColor;
    }

    displayPalettePreview(container, colors) {
        container.innerHTML = '';
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = `#${color}`;
            swatch.title = `#${color} (Index: ${index})`;
            
            // Add click to copy functionality
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(`#${color}`);
                this.showCopyFeedback(swatch);
            });
            
            container.appendChild(swatch);
        });
    }

    showCopyFeedback(element) {
        const originalTitle = element.title;
        element.title = 'Copied!';
        element.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            element.title = originalTitle;
            element.style.transform = 'scale(1)';
        }, 1000);
    }

    convertToTPL() {
        let colors, originalColors;
        
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
            originalColors = [...colors];
            console.log('Using RGB format, colors:', colors);
        } else if (this.currentFormat === 'arcade') {
            colors = this.parseArcadeInput();
            originalColors = [...colors];
            console.log('Using Arcade format, colors:', colors);
        }
        
        if (colors.length === 0) {
            alert('Please enter valid palette data first.');
            return;
        }

        console.log('Converting colors:', colors);

        // Generate TPL content
        const tplContent = this.generateTPLContent(colors);
        console.log('Generated TPL content:', tplContent);
        
        // Display results
        this.tlpContent.textContent = tplContent;
        this.outputSection.style.display = 'block';
        
        // Update filename - use .tpl extension for Tile Layer Pro
        this.filename.textContent = `palette_${Date.now()}.tpl`;
        
        // Display palette comparison
        this.displayPaletteComparison(originalColors, colors);
        
        // Scroll to output
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateTPLContent(colors) {
        console.log('Generating TPL content for colors:', colors);
        
        // Tile Layer Pro uses binary TPL format, not text
        // We'll generate both formats for compatibility
        
        // Text format for display
        let textContent = 'TPL v1.0\n';
        textContent += '16\n'; // Number of colors
        
        colors.forEach((color, index) => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Format: index R G B (no leading zeros, space-separated)
            const line = `${index} ${r} ${g} ${b}`;
            textContent += line + '\n';
            
            console.log(`Line ${index}: ${line} (from color #${color})`);
        });
        
        console.log('Generated text content:', textContent);
        return textContent;
    }
    
    generateBinaryTPL(colors) {
        // Generate binary TPL format for Tile Layer Pro
        const buffer = new ArrayBuffer(4 + 16 * 3); // 4 bytes header + 16 colors * 3 bytes each
        const view = new Uint8Array(buffer);
        
        // Header: "TPL" (3 bytes) + null terminator (1 byte)
        view[0] = 0x54; // 'T'
        view[1] = 0x50; // 'P'
        view[2] = 0x4C; // 'L'
        view[3] = 0x00; // null terminator
        
        // Palette data: 16 colors, each 3 bytes (R, G, B)
        for (let i = 0; i < Math.min(colors.length, 16); i++) {
            const color = colors[i];
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            const offset = 4 + i * 3;
            view[offset] = r;
            view[offset + 1] = g;
            view[offset + 2] = b;
        }
        
        console.log('Generated binary TPL:', Array.from(view).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        return buffer;
    }

    downloadTPL() {
        // Get the current colors
        let colors;
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
        } else if (this.currentFormat === 'arcade') {
            colors = this.parseArcadeInput();
        }
        
        if (colors.length === 0) {
            alert('Please enter valid palette data first.');
            return;
        }
        
        // Generate binary TPL for Tile Layer Pro
        const binaryTPL = this.generateBinaryTPL(colors);
        const blob = new Blob([binaryTPL], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.filename.textContent;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Downloaded binary TPL file');
    }


    displayPaletteComparison(original, converted) {
        // Display original colors (arcade format)
        this.displayComparisonColors(this.originalColors, original);
        
        // Display converted colors (RGB hex)
        this.displayComparisonColors(this.convertedColors, converted);
    }

    displayComparisonColors(container, colors) {
        container.innerHTML = '';
        
        const colorGrid = document.createElement('div');
        colorGrid.className = 'comparison-colors';
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'comparison-swatch';
            swatch.style.backgroundColor = `#${color}`;
            swatch.title = `#${color}`;
            colorGrid.appendChild(swatch);
        });
        
        container.appendChild(colorGrid);
    }


    convertRGBToArcade() {
        const colors = this.parseRGBInput();
        if (colors.length === 0) {
            alert('Please enter valid RGB hex colors first.');
            return;
        }

        // Convert RGB to Arcade format
        const arcadeBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 4-bit values (0-15)
            const r4bit = Math.round(r / 17);  // 255/15 = 17
            const g4bit = Math.round(g / 17);
            const b4bit = Math.round(b / 17);
            
            // Format as arcade bytes: Fr gb
            // F = flags (we'll use F for now), r = red, g = green, b = blue
            const byte1 = (0xF << 4) | r4bit;  // F + red
            const byte2 = (g4bit << 4) | b4bit; // green + blue
            
            arcadeBytes.push(byte1.toString(16).padStart(2, '0').toUpperCase());
            arcadeBytes.push(byte2.toString(16).padStart(2, '0').toUpperCase());
        });
        
        // Format as space-separated hex values
        const arcadeString = arcadeBytes.join(' ');
        
        // Switch to Arcade tab and populate the data
        this.switchTab('arcade');
        this.arcadePalette.value = arcadeString;
        this.updateArcadePreview();
        
        // Show success message
        this.showConversionMessage('RGB → Arcade conversion completed!', 'success');
        
        console.log('Converted RGB to Arcade:', arcadeString);
    }

    convertArcadeToRGB() {
        const colors = this.parseArcadeInput();
        if (colors.length === 0) {
            alert('Please enter valid arcade palette data first.');
            return;
        }

        // Convert Arcade to RGB hex format
        const rgbLines = [];
        colors.forEach(color => {
            // The color is already converted to RGB by parseArcadeInput, so we can use it directly
            rgbLines.push(color);
        });
        
        // Format as one color per line
        const rgbString = rgbLines.join('\n');
        
        // Switch to RGB tab and populate the data
        this.switchTab('rgb');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();
        
        // Show success message
        this.showConversionMessage('Arcade → RGB conversion completed!', 'success');
        
        console.log('Converted Arcade to RGB hex:', rgbString);
    }

    rearrangeColors() {
        // Get current colors from the active tab
        let colors;
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
        } else if (this.currentFormat === 'arcade') {
            colors = this.parseArcadeInput();
        }
        
        if (colors.length === 0) {
            alert('Please enter valid palette data first.');
            return;
        }

        // Apply the Ghosts 'n Ghouls color rearrangement pattern
        // Swaps colors 3-4 with colors 5-6, and colors 11-12 with colors 13-14
        const rearrangedColors = [...colors];
        
        // Swap colors 3-4 with colors 5-6 (indices 2-3 with 4-5)
        [rearrangedColors[2], rearrangedColors[4]] = [rearrangedColors[4], rearrangedColors[2]];
        [rearrangedColors[3], rearrangedColors[5]] = [rearrangedColors[5], rearrangedColors[3]];
        
        // Swap colors 11-12 with colors 13-14 (indices 10-11 with 12-13)
        [rearrangedColors[10], rearrangedColors[12]] = [rearrangedColors[12], rearrangedColors[10]];
        [rearrangedColors[11], rearrangedColors[13]] = [rearrangedColors[13], rearrangedColors[11]];

        // Update the input fields with rearranged colors
        if (this.currentFormat === 'rgb') {
            const rgbString = rearrangedColors.join('\n');
            this.rgbPalette.value = rgbString;
            this.updateRGBPreview();
        } else if (this.currentFormat === 'arcade') {
            // Convert RGB colors back to arcade format
            const arcadeBytes = [];
            rearrangedColors.forEach(color => {
                const r = parseInt(color.substr(0, 2), 16);
                const g = parseInt(color.substr(2, 2), 16);
                const b = parseInt(color.substr(4, 2), 16);
                
                // Convert 8-bit RGB to 4-bit values (0-15)
                const r4bit = Math.round(r / 17);  // 255/15 = 17
                const g4bit = Math.round(g / 17);
                const b4bit = Math.round(b / 17);
                
                // Format as arcade bytes: Fr gb
                const byte1 = (0xF << 4) | r4bit;  // F + red
                const byte2 = (g4bit << 4) | b4bit; // green + blue
                
                arcadeBytes.push(byte1.toString(16).padStart(2, '0').toUpperCase());
                arcadeBytes.push(byte2.toString(16).padStart(2, '0').toUpperCase());
            });
            
            const arcadeString = arcadeBytes.join(' ');
            this.arcadePalette.value = arcadeString;
            this.updateArcadePreview();
        }

        // Show success message
        this.showConversionMessage('Colors rearranged successfully!', 'success');
        
        console.log('Original colors:', colors);
        console.log('Rearranged colors:', rearrangedColors);
    }

    populateExampleData() {
        // Example data from the provided palette
        const arcadeExample = `F1 11 F0 6B FE CA FB 97 F8 60 F7 50 F9 AC F7 8A F5 68 FA A7 FC C9 FF FF FA BD FC 60 F8 00 F1 11`;
        
        // RGB example data (converted from arcade format F1 11 F0 6B FE CA FB 97 F8 60 F7 50 F9 AC F7 8A F5 68 FA A7 FC C9 FF FF FA BD FC 60 F8 00 F1 11)
        const arcadeBytes = ['F1', '11', 'F0', '6B', 'FE', 'CA', 'FB', '97', 'F8', '60', 'F7', '50', 'F9', 'AC', 'F7', '8A', 'F5', '68', 'FA', 'A7', 'FC', 'C9', 'FF', 'FF', 'FA', 'BD', 'FC', '60', 'F8', '00', 'F1', '11'];
        const rgbColors = [];
        
        for (let i = 0; i < arcadeBytes.length - 1; i += 2) {
            const color = this.convertArcadeBytesToRGB(arcadeBytes[i], arcadeBytes[i + 1]);
            rgbColors.push(color);
        }
        
        const rgbExample = rgbColors.join('\n');

        // Set example data if fields are empty
        if (!this.arcadePalette.value) {
            this.arcadePalette.value = arcadeExample;
            this.updateArcadePreview();
        }
        if (!this.rgbPalette.value) {
            this.rgbPalette.value = rgbExample;
            this.updateRGBPreview();
        }
    }

    handleTPLUpload() {
        const file = this.tplUpload.files[0];
        if (!file) {
            alert('Please select a TPL file first.');
            return;
        }

        if (!file.name.toLowerCase().endsWith('.tpl')) {
            alert('Please select a valid TPL file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const paletteData = this.parseTPLFile(arrayBuffer);
                
                if (paletteData) {
                    // Populate both input fields
                    this.populateFromTPLData(paletteData);
                    this.showConversionMessage('TPL file loaded successfully!', 'success');
                } else {
                    alert('Failed to parse TPL file. Please ensure it\'s a valid TPL palette file.');
                }
            } catch (error) {
                console.error('Error parsing TPL file:', error);
                alert('Error parsing TPL file: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(file);
    }

    parseTPLFile(arrayBuffer) {
        try {
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Check for TPL header (TPL\0)
            if (uint8Array.length < 4 || 
                String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3]) !== 'TPL\0') {
                throw new Error('Invalid TPL header');
            }

            // TPL files typically have a 4-byte header followed by palette data
            // Each color is 3 bytes (RGB) for 16 colors = 48 bytes + 4 byte header = 52 bytes total
            const expectedSize = 4 + (16 * 3);
            if (uint8Array.length < expectedSize) {
                throw new Error('TPL file too small - expected at least ' + expectedSize + ' bytes');
            }

            const colors = [];
            // Skip header (4 bytes) and read 16 RGB colors
            for (let i = 4; i < expectedSize; i += 3) {
                const r = uint8Array[i];
                const g = uint8Array[i + 1];
                const b = uint8Array[i + 2];
                
                // Convert to hex string
                const hexColor = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
                colors.push(hexColor);
                console.log(`Color ${Math.floor((i-4)/3) + 1}: R=${r}, G=${g}, B=${b} -> ${hexColor}`);
            }

            return colors;
        } catch (error) {
            console.error('Error parsing TPL file:', error);
            return null;
        }
    }

    populateFromTPLData(colors) {
        if (!colors || colors.length !== 16) {
            console.error('Invalid palette data:', colors);
            return;
        }

        // Populate RGB input (one color per line)
        const rgbString = colors.join('\n');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();

        // Convert to Arcade format and populate Arcade input
        const arcadeBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 4-bit values (0-15)
            const r4bit = Math.round(r / 17);  // 255/15 = 17
            const g4bit = Math.round(g / 17);
            const b4bit = Math.round(b / 17);
            
            // Format as arcade bytes: Fr gb
            // F = flags (we'll use F for now), r = red, g = green, b = blue
            const byte1 = (0xF << 4) | r4bit;  // F + red
            const byte2 = (g4bit << 4) | b4bit; // green + blue
            
            arcadeBytes.push(byte1.toString(16).padStart(2, '0').toUpperCase());
            arcadeBytes.push(byte2.toString(16).padStart(2, '0').toUpperCase());
        });

        const arcadeString = arcadeBytes.join(' ');
        this.arcadePalette.value = arcadeString;
        this.updateArcadePreview();

        // Switch to RGB tab to show the loaded data
        this.switchTab('rgb');
        
        console.log('Loaded TPL file with colors:', colors);
        console.log('Converted to Arcade format:', arcadeString);
    }

    showConversionMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `conversion-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert after the input area
        const inputContainer = document.querySelector('.input-container');
        inputContainer.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcadePaletteConverter();
});