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
        this.arcadePaletteRG = document.getElementById('arcade-palette-rg');
        this.arcadePaletteB = document.getElementById('arcade-palette-b');
        
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
    }

    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.format));
        });

        // Input changes for real-time preview
        this.rgbPalette.addEventListener('input', () => this.updateRGBPreview());
        this.arcadePaletteRG.addEventListener('input', () => this.updateArcadePreview());
        this.arcadePaletteB.addEventListener('input', () => this.updateArcadePreview());

        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertToTPL());

        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadTPL());
        
        // Conversion buttons
        document.getElementById('rgb-to-arcade-btn').addEventListener('click', () => this.convertRGBToArcade());
        document.getElementById('arcade-to-rgb-btn').addEventListener('click', () => this.convertArcadeToRGB());
        
        // Upload functionality
        this.uploadBtn.addEventListener('click', () => this.handleTPLUpload());
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
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.match(/^[0-9a-fA-F]{6}$/)) {
                    colors.push(line);
                }
            }
        } else {
            // Space-separated format
            const colorStrings = input.split(/\s+/).filter(str => str.trim());
            for (let i = 0; i < colorStrings.length; i++) {
                const colorStr = colorStrings[i].trim();
                if (colorStr.match(/^[0-9a-fA-F]{6}$/)) {
                    colors.push(colorStr);
                }
            }
        }

        return colors;
    }

    parseArcadeInput() {
        const inputRG = this.arcadePaletteRG.value.trim();
        const inputB = this.arcadePaletteB.value.trim();
        
        if (!inputRG && !inputB) return [];

        // Split by spaces and filter out empty strings
        const rgBytes = inputRG.split(/\s+/).filter(str => str.trim());
        const bBytes = inputB.split(/\s+/).filter(str => str.trim());
        
        const colors = [];
        const maxColors = Math.max(rgBytes.length, bBytes.length);

        // Process pairs: RG byte and B byte
        for (let i = 0; i < maxColors; i++) {
            const rgByte = rgBytes[i] ? rgBytes[i].trim() : '00';
            const bByte = bBytes[i] ? bBytes[i].trim() : '00';
            
            // Validate hex format (single byte = 2 hex digits)
            if (rgByte.match(/^[0-9a-fA-F]{2}$/) && bByte.match(/^[0-9a-fA-F]{2}$/)) {
                const color = this.convertArcadeBytesToRGB(rgByte, bByte);
                colors.push(color);
            } else if (rgByte.match(/^[0-9a-fA-F]{2}$/)) {
                // If only RG is valid, use B=00
                const color = this.convertArcadeBytesToRGB(rgByte, '00');
                colors.push(color);
            }
        }

        return colors;
    }

    convertArcadeBytesToRGB(rgByte, bByte) {
        // Ghosts 'n Goblins palette format: Colors stored in two strings
        // RG byte format: [R_first_digit][G_first_digit]
        // B byte format: [B_first_digit][ignored] - only first digit is used
        // To convert to RGB: duplicate each digit to make full RGB values
        
        const rgUpper = rgByte.toUpperCase().padStart(2, '0');
        const bUpper = bByte.toUpperCase().padStart(2, '0');
        
        const rFirst = rgUpper[0];
        const gFirst = rgUpper[1];
        const bFirst = bUpper[0]; // Only first digit of B byte is used
        
        // Duplicate each digit to create full RGB values
        const r = rFirst + rFirst;
        const g = gFirst + gFirst;
        const b = bFirst + bFirst;
        
        const rgbColor = (r + g + b).toLowerCase();
        
        console.log(`Arcade: RG=${rgByte}, B=${bByte} -> R=${r}, G=${g}, B=${b} -> ${rgbColor}`);
        return rgbColor;
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
        // Pattern: Take first hex digit of R, G, and B
        // RG format: [R_first_digit][G_first_digit]
        // B format: [B_first_digit][0] (second digit is ignored, use 0)
        const rgBytes = [];
        const bBytes = [];
        
        colors.forEach(color => {
            const colorUpper = color.toUpperCase().padStart(6, '0');
            const rFirst = colorUpper[0]; // First digit of Red
            const gFirst = colorUpper[2]; // First digit of Green
            const bFirst = colorUpper[4]; // First digit of Blue
            
            // Create RG byte: [R_first][G_first]
            const rgByte = (rFirst + gFirst).toUpperCase();
            rgBytes.push(rgByte);
            
            // Create B byte: [B_first][0] (second digit is ignored, use 0)
            const bByte = (bFirst + '0').toUpperCase();
            bBytes.push(bByte);
            
            console.log(`RGB: ${color} -> R[0]=${rFirst}, G[0]=${gFirst}, B[0]=${bFirst} -> RG=${rgByte}, B=${bByte}`);
        });
        
        // Format as space-separated hex values
        const rgString = rgBytes.join(' ');
        const bString = bBytes.join(' ');
        
        // Switch to Arcade tab and populate the data
        this.switchTab('arcade');
        this.arcadePaletteRG.value = rgString;
        this.arcadePaletteB.value = bString;
        this.updateArcadePreview();
        
        // Show success message
        this.showConversionMessage('RGB → Arcade conversion completed!', 'success');
        
        console.log('Converted RGB to Arcade - RG:', rgString);
        console.log('Converted RGB to Arcade - B:', bString);
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


    populateExampleData() {
        // Example data from Ghosts 'n Goblins palette
        const arcadeExampleRG = `06 00 CA A8 75 54 88 66 44 99 84 60 AA C0 C7 00`;
        const arcadeExampleB = `B0 00 80 60 00 00 A0 80 60 00 00 00 C0 00 00 00`;
        
        // RGB example data (converted from arcade format)
        const rgbExample = `0066bb
000000
ccaa88
aa8866
775500
554400
8888aa
666688
444466
999900
884400
660000
aaaacc
cc0000
cc7700
000000`;

        // Set example data if fields are empty
        if (!this.arcadePaletteRG.value) {
            this.arcadePaletteRG.value = arcadeExampleRG;
        }
        if (!this.arcadePaletteB.value) {
            this.arcadePaletteB.value = arcadeExampleB;
        }
        if (!this.arcadePaletteRG.value || !this.arcadePaletteB.value) {
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
        // Pattern: Take first hex digit of R, G, and B
        const rgBytes = [];
        const bBytes = [];
        
        colors.forEach(color => {
            const colorUpper = color.toUpperCase().padStart(6, '0');
            const rFirst = colorUpper[0]; // First digit of Red
            const gFirst = colorUpper[2]; // First digit of Green
            const bFirst = colorUpper[4]; // First digit of Blue
            
            // Create RG byte: [R_first][G_first]
            const rgByte = (rFirst + gFirst).toUpperCase();
            rgBytes.push(rgByte);
            
            // Create B byte: [B_first][0] (second digit is ignored, use 0)
            const bByte = (bFirst + '0').toUpperCase();
            bBytes.push(bByte);
        });

        const rgString = rgBytes.join(' ');
        const bString = bBytes.join(' ');
        this.arcadePaletteRG.value = rgString;
        this.arcadePaletteB.value = bString;
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