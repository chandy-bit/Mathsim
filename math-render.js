
class MathRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mathElements = new Map();
        this.fontSize = 16;
        this.fontFamily = 'Cambria, "Times New Roman", serif';
        this.init();
    }
    
    init() {
        // Load math fonts or prepare character sets
        this.prepareMathSymbols();
    }
    
    prepareMathSymbols() {
        // Common math symbols mapping
        this.symbols = {
            'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
            'epsilon': 'ε', 'theta': 'θ', 'lambda': 'λ', 'mu': 'μ',
            'pi': 'π', 'sigma': 'σ', 'phi': 'φ', 'omega': 'ω',
            'infinity': '∞', 'integral': '∫', 'sum': '∑', 'product': '∏',
            'sqrt': '√', 'partial': '∂', 'nabla': '∇', 'forall': '∀',
            'exists': '∃', 'emptyset': '∅', 'element': '∈', 'notelement': '∉',
            'subset': '⊂', 'superset': '⊃', 'union': '∪', 'intersection': '∩',
            'plusminus': '±', 'minusplus': '∓', 'times': '×', 'divide': '÷',
            'leq': '≤', 'geq': '≥', 'neq': '≠', 'approx': '≈',
            'rightarrow': '→', 'leftarrow': '←', 'Rightarrow': '⇒', 'Leftarrow': '⇐'
        };
    }
    
    renderEquation(equation, x, y, options = {}) {
        const {
            fontSize = this.fontSize,
            color = '#333',
            align = 'center',
            showSteps = false
        } = options;
        
        this.ctx.save();
        this.ctx.font = `${fontSize}px ${this.fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        
        // Parse and render the equation
        const parts = this.parseEquation(equation);
        let currentX = x;
        
        if (align === 'center') {
            const totalWidth = this.calculateEquationWidth(parts, fontSize);
            currentX = x - totalWidth / 2;
        } else if (align === 'right') {
            const totalWidth = this.calculateEquationWidth(parts, fontSize);
            currentX = x - totalWidth;
        }
        
        // Render each part
        parts.forEach(part => {
            this.renderEquationPart(part, currentX, y, fontSize, color);
            currentX += this.getPartWidth(part, fontSize);
        });
        
        this.ctx.restore();
        
        // Store for interaction
        const id = `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.mathElements.set(id, {
            equation,
            x, y,
            parts,
            fontSize,
            color,
            bounds: this.calculateEquationBounds(parts, x, y, fontSize, align)
        });
        
        return id;
    }
    
    parseEquation(equation) {
        // Simple equation parser - can be extended
        const parts = [];
        let current = '';
        let inScript = false;
        let scriptType = ''; // 'sup' or 'sub'
        
        for (let i = 0; i < equation.length; i++) {
            const char = equation[i];
            
            if (char === '^') {
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                scriptType = 'sup';
                inScript = true;
            } else if (char === '_') {
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                scriptType = 'sub';
                inScript = true;
            } else if (inScript && (char === ' ' || i === equation.length - 1)) {
                if (i === equation.length - 1) current += char;
                if (current) {
                    parts.push({ type: scriptType, content: current });
                    current = '';
                }
                inScript = false;
                scriptType = '';
            } else if (char === '/' && equation[i + 1] !== '/') {
                // Fraction detection (simple)
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                parts.push({ type: 'frac_start' });
            } else if (char === '(' || char === '[' || char === '{') {
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                parts.push({ type: 'paren', content: char, isOpen: true });
            } else if (char === ')' || char === ']' || char === '}') {
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                parts.push({ type: 'paren', content: char, isOpen: false });
            } else if (char === ' ') {
                if (current) {
                    parts.push({ type: 'text', content: current });
                    current = '';
                }
                parts.push({ type: 'space' });
            } else {
                current += char;
            }
        }
        
        if (current) {
            parts.push({ type: 'text', content: current });
        }
        
        return parts;
    }
    
    renderEquationPart(part, x, y, fontSize, color) {
        const ctx = this.ctx;
        
        switch (part.type) {
            case 'text':
                ctx.fillText(part.content, x, y);
                break;
                
            case 'sup':
                ctx.save();
                ctx.font = `${fontSize * 0.7}px ${this.fontFamily}`;
                ctx.fillText(part.content, x, y - fontSize * 0.3);
                ctx.restore();
                break;
                
            case 'sub':
                ctx.save();
                ctx.font = `${fontSize * 0.7}px ${this.fontFamily}`;
                ctx.fillText(part.content, x, y + fontSize * 0.2);
                ctx.restore();
                break;
                
            case 'frac_start':
                // Draw fraction line
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 5, y);
                ctx.lineTo(x + 25, y);
                ctx.stroke();
                ctx.restore();
                break;
                
            case 'paren':
                ctx.save();
                ctx.font = `${fontSize * 1.2}px ${this.fontFamily}`;
                ctx.fillText(part.content, x, y);
                ctx.restore();
                break;
                
            case 'space':
                // Just advance x position
                break;
        }
    }
    
    getPartWidth(part, fontSize) {
        this.ctx.save();
        this.ctx.font = `${fontSize}px ${this.fontFamily}`;
        
        let width;
        switch (part.type) {
            case 'text':
                width = this.ctx.measureText(part.content).width;
                break;
            case 'sup':
            case 'sub':
                this.ctx.font = `${fontSize * 0.7}px ${this.fontFamily}`;
                width = this.ctx.measureText(part.content).width;
                break;
            case 'frac_start':
                width = 30; // Fixed width for fraction line
                break;
            case 'paren':
                this.ctx.font = `${fontSize * 1.2}px ${this.fontFamily}`;
                width = this.ctx.measureText(part.content).width;
                break;
            case 'space':
                width = fontSize * 0.5;
                break;
            default:
                width = 0;
        }
        
        this.ctx.restore();
        return width;
    }
    
    calculateEquationWidth(parts, fontSize) {
        return parts.reduce((total, part) => {
            return total + this.getPartWidth(part, fontSize);
        }, 0);
    }
    
    calculateEquationBounds(parts, x, y, fontSize, align) {
        const width = this.calculateEquationWidth(parts, fontSize);
        const height = fontSize * 1.5;
        
        let left;
        switch (align) {
            case 'left':
                left = x;
                break;
            case 'center':
                left = x - width / 2;
                break;
            case 'right':
                left = x - width;
                break;
            default:
                left = x;
        }
        
        return {
            left,
            right: left + width,
            top: y - height / 2,
            bottom: y + height / 2,
            width,
            height
        };
    }
    
    renderLatex(latex, x, y, options = {}) {
        // Create a temporary div for MathJax rendering
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.innerHTML = `\\[${latex}\\]`;
        document.body.appendChild(tempDiv);
        
        // Use MathJax to render
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([tempDiv]).then(() => {
                // After rendering, we could capture as image or SVG
                // For now, we'll use the canvas renderer as fallback
                this.renderEquation(this.latexToPlain(latex), x, y, options);
            });
        } else {
            // Fallback to plain rendering
            this.renderEquation(this.latexToPlain(latex), x, y, options);
        }
        
        // Clean up
        setTimeout(() => document.body.removeChild(tempDiv), 1000);
    }
    
    latexToPlain(latex) {
        // Simple LaTeX to plain text conversion
        return latex
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
            .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
            .replace(/\\int/g, '∫')
            .replace(/\\sum/g, '∑')
            .replace(/\\prod/g, '∏')
            .replace(/\\infty/g, '∞')
            .replace(/\\pi/g, 'π')
            .replace(/\\theta/g, 'θ')
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\^\{([^}]+)\}/g, '^$1')
            .replace(/_\{([^}]+)\}/g, '_$1')
            .replace(/\\left\(/g, '(')
            .replace(/\\right\)/g, ')')
            .replace(/\\cdot/g, '·')
            .replace(/\\times/g, '×');
    }
    
    renderGraph(gridOptions = {}) {
        const {
            xMin = -10,
            xMax = 10,
            yMin = -10,
            yMax = 10,
            showGrid = true,
            showAxes = true,
            showLabels = true,
            gridSpacing = 1
        } = gridOptions;
        
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Coordinate transformation
        const scaleX = width / (xMax - xMin);
        const scaleY = height / (yMax - yMin);
        
        const toPixelX = (x) => (x - xMin) * scaleX;
        const toPixelY = (y) => height - (y - yMin) * scaleY;
        
        this.ctx.save();
        
        // Draw grid
        if (showGrid) {
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 0.5;
            
            // Vertical grid lines
            for (let x = Math.ceil(xMin); x <= xMax; x += gridSpacing) {
                if (Math.abs(x) < 0.001) continue; // Skip zero (will be axis)
                const pixelX = toPixelX(x);
                this.ctx.beginPath();
                this.ctx.moveTo(pixelX, 0);
                this.ctx.lineTo(pixelX, height);
                this.ctx.stroke();
                
                // Grid labels
                if (showLabels) {
                    this.ctx.fillStyle = '#666';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(x.toString(), pixelX, height - 5);
                }
            }
            
            // Horizontal grid lines
            for (let y = Math.ceil(yMin); y <= yMax; y += gridSpacing) {
                if (Math.abs(y) < 0.001) continue; // Skip zero
                const pixelY = toPixelY(y);
                this.ctx.beginPath();
                this.ctx.moveTo(0, pixelY);
                this.ctx.lineTo(width, pixelY);
                this.ctx.stroke();
                
                // Grid labels
                if (showLabels) {
                    this.ctx.fillStyle = '#666';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'right';
                    this.ctx.fillText(y.toString(), 5, pixelY + 4);
                }
            }
        }
        
        // Draw axes
        if (showAxes) {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            
            // X-axis
            const yAxisPixel = toPixelY(0);
            if (yAxisPixel >= 0 && yAxisPixel <= height) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, yAxisPixel);
                this.ctx.lineTo(width, yAxisPixel);
                this.ctx.stroke();
                
                // X-axis arrow
                this.ctx.beginPath();
                this.ctx.moveTo(width - 10, yAxisPixel - 5);
                this.ctx.lineTo(width, yAxisPixel);
                this.ctx.lineTo(width - 10, yAxisPixel + 5);
                this.ctx.fill();
            }
            
            // Y-axis
            const xAxisPixel = toPixelX(0);
            if (xAxisPixel >= 0 && xAxisPixel <= width) {
                this.ctx.beginPath();
                this.ctx.moveTo(xAxisPixel, 0);
                this.ctx.lineTo(xAxisPixel, height);
                this.ctx.stroke();
                
                // Y-axis arrow
                this.ctx.beginPath();
                this.ctx.moveTo(xAxisPixel - 5, 10);
                this.ctx.lineTo(xAxisPixel, 0);
                this.ctx.lineTo(xAxisPixel + 5, 10);
                this.ctx.fill();
            }
            
            // Origin label
            if (showLabels) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText('O', xAxisPixel - 5, yAxisPixel + 15);
                this.ctx.fillText('x', width - 5, yAxisPixel - 10);
                this.ctx.fillText('y', xAxisPixel + 10, 15);
            }
        }
        
        this.ctx.restore();
        
        return { toPixelX, toPixelY, scaleX, scaleY };
    }
    
    plotFunction(fn, options = {}) {
        const {
            color = '#e76f51',
            lineWidth = 3,
            xMin = -10,
            xMax = 10,
            step = 0.1,
            dashed = false
        } = options;
        
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        const scaleX = width / (xMax - xMin);
        const scaleY = height / 20; // Assuming y range of -10 to 10
        
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        
        if (dashed) {
            this.ctx.setLineDash([5, 5]);
        }
        
        this.ctx.beginPath();
        
        let firstPoint = true;
        for (let x = xMin; x <= xMax; x += step) {
            try {
                const y = fn(x);
                const pixelX = (x - xMin) * scaleX;
                const pixelY = height / 2 - y * scaleY;
                
                if (firstPoint) {
                    this.ctx.moveTo(pixelX, pixelY);
                    firstPoint = false;
                } else {
                    this.ctx.lineTo(pixelX, pixelY);
                }
            } catch (e) {
                // Function undefined at this point
                firstPoint = true;
            }
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawGeometryShape(shape, options = {}) {
        const {
            color = '#4a6fa5',
            fill = false,
            fillColor = 'rgba(74, 111, 165, 0.2)',
            lineWidth = 2
        } = options;
        
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        
        if (fill) {
            this.ctx.fillStyle = fillColor;
        }
        
        this.ctx.beginPath();
        
        switch (shape.type) {
            case 'circle':
                this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                break;
                
            case 'rectangle':
                this.ctx.rect(shape.x, shape.y, shape.width, shape.height);
                break;
                
            case 'polygon':
                shape.points.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.closePath();
                break;
                
            case 'line':
                this.ctx.moveTo(shape.x1, shape.y1);
                this.ctx.lineTo(shape.x2, shape.y2);
                break;
        }
        
        if (fill) {
            this.ctx.fill();
        }
        this.ctx.stroke();
        
        // Draw labels if provided
        if (shape.label) {
            this.ctx.fillStyle = color;
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(shape.label, shape.x, shape.y - 10);
        }
        
        this.ctx.restore();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mathElements.clear();
    }
}

// Export for use in main file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathRenderer;
}