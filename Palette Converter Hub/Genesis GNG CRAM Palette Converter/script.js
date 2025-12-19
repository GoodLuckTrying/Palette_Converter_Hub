// Genesis Palette Converter
class GenesisPaletteConverter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormat = 'rgb';
        // Initialize palette previews and example data after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.updatePalettePreviews();
            this.populateExampleData();
        }, 100);
    }

    initializeElements() {
        // Tab buttons
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.rgbInput = document.getElementById('rgb-input');
        this.genesisInput = document.getElementById('genesis-input');
        this.bgr32Input = document.getElementById('bgr32-input');
        this.rgb32Input = document.getElementById('rgb32-input');
        
        // Input areas
        this.rgbPalette = document.getElementById('rgb-palette');
        this.genesisPalette = document.getElementById('genesis-palette');
        this.bgr32Palette = document.getElementById('bgr32-palette');
        this.rgb32Palette = document.getElementById('rgb32-palette');
        
        // Preview areas
        this.rgbPreview = document.getElementById('rgb-preview');
        this.genesisPreview = document.getElementById('genesis-preview');
        this.bgr32Preview = document.getElementById('bgr32-preview');
        this.rgb32Preview = document.getElementById('rgb32-preview');
        
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
        this.genesisPalette.addEventListener('input', () => this.updateGenesisPreview());
        this.bgr32Palette.addEventListener('input', () => this.updateBGR32Preview());
        this.rgb32Palette.addEventListener('input', () => this.updateRGB32Preview());

        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertToTPL());

        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadTPL());
        
        // Conversion buttons
        document.getElementById('rgb-to-genesis-btn').addEventListener('click', () => this.convertRGBtoGenesis());
        document.getElementById('rgb-to-bgr32-btn').addEventListener('click', () => this.convertRGBToBGR32());
        document.getElementById('rgb-to-rgb32-btn').addEventListener('click', () => this.convertRGBToRGB32());
        document.getElementById('genesis-to-rgb-btn').addEventListener('click', () => this.convertGenesisToRGB());
        document.getElementById('genesis-to-bgr32-btn').addEventListener('click', () => this.convertGenesisToBGR32());
        document.getElementById('genesis-to-rgb32-btn').addEventListener('click', () => this.convertGenesisToRGB32());
        document.getElementById('bgr32-to-rgb-btn').addEventListener('click', () => this.convertBGR32ToRGB());
        document.getElementById('bgr32-to-cram-btn').addEventListener('click', () => this.convertBGR32ToCRAM());
        document.getElementById('bgr32-to-rgb32-btn').addEventListener('click', () => this.convertBGR32ToRGB32());
        document.getElementById('rgb32-to-rgb-btn').addEventListener('click', () => this.convertRGB32ToRGB());
        document.getElementById('rgb32-to-cram-btn').addEventListener('click', () => this.convertRGB32ToCRAM());
        document.getElementById('rgb32-to-bgr32-btn').addEventListener('click', () => this.convertRGB32ToBGR32());
        
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
        this.genesisInput.classList.toggle('active', format === 'genesis');
        this.bgr32Input.classList.toggle('active', format === 'bgr32');
        this.rgb32Input.classList.toggle('active', format === 'rgb32');

        // Update previews
        if (format === 'rgb') {
            this.updateRGBPreview();
        } else if (format === 'genesis') {
            this.updateGenesisPreview();
        } else if (format === 'bgr32') {
            this.updateBGR32Preview();
        } else if (format === 'rgb32') {
            this.updateRGB32Preview();
        }
    }

    updateRGBPreview() {
        const colors = this.parseRGBInput();
        this.displayPalettePreview(this.rgbPreview, colors);
    }

    updateGenesisPreview() {
        const colors = this.parseGenesisInput();
        this.displayPalettePreview(this.genesisPreview, colors);
    }

    updateBGR32Preview() {
        const colors = this.parseBGR32Input();
        this.displayPalettePreview(this.bgr32Preview, colors);
    }

    updateRGB32Preview() {
        const colors = this.parseRGB32Input();
        this.displayPalettePreview(this.rgb32Preview, colors);
    }

    updatePalettePreviews() {
        // Update all previews
        this.updateRGBPreview();
        this.updateGenesisPreview();
        this.updateBGR32Preview();
        this.updateRGB32Preview();
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

    parseGenesisInput() {
        const input = this.genesisPalette.value.trim();
        if (!input) return [];

        // Remove spaces and split into bytes
        const hexString = input.replace(/\s/g, '');
        const bytes = [];
        
        for (let i = 0; i < hexString.length; i += 2) {
            if (i + 1 < hexString.length) {
                bytes.push(parseInt(hexString.substr(i, 2), 16));
            }
        }

        console.log('Parsed Genesis bytes:', bytes);

        // Use the Genesis 9-bit RGB format
        const colors = this.extractGenesisRGB(bytes);

        return colors;
    }

    parseBGR32Input() {
        const input = this.bgr32Palette.value.trim();
        if (!input) return [];

        // Split by spaces and filter out empty strings
        const colorStrings = input.split(/\s+/).filter(str => str.trim());
        const colors = [];

        for (let i = 0; i < colorStrings.length; i++) {
            const colorStr = colorStrings[i].trim();
            if (colorStr.match(/^[0-9a-fA-F]{3}$/)) {
                // Convert BGR32 format to RGB
                // BGR32: Blue-Green-Red order
                const b4bit = parseInt(colorStr[0], 16);
                const g4bit = parseInt(colorStr[1], 16);
                const r4bit = parseInt(colorStr[2], 16);
                
                // Convert 4-bit values to 3-bit values (Genesis uses 3-bit per channel)
                const b3bit = Math.floor(b4bit / 2);
                const g3bit = Math.floor(g4bit / 2);
                const r3bit = Math.floor(r4bit / 2);
                
                // Scale 3-bit values (0-7) to 8-bit values (0-255)
                const b8bit = Math.round(b3bit * 36.428571);
                const g8bit = Math.round(g3bit * 36.428571);
                const r8bit = Math.round(r3bit * 36.428571);
                
                // Convert to hex string (RGB order for display)
                const hexColor = (r8bit << 16 | g8bit << 8 | b8bit).toString(16).padStart(6, '0');
                colors.push(hexColor);
                
                console.log(`BGR32: ${colorStr} -> BGR4bit(${b4bit},${g4bit},${r4bit}) -> BGR3bit(${b3bit},${g3bit},${r3bit}) -> RGB8bit(${r8bit},${g8bit},${b8bit}) -> #${hexColor}`);
            }
        }

        return colors;
    }

    parseRGB32Input() {
        const input = this.rgb32Palette.value.trim();
        if (!input) return [];

        // Split by spaces and filter out empty strings
        const colorStrings = input.split(/\s+/).filter(str => str.trim());
        const colors = [];

        for (let i = 0; i < colorStrings.length; i++) {
            const colorStr = colorStrings[i].trim();
            if (colorStr.match(/^[0-9a-fA-F]{3}$/)) {
                // Convert RGB32 format to RGB
                // RGB32: Red-Green-Blue order
                const r4bit = parseInt(colorStr[0], 16);
                const g4bit = parseInt(colorStr[1], 16);
                const b4bit = parseInt(colorStr[2], 16);
                
                // Convert 4-bit values to 3-bit values (Genesis uses 3-bit per channel)
                const r3bit = Math.floor(r4bit / 2);
                const g3bit = Math.floor(g4bit / 2);
                const b3bit = Math.floor(b4bit / 2);
                
                // Scale 3-bit values (0-7) to 8-bit values (0-255)
                const r8bit = Math.round(r3bit * 36.428571);
                const g8bit = Math.round(g3bit * 36.428571);
                const b8bit = Math.round(b3bit * 36.428571);
                
                // Convert to hex string
                const hexColor = (r8bit << 16 | g8bit << 8 | b8bit).toString(16).padStart(6, '0');
                colors.push(hexColor);
                
                console.log(`RGB32: ${colorStr} -> RGB4bit(${r4bit},${g4bit},${b4bit}) -> RGB3bit(${r3bit},${g3bit},${b3bit}) -> RGB8bit(${r8bit},${g8bit},${b8bit}) -> #${hexColor}`);
            }
        }

        return colors;
    }

    extractGenesisRGB(bytes) {
        const colors = [];
        for (let i = 0; i < bytes.length; i += 2) {
            if (i + 1 < bytes.length) {
                const color16bit = (bytes[i] << 8) | bytes[i + 1];
                
                // Genesis CRAM format: BBBGGGRRR (9-bit RGB)
                // High byte: [-- -- -- --  B2 B1 B0  G2]
                // Low byte:  [ G1 G0 R2 R1 R0 0 0 0]
                
                // Extract color components (3 bits each, 0-7)
                // Format: BBBGGGRRR (9-bit RGB) based on Python code
                // cram = (b3 << 9) | (g3 << 5) | (r3 << 1)
                const r = (color16bit >> 1) & 0x7;   // bits 1-3 (R2 R1 R0)
                const g = (color16bit >> 5) & 0x7;   // bits 5-7 (G2 G1 G0)
                const b = (color16bit >> 9) & 0x7;   // bits 9-11 (B2 B1 B0)
                
                // Debug logging for first few colors
                if (colors.length <= 3) {
                    console.log(`Color ${colors.length-1}: Genesis16bit=${color16bit.toString(16).padStart(4, '0')} (${color16bit.toString(2).padStart(16, '0')})`);
                    console.log(`  Extracted: R=${r} (${(color16bit >> 1 & 0x7).toString(2).padStart(3, '0')}), G=${g} (${(color16bit >> 5 & 0x7).toString(2).padStart(3, '0')}), B=${b} (${(color16bit >> 9 & 0x7).toString(2).padStart(3, '0')})`);
                }
                
                // Scale to 24-bit RGB by multiplying by ~36.43 (255/7)
                const r8bit = Math.round(r * 36.43);
                const g8bit = Math.round(g * 36.43);
                const b8bit = Math.round(b * 36.43);
                
                const rgb = (r8bit << 16) | (g8bit << 8) | b8bit;
                const hexColor = rgb.toString(16).padStart(6, '0');
                colors.push(hexColor);
                
                // Debug logging for first few colors
                if (colors.length <= 3) {
                    console.log(`Color ${colors.length-1}: Genesis16bit=${color16bit.toString(16).padStart(4, '0')} -> RGB3bit=(${r},${g},${b}) -> RGB8bit=(${r8bit},${g8bit},${b8bit}) -> Hex=${hexColor}`);
                }
                
                // Log all colors for debugging
                console.log(`Color ${colors.length-1}: #${hexColor} (R:${r8bit}, G:${g8bit}, B:${b8bit})`);
            }
        }
        return colors;
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
        } else if (this.currentFormat === 'genesis') {
            colors = this.parseGenesisInput();
            originalColors = [...colors];
            console.log('Using Genesis format, colors:', colors);
        } else if (this.currentFormat === 'bgr32') {
            colors = this.parseBGR32Input();
            originalColors = [...colors];
            console.log('Using BGR32 format, colors:', colors);
        } else if (this.currentFormat === 'rgb32') {
            colors = this.parseRGB32Input();
            originalColors = [...colors];
            console.log('Using RGB32 format, colors:', colors);
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

    displayPaletteComparison(original, converted) {
        // Display original colors
        this.displayComparisonColors(this.originalColors, original);
        
        // Display converted colors
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

    downloadTPL() {
        // Get the current colors
        let colors;
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
        } else if (this.currentFormat === 'genesis') {
            colors = this.parseGenesisInput();
        } else if (this.currentFormat === 'bgr32') {
            colors = this.parseBGR32Input();
        } else if (this.currentFormat === 'rgb32') {
            colors = this.parseRGB32Input();
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

    convertRGBtoGenesis() {
        const colors = this.parseRGBInput();
        if (colors.length === 0) {
            alert('Please enter valid RGB hex colors first.');
            return;
        }

        // Convert RGB to Genesis 9-bit RGB format
        const genesisBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            // Divide by ~36.43 (255/7) and clamp to 0-7
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Pack into Genesis 9-bit RGB format: BBBGGGRRR
            // Based on Python code: cram = (b3 << 9) | (g3 << 5) | (r3 << 1)
            const genesis16bit = (b3bit << 9) | (g3bit << 5) | (r3bit << 1);
            
            // Split into MSB and LSB bytes (big-endian to match reading)
            const msb = (genesis16bit >> 8) & 0xFF;
            const lsb = genesis16bit & 0xFF;
            
            genesisBytes.push(msb.toString(16).padStart(2, '0'));
            genesisBytes.push(lsb.toString(16).padStart(2, '0'));
        });
        
        // Format as space-separated hex values
        const genesisString = genesisBytes.join(' ');
        
        // Switch to Genesis tab and populate the data
        this.switchTab('genesis');
        this.genesisPalette.value = genesisString;
        this.updateGenesisPreview();
        
        // Show success message
        this.showConversionMessage('RGB → Genesis conversion completed!', 'success');
        
        console.log('Converted RGB to Genesis:', genesisString);
    }

    convertRGBToBGR32() {
        const colors = this.parseRGBInput();
        if (colors.length === 0) {
            alert('Please enter valid RGB hex colors first.');
            return;
        }

        // Convert RGB to BGR32 format
        const bgr32Colors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Convert 3-bit values back to 4-bit values (multiply by 2)
            const r4bit = r3bit * 2;
            const g4bit = g3bit * 2;
            const b4bit = b3bit * 2;
            
            // Format as BGR32 (Blue-Green-Red order)
            const bgr32Color = b4bit.toString(16).toUpperCase() + g4bit.toString(16).toUpperCase() + r4bit.toString(16).toUpperCase();
            bgr32Colors.push(bgr32Color);
        });
        
        // Format as space-separated
        const bgr32String = bgr32Colors.join(' ');
        
        // Switch to BGR32 tab and populate the data
        this.switchTab('bgr32');
        this.bgr32Palette.value = bgr32String;
        this.updateBGR32Preview();
        
        // Show success message
        this.showConversionMessage('RGB → BGR32 conversion completed!', 'success');
        
        console.log('Converted RGB to BGR32:', bgr32String);
    }

    convertRGBToRGB32() {
        const colors = this.parseRGBInput();
        if (colors.length === 0) {
            alert('Please enter valid RGB hex colors first.');
            return;
        }

        // Convert RGB to RGB32 format
        const rgb32Colors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Convert 3-bit values back to 4-bit values (multiply by 2)
            const r4bit = r3bit * 2;
            const g4bit = g3bit * 2;
            const b4bit = b3bit * 2;
            
            // Format as RGB32 (Red-Green-Blue order)
            const rgb32Color = r4bit.toString(16).toUpperCase() + g4bit.toString(16).toUpperCase() + b4bit.toString(16).toUpperCase();
            rgb32Colors.push(rgb32Color);
        });
        
        // Format as space-separated
        const rgb32String = rgb32Colors.join(' ');
        
        // Switch to RGB32 tab and populate the data
        this.switchTab('rgb32');
        this.rgb32Palette.value = rgb32String;
        this.updateRGB32Preview();
        
        // Show success message
        this.showConversionMessage('RGB → RGB32 conversion completed!', 'success');
        
        console.log('Converted RGB to RGB32:', rgb32String);
    }

    convertGenesisToRGB() {
        const colors = this.parseGenesisInput();
        if (colors.length === 0) {
            alert('Please enter valid Genesis data first.');
            return;
        }

        // Convert Genesis to RGB hex format using the correct reverse formula
        const rgbLines = [];
        colors.forEach(color => {
            // Parse the hex color (which is already in RGB format from parseGenesisInput)
            // But we need to apply the reverse formula to get the original RGB values
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // The color is already converted to RGB by parseGenesisInput, so we can use it directly
            rgbLines.push(color);
        });
        
        // Format as one color per line
        const rgbString = rgbLines.join('\n');
        
        // Switch to RGB tab and populate the data
        this.switchTab('rgb');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();
        
        // Show success message
        this.showConversionMessage('Genesis → RGB conversion completed!', 'success');
        
        console.log('Converted Genesis to RGB hex:', rgbString);
    }

    convertGenesisToBGR32() {
        const colors = this.parseGenesisInput();
        if (colors.length === 0) {
            alert('Please enter valid Genesis data first.');
            return;
        }

        // Convert Genesis to BGR32 format
        const bgr32Colors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // The colors are already in 8-bit RGB format from parseGenesisInput
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Convert 3-bit values back to 4-bit values (multiply by 2)
            const r4bit = r3bit * 2;
            const g4bit = g3bit * 2;
            const b4bit = b3bit * 2;
            
            // Format as BGR32 (Blue-Green-Red order)
            const bgr32Color = b4bit.toString(16).toUpperCase() + g4bit.toString(16).toUpperCase() + r4bit.toString(16).toUpperCase();
            bgr32Colors.push(bgr32Color);
        });
        
        // Format as space-separated
        const bgr32String = bgr32Colors.join(' ');
        
        // Switch to BGR32 tab and populate the data
        this.switchTab('bgr32');
        this.bgr32Palette.value = bgr32String;
        this.updateBGR32Preview();
        
        // Show success message
        this.showConversionMessage('Genesis → BGR32 conversion completed!', 'success');
        
        console.log('Converted Genesis to BGR32:', bgr32String);
    }

    convertGenesisToRGB32() {
        const colors = this.parseGenesisInput();
        if (colors.length === 0) {
            alert('Please enter valid Genesis data first.');
            return;
        }

        // Convert Genesis to RGB32 format
        const rgb32Colors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // The colors are already in 8-bit RGB format from parseGenesisInput
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Convert 3-bit values back to 4-bit values (multiply by 2)
            const r4bit = r3bit * 2;
            const g4bit = g3bit * 2;
            const b4bit = b3bit * 2;
            
            // Format as RGB32 (Red-Green-Blue order)
            const rgb32Color = r4bit.toString(16).toUpperCase() + g4bit.toString(16).toUpperCase() + b4bit.toString(16).toUpperCase();
            rgb32Colors.push(rgb32Color);
        });
        
        // Format as space-separated
        const rgb32String = rgb32Colors.join(' ');
        
        // Switch to RGB32 tab and populate the data
        this.switchTab('rgb32');
        this.rgb32Palette.value = rgb32String;
        this.updateRGB32Preview();
        
        // Show success message
        this.showConversionMessage('Genesis → RGB32 conversion completed!', 'success');
        
        console.log('Converted Genesis to RGB32:', rgb32String);
    }

    convertBGR32ToRGB() {
        const colors = this.parseBGR32Input();
        if (colors.length === 0) {
            alert('Please enter valid BGR32 colors first.');
            return;
        }

        // Convert BGR32 to RGB hex format
        const rgbLines = [];
        colors.forEach(color => {
            // The color is already converted to RGB by parseBGR32Input, so we can use it directly
            rgbLines.push(color);
        });
        
        // Format as one color per line
        const rgbString = rgbLines.join('\n');
        
        // Switch to RGB tab and populate the data
        this.switchTab('rgb');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();
        
        // Show success message
        this.showConversionMessage('BGR32 → RGB conversion completed!', 'success');
        
        console.log('Converted BGR32 to RGB hex:', rgbString);
    }

    convertBGR32ToRGB32() {
        const input = this.bgr32Palette.value.trim();
        if (!input) {
            alert('Please enter valid BGR32 colors first.');
            return;
        }

        // Convert BGR32 to RGB32 by swapping the first and third digits
        const colorStrings = input.split(/\s+/).filter(str => str.trim());
        const rgb32Colors = [];
        
        for (let i = 0; i < colorStrings.length; i++) {
            const colorStr = colorStrings[i].trim();
            if (colorStr.match(/^[0-9a-fA-F]{3}$/)) {
                // Swap BGR to RGB: BGR -> RGB
                const rgb32Color = colorStr[2] + colorStr[1] + colorStr[0];
                rgb32Colors.push(rgb32Color);
            }
        }
        
        // Format as space-separated
        const rgb32String = rgb32Colors.join(' ');
        
        // Switch to RGB32 tab and populate the data
        this.switchTab('rgb32');
        this.rgb32Palette.value = rgb32String;
        this.updateRGB32Preview();
        
        // Show success message
        this.showConversionMessage('BGR32 → RGB32 conversion completed!', 'success');
        
        console.log('Converted BGR32 to RGB32:', rgb32String);
    }

    convertBGR32ToCRAM() {
        const colors = this.parseBGR32Input();
        if (colors.length === 0) {
            alert('Please enter valid BGR32 colors first.');
            return;
        }

        // Convert BGR32 to Genesis CRAM format
        const cramBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Pack into Genesis 9-bit RGB format: BBBGGGRRR
            // Based on Python code: cram = (b3 << 9) | (g3 << 5) | (r3 << 1)
            const genesis16bit = (b3bit << 9) | (g3bit << 5) | (r3bit << 1);
            
            // Split into MSB and LSB bytes (big-endian to match reading)
            const msb = (genesis16bit >> 8) & 0xFF;
            const lsb = genesis16bit & 0xFF;
            
            cramBytes.push(msb.toString(16).padStart(2, '0').toUpperCase());
            cramBytes.push(lsb.toString(16).padStart(2, '0').toUpperCase());
        });
        
        // Format as space-separated hex values
        const cramString = cramBytes.join(' ');
        
        // Switch to Genesis CRAM tab and populate the data
        this.switchTab('genesis');
        this.genesisPalette.value = cramString;
        this.updateGenesisPreview();
        
        // Show success message
        this.showConversionMessage('BGR32 → Genesis CRAM conversion completed!', 'success');
        
        console.log('Converted BGR32 to Genesis CRAM:', cramString);
    }

    convertRGB32ToRGB() {
        const colors = this.parseRGB32Input();
        if (colors.length === 0) {
            alert('Please enter valid RGB32 colors first.');
            return;
        }

        // Convert RGB32 to RGB hex format
        const rgbLines = [];
        colors.forEach(color => {
            // The color is already converted to RGB by parseRGB32Input, so we can use it directly
            rgbLines.push(color);
        });
        
        // Format as one color per line
        const rgbString = rgbLines.join('\n');
        
        // Switch to RGB tab and populate the data
        this.switchTab('rgb');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();
        
        // Show success message
        this.showConversionMessage('RGB32 → RGB conversion completed!', 'success');
        
        console.log('Converted RGB32 to RGB hex:', rgbString);
    }

    convertRGB32ToBGR32() {
        const input = this.rgb32Palette.value.trim();
        if (!input) {
            alert('Please enter valid RGB32 colors first.');
            return;
        }

        // Convert RGB32 to BGR32 by swapping the first and third digits
        const colorStrings = input.split(/\s+/).filter(str => str.trim());
        const bgr32Colors = [];
        
        for (let i = 0; i < colorStrings.length; i++) {
            const colorStr = colorStrings[i].trim();
            if (colorStr.match(/^[0-9a-fA-F]{3}$/)) {
                // Swap RGB to BGR: RGB -> BGR
                const bgr32Color = colorStr[2] + colorStr[1] + colorStr[0];
                bgr32Colors.push(bgr32Color);
            }
        }
        
        // Format as space-separated
        const bgr32String = bgr32Colors.join(' ');
        
        // Switch to BGR32 tab and populate the data
        this.switchTab('bgr32');
        this.bgr32Palette.value = bgr32String;
        this.updateBGR32Preview();
        
        // Show success message
        this.showConversionMessage('RGB32 → BGR32 conversion completed!', 'success');
        
        console.log('Converted RGB32 to BGR32:', bgr32String);
    }

    convertRGB32ToCRAM() {
        const colors = this.parseRGB32Input();
        if (colors.length === 0) {
            alert('Please enter valid RGB32 colors first.');
            return;
        }

        // Convert RGB32 to Genesis CRAM format
        const cramBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Pack into Genesis 9-bit RGB format: BBBGGGRRR
            // Based on Python code: cram = (b3 << 9) | (g3 << 5) | (r3 << 1)
            const genesis16bit = (b3bit << 9) | (g3bit << 5) | (r3bit << 1);
            
            // Split into MSB and LSB bytes (big-endian to match reading)
            const msb = (genesis16bit >> 8) & 0xFF;
            const lsb = genesis16bit & 0xFF;
            
            cramBytes.push(msb.toString(16).padStart(2, '0').toUpperCase());
            cramBytes.push(lsb.toString(16).padStart(2, '0').toUpperCase());
        });
        
        // Format as space-separated hex values
        const cramString = cramBytes.join(' ');
        
        // Switch to Genesis CRAM tab and populate the data
        this.switchTab('genesis');
        this.genesisPalette.value = cramString;
        this.updateGenesisPreview();
        
        // Show success message
        this.showConversionMessage('RGB32 → Genesis CRAM conversion completed!', 'success');
        
        console.log('Converted RGB32 to Genesis CRAM:', cramString);
    }

    showConversionMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `conversion-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert after the current tab's input area
        const currentInput = this.currentFormat === 'rgb' ? this.rgbInput : this.genesisInput;
        currentInput.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    populateExampleData() {
        const rgbExample = `6d6d6d 000000 ffffff ffb66d b66d00 6d4900 ffff00 ffb600 ff0000 006dff 00ffff 00b6db 00ff6d 00b66d b6b6ff 6d6db6`;

        // Genesis CRAM example data (9-bit RGB format)
        const genesisExample = `06 66 00 00 0E EE 06 AE 00 6A 00 46 00 EE 00 AE 00 0E 0E 60 0E E0 0C A0 06 E0 06 A0 0E AA 0A 66`;

        // BGR32 example data (Blue-Green-Red order)
        const bgr32Example = `666 000 EEE 6AE 06A 046 0EE 0AE 00E E60 EE0 CA0 6E0 6A0 EAA A66`;

        // RGB32 example data (Red-Green-Blue order) - converted from BGR32
        const rgb32Example = `666 000 EEE A6E A60 640 E0E E0A E00 06E 0EE 0AC 0E6 0A6 AAE 66A`;

        // Set example data if fields are empty
        if (!this.rgbPalette.value) {
            this.rgbPalette.value = rgbExample;
            this.updateRGBPreview();
        }
        if (!this.genesisPalette.value) {
            this.genesisPalette.value = genesisExample;
            this.updateGenesisPreview();
        }
        if (!this.bgr32Palette.value) {
            this.bgr32Palette.value = bgr32Example;
            this.updateBGR32Preview();
        }
        if (!this.rgb32Palette.value) {
            this.rgb32Palette.value = rgb32Example;
            this.updateRGB32Preview();
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

        // Convert to Genesis 9-bit and populate Genesis input
        const genesisColors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert 8-bit RGB to 3-bit Genesis format (0-7)
            const r3bit = Math.min(7, Math.round(r / 36.43));
            const g3bit = Math.min(7, Math.round(g / 36.43));
            const b3bit = Math.min(7, Math.round(b / 36.43));
            
            // Pack into Genesis 9-bit RGB format: BBBGGGRRR
            // Based on Python code: cram = (b3 << 9) | (g3 << 5) | (r3 << 1)
            const genesis16bit = (b3bit << 9) | (g3bit << 5) | (r3bit << 1);
            
            // Convert to hex and format as MSB first (big-endian to match reading)
            const genesisHex = genesis16bit.toString(16).padStart(4, '0');
            const msb = genesisHex.substr(0, 2);
            const lsb = genesisHex.substr(2, 2);
            genesisColors.push(msb + ' ' + lsb);
        });

        const genesisString = genesisColors.join(' ');
        this.genesisPalette.value = genesisString;
        this.updateGenesisPreview();

        // Switch to Genesis tab to show the loaded data
        this.switchTab('genesis');
        
        console.log('Loaded TPL file with colors:', colors);
        console.log('Converted to Genesis:', genesisString);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GenesisPaletteConverter();
});
