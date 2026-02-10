// src/js/main.js

class MathSimApp {
    constructor() {
        this.canvas = document.getElementById('math-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mathRenderer = new MathRenderer(this.canvas, this.ctx);

        this.currentMode = 'welcome';
        this.equations = [];
        this.functions = [];

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.drawWelcomeScreen();
        this.setupMathJax();
        console.log('MathSim initialized');
    }


    setupMathJax() {
        if (window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.canvas.style.backgroundColor = '#f8f9fa';
    }

    setupEventListeners() {
        document.getElementById('start-algebra')?.addEventListener('click', () => this.startAlgebra());
        document.getElementById('start-graphing')?.addEventListener('click', () => this.startGraphing());
        document.getElementById('start-geometry')?.addEventListener('click', () => this.startGeometry());

        document.getElementById('add-equation')?.addEventListener('click', () => this.addEquation());
        document.getElementById('clear-all')?.addEventListener('click', () => this.clearAll());

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.redraw();
        });
    }


    startAlgebra() {
        this.currentMode = 'algebra';
        this.clearAll();
        this.drawAlgebraScene();
    }

    startGraphing() {
        this.currentMode = 'graphing';
        this.clearAll();
        this.drawGraphingScene();
    }

    startGeometry() {
        this.currentMode = 'geometry';
        this.clearAll();
        this.drawGeometryScene();
    }


    drawWelcomeScreen() {
        this.mathRenderer.clear();

        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.mathRenderer.renderEquation(
            'MathSim\\ Interactive\\ Platform',
            width / 2,
            height / 2 - 80,
            { fontSize: 32, color: '#166088', align: 'center' }
        );

        this.mathRenderer.renderEquation(
            'Visual\\ Mathematics\\ Learning',
            width / 2,
            height / 2 - 30,
            { fontSize: 20, color: '#4a6fa5', align: 'center' }
        );

        this.mathRenderer.renderEquation(
            'Select\\ a\\ simulation\\ mode\\ to\\ begin',
            width / 2,
            height / 2 + 60,
            { fontSize: 18, color: '#666', align: 'center' }
        );
    }

    drawAlgebraScene() {
        this.mathRenderer.clear();

        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.mathRenderer.renderEquation(
            '2x + 3 = 7',
            width / 2,
            60,
            { fontSize: 26, color: '#166088', align: 'center' }
        );

        this.drawAlgebraTiles();

        this.mathRenderer.renderEquation(
            'Drag\\ tiles\\ to\\ solve\\ the\\ equation',
            width / 2,
            height - 30,
            { fontSize: 16, color: '#666', align: 'center' }
        );
    }

    drawAlgebraTiles() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.ctx.fillStyle = 'rgba(74,111,165,0.1)';
        this.ctx.fillRect(50, 200, width / 2 - 100, height - 300);

        this.ctx.fillStyle = 'rgba(22,96,136,0.1)';
        this.ctx.fillRect(width / 2 + 50, 200, width / 2 - 100, height - 300);

        this.drawMathTile(width / 2 - 150, 280, 60, '#4a6fa5', 'x');
        this.drawMathTile(width / 2 - 80, 280, 60, '#4a6fa5', 'x');
        this.drawMathTile(width / 2 - 150, 360, 50, '#2a9d8f', '1');
        this.drawMathTile(width / 2 - 100, 360, 50, '#2a9d8f', '1');
        this.drawMathTile(width / 2 - 50, 360, 50, '#2a9d8f', '1');
    }

    drawGraphingScene() {
        this.mathRenderer.clear();

        this.mathRenderer.renderGraph({
            xMin: -8,
            xMax: 8,
            yMin: -8,
            yMax: 8,
            showGrid: true,
            showAxes: true,
            gridSpacing: 2
        });

        this.mathRenderer.plotFunction(x => 0.5 * x + 2, {
            color: '#e76f51',
            lineWidth: 3
        });

        this.mathRenderer.plotFunction(x => Math.sin(x), {
            color: '#2a9d8f',
            lineWidth: 2,
            dashed: true
        });

        this.mathRenderer.renderEquation(
            'Function\\ Graphing',
            this.canvas.width / 2 / (window.devicePixelRatio || 1),
            30,
            { fontSize: 20, color: '#166088', align: 'center' }
        );
    }

    drawGeometryScene() {
        this.mathRenderer.clear();

        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.mathRenderer.drawGeometryShape(
            { type: 'circle', x: width / 2 - 120, y: height / 2, radius: 70 },
            { color: '#e76f51', fill: true }
        );

        this.mathRenderer.drawGeometryShape(
            { type: 'rectangle', x: width / 2 + 40, y: height / 2 - 60, width: 120, height: 80 },
            { color: '#2a9d8f', fill: true, fillColor: 'rgba(42,157,143,0.2)' }
        );

        this.mathRenderer.renderEquation(
            'Geometry\\ Studio',
            width / 2,
            40,
            { fontSize: 24, color: '#166088', align: 'center' }
        );
    }


    drawMathTile(x, y, size, color, label) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${size * 0.4}px Cambria`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x + size / 2, y + size / 2);
    }

    addEquation() {
        const eqs = [
            'x^2 + 2x - 8 = 0',
            '\\sqrt{x + 3} = 5',
            '\\frac{2x + 1}{3} = 5'
        ];

        const eq = eqs[Math.floor(Math.random() * eqs.length)];
        const y = 120 + this.equations.length * 35;

        this.mathRenderer.renderEquation(
            eq,
            this.canvas.width / 2 / (window.devicePixelRatio || 1),
            y,
            { fontSize: 18, color: '#4a6fa5', align: 'center' }
        );

        this.equations.push(eq);
    }

    clearAll() {
        this.mathRenderer.clear();
        this.equations = [];
        this.functions = [];
    }

    redraw() {
        if (this.currentMode === 'algebra') this.drawAlgebraScene();
        else if (this.currentMode === 'graphing') this.drawGraphingScene();
        else if (this.currentMode === 'geometry') this.drawGeometryScene();
        else this.drawWelcomeScreen();
    }
}


window.addEventListener('DOMContentLoaded', () => {
    const app = new MathSimApp();
    window.mathSim = app;
});