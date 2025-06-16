class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas не найден!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Не удалось получить контекст canvas!');
            return;
        }
        
        
        this.cities = [];
        this.edges = [];
        this.selectedCities = [];
        this.selectedEdges = [];
        this.optimalEdges = [];
        this.currentLevel = null;
        this.totalCost = 0;
        this.highlightedCity = null;
        this.cityRadius = 15;
        this.tutorial = null;
        
        
        this.canvas.width = 700;
        this.canvas.height = 500;
        
        
        window.addEventListener('resize', () => this.updateCanvasSize());
        this.updateCanvasSize();
        
        console.log('Canvas инициализирован:', this.canvas.width, this.canvas.height);
        
        this.fixedCities = {
            'tutorial': [
                { x: 100, y: 100 },
                { x: 300, y: 100 },
                { x: 200, y: 200 },
                { x: 400, y: 200 }
            ],
            'easy': [
                { x: 100, y: 100 },
                { x: 300, y: 100 },
                { x: 200, y: 200 },
                { x: 400, y: 200 },
                { x: 250, y: 300 }
            ],
            'medium': [
                { x: 100, y: 100 },
                { x: 300, y: 100 },
                { x: 500, y: 100 },
                { x: 200, y: 200 },
                { x: 400, y: 200 },
                { x: 300, y: 300 }
            ],
            'hard': [
                { x: 100, y: 100 },
                { x: 300, y: 100 },
                { x: 500, y: 100 },
                { x: 200, y: 200 },
                { x: 400, y: 200 },
                { x: 600, y: 200 },
                { x: 300, y: 300 },
                { x: 500, y: 300 }
            ]
        };

        
        this.fixedEdges = {
            'tutorial': [
                { from: 0, to: 1, weight: 2 },
                { from: 0, to: 2, weight: 3 },
                { from: 1, to: 2, weight: 4 },
                { from: 1, to: 3, weight: 5 },
                { from: 2, to: 3, weight: 6 }
            ],
            'easy': [
                { from: 0, to: 1, weight: 2 },
                { from: 0, to: 2, weight: 3 },
                { from: 1, to: 2, weight: 4 },
                { from: 1, to: 3, weight: 5 },
                { from: 2, to: 3, weight: 6 },
                { from: 2, to: 4, weight: 7 },
                { from: 3, to: 4, weight: 8 }
            ],
            'medium': [
                { from: 0, to: 1, weight: 4 },
                { from: 0, to: 2, weight: 6 },
                { from: 1, to: 2, weight: 6 },
                { from: 1, to: 3, weight: 5 },
                { from: 2, to: 4, weight: 6 },
                { from: 3, to: 4, weight: 5 },
                { from: 3, to: 5, weight: 6 },
                { from: 4, to: 5, weight: 4 },
                { from: 0, to: 3, weight: 7 },
                { from: 2, to: 5, weight: 8 }
            ],
            'hard': [
                { from: 0, to: 1, weight: 2 },
                { from: 0, to: 3, weight: 3 },
                { from: 1, to: 2, weight: 4 },
                { from: 1, to: 4, weight: 5 },
                { from: 2, to: 5, weight: 6 },
                { from: 3, to: 4, weight: 7 },
                { from: 3, to: 6, weight: 8 },
                { from: 4, to: 5, weight: 9 },
                { from: 4, to: 7, weight: 10 },
                { from: 5, to: 7, weight: 11 },
                { from: 6, to: 7, weight: 12 }
            ]
        };

     
        this.levelSettings = {
            'tutorial': {
                numCities: 4,
                description: 'Обучение: Соедините все города с минимальной стоимостью'
            },
            'easy': {
                numCities: 5,
                description: 'Легкий уровень: 5 городов'
            },
            'medium': {
                numCities: 6,
                description: 'Средний уровень: 6 городов'
            },
            'hard': {
                numCities: 8,
                description: 'Сложный уровень: 8 городов'
            },
            'random': {
                numCities: () => Math.floor(Math.random() * 3) + 6,
                description: 'Случайный уровень: 6-8 городов'
            }
        };
        
        this.setupEventListeners();
        this.setupMenuListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('newGame').addEventListener('click', () => {
            this.updateCanvasSize();
            this.newGame();
        });
        document.getElementById('checkSolution').addEventListener('click', () => this.checkSolution());
        document.getElementById('continueButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('backToLevels').addEventListener('click', () => {
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
        });
    }

    setupMenuListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
        });
        document.getElementById('exitButton').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                window.close();
            }
        });
        document.querySelectorAll('.level-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentLevel = e.target.dataset.level;
                document.getElementById('levelSelect').classList.add('hidden');
                document.getElementById('gameScreen').classList.remove('hidden');
                this.updateCanvasSize();
                this.newGame();
            });
        });
        document.getElementById('backToMenu').addEventListener('click', () => {
            document.getElementById('levelSelect').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
    }

    newGame() {
        this.cities = [];
        this.edges = [];
        this.selectedCities = [];
        this.selectedEdges = [];
        this.optimalEdges = [];
        this.totalCost = 0;
        this.highlightedCity = null;
        
        if (this.tutorial) {
            const tutorialContainer = document.getElementById('tutorialContainer');
            if (tutorialContainer) {
                tutorialContainer.remove();
            }
            this.tutorial = null;
        }
        
        const level = this.levelSettings[this.currentLevel];
        
        if (this.currentLevel !== 'random') {
            // Сохраняем координаты городов как относительные значения
            this.cities = this.fixedCities[this.currentLevel].map(coord => ({
                x: coord.x / 700,
                y: coord.y / 500
            }));
            this.edges = this.fixedEdges[this.currentLevel];
            this.findOptimalSolution();
        } else {
            const numCities = level.numCities();
            const gridCols = Math.ceil(Math.sqrt(numCities));
            const gridRows = Math.ceil(numCities / gridCols);
            const marginX = 0.07; // 7% от ширины
            const marginY = 0.07; // 7% от высоты
            const cellWidth = (1 - 2 * marginX) / (gridCols - 1);
            const cellHeight = (1 - 2 * marginY) / (gridRows - 1);
            for (let i = 0; i < numCities; i++) {
                const row = Math.floor(i / gridCols);
                const col = i % gridCols;
                const x = marginX + col * cellWidth;
                const y = marginY + row * cellHeight;
                this.cities.push({ x, y });
            }
            let attempts = 0;
            const maxAttempts = 10;
            let validSolution = false;
            while (!validSolution && attempts < maxAttempts) {
                this.edges = [];
                for (let i = 0; i < this.cities.length; i++) {
                    for (let j = i + 1; j < this.cities.length; j++) {
                        const weight = Math.floor(Math.random() * 9) + 1;
                        this.edges.push({ from: i, to: j, weight });
                    }
                }
                this.findOptimalSolution();
                const visited = new Set();
                const dfs = (city) => {
                    visited.add(city);
                    for (const edge of this.optimalEdges) {
                        if (edge.from === city && !visited.has(edge.to)) {
                            dfs(edge.to);
                        } else if (edge.to === city && !visited.has(edge.from)) {
                            dfs(edge.from);
                        }
                    }
                };
                if (this.cities.length > 0) {
                    dfs(0);
                    validSolution = visited.size === this.cities.length;
                }
                attempts++;
            }
            if (!validSolution) {
                this.currentLevel = 'medium';
                this.newGame();
                return;
            }
        }
        document.getElementById('levelDescription').textContent = level.description;
        document.getElementById('continueButton').classList.add('hidden');
        document.getElementById('current-cost').textContent = '0';
        if (this.currentLevel === 'tutorial') {
            this.tutorial = new Tutorial(this);
        }
        this.draw();
    }

    isCityOverlapping(x, y) {
        const minDistance = 100;
        return this.cities.some(city => {
            const dx = city.x - x;
            const dy = city.y - y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });
    }

    findOptimalSolution() {
        
        const sortedEdges = [...this.edges].sort((a, b) => a.weight - b.weight);
        
        
        const parent = new Array(this.cities.length);
        for (let i = 0; i < this.cities.length; i++) {
            parent[i] = i;
        }
        
        
        const find = (x) => {
            if (parent[x] !== x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        };
        
        
        const union = (x, y) => {
            parent[find(x)] = find(y);
        };
        
        
        for (const edge of sortedEdges) {
            if (find(edge.from) !== find(edge.to)) {
                this.optimalEdges.push(edge);
                union(edge.from, edge.to);
            }
        }
        
        
        const optimalCost = this.optimalEdges.reduce((sum, edge) => sum + edge.weight, 0);
        document.getElementById('optimal-cost').textContent = optimalCost;
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        let clickedCity = null;
        this.cities.forEach((city, index) => {
            const absX = city.x * this.canvas.width;
            const absY = city.y * this.canvas.height;
            const dx = absX - x;
            const dy = absY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.cityRadius * 2) {
                clickedCity = index;
            }
        });
        if (clickedCity !== null) {
            if (this.selectedCities.length === 0) {
                this.selectedCities = [clickedCity];
                this.highlightedCity = clickedCity;
            } else if (this.selectedCities.length === 1 && this.selectedCities[0] !== clickedCity) {
                const from = this.selectedCities[0];
                const to = clickedCity;
                const edge = this.edges.find(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
                if (edge) {
                    this.toggleEdge(edge);
                }
                this.selectedCities = [];
                this.highlightedCity = null;
            } else {
                this.selectedCities = [];
                this.highlightedCity = null;
            }
        } else {
            this.selectedCities = [];
            this.highlightedCity = null;
        }
        this.draw();
    }

    hasCycle(edge) {
        
        const graph = [...this.selectedEdges, edge];
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (city, parent) => {
            visited.add(city);
            recursionStack.add(city);

            for (const e of graph) {
                const nextCity = e.from === city ? e.to : e.from;
                if (e.from === city || e.to === city) {
                    if (!visited.has(nextCity)) {
                        if (dfs(nextCity, city)) {
                            return true;
                        }
                    } else if (recursionStack.has(nextCity) && nextCity !== parent) {
                        return true;
                    }
                }
            }

            recursionStack.delete(city);
            return false;
        };

        
        const citiesInEdge = new Set([edge.from, edge.to]);
        for (const e of this.selectedEdges) {
            citiesInEdge.add(e.from);
            citiesInEdge.add(e.to);
        }

        
        if (dfs(edge.from, null)) {
            return true;
        }

        
        if (!visited.has(edge.to)) {
            if (dfs(edge.to, null)) {
                return true;
            }
        }

        return false;
    }

    toggleEdge(edge) {
        const edgeIndex = this.selectedEdges.findIndex(e => 
            (e.from === edge.from && e.to === edge.to) || 
            (e.from === edge.to && e.to === edge.from)
        );
        
        if (edgeIndex === -1) {
            
            if (this.hasCycle(edge)) {
                
                const notification = document.createElement('div');
                notification.className = 'cycle-notification';
                notification.textContent = 'Обнаружен цикл! Это не оптимальное решение.';
                document.body.appendChild(notification);

                
                this.highlightCycle(edge);

                
                setTimeout(() => {
                    notification.remove();
                    this.draw(); 
                }, 3000);
                return;
            }

            this.selectedEdges.push(edge);
            this.totalCost += edge.weight;
        } else {
            this.selectedEdges.splice(edgeIndex, 1);
            this.totalCost -= edge.weight;
        }
        
        document.getElementById('current-cost').textContent = this.totalCost;
        
        if (this.currentLevel === 'tutorial') {
            this.checkTutorialProgress();
        }
    }

    highlightCycle(edge) {
        
        const tempEdges = [...this.selectedEdges, edge];
        const visited = new Set();
        const recursionStack = new Set();
        const cycleEdges = new Set();

        const dfs = (city, parent) => {
            visited.add(city);
            recursionStack.add(city);

            for (const e of tempEdges) {
                const nextCity = e.from === city ? e.to : e.from;
                if (e.from === city || e.to === city) {
                    if (!visited.has(nextCity)) {
                        if (dfs(nextCity, city)) {
                            cycleEdges.add(e);
                            return true;
                        }
                    } else if (recursionStack.has(nextCity) && nextCity !== parent) {
                        cycleEdges.add(e);
                        return true;
                    }
                }
            }

            recursionStack.delete(city);
            return false;
        };

        
        dfs(edge.from, null);

        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 4;
        for (const e of cycleEdges) {
            const fromCity = this.cities[e.from];
            const toCity = this.cities[e.to];
            const fromX = fromCity.x * this.canvas.width;
            const fromY = fromCity.y * this.canvas.height;
            const toX = toCity.x * this.canvas.width;
            const toY = toCity.y * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(toX, toY);
            this.ctx.stroke();
        }
    }

    checkTutorialProgress() {
        if (this.selectedEdges.length === 1) {
            const edge = this.selectedEdges[0];
            if (edge.from === 0 && edge.to === 1) {
                alert('Отлично! Теперь соедините город 2 с одним из уже соединенных городов.');
            }
        } else if (this.selectedEdges.length === 2) {
            const edge = this.selectedEdges[1];
            if (edge.from === 2 || edge.to === 2) {
                alert('Хорошо! Теперь добавьте последний город.');
            }
        }
    }

    checkSolution() {
        if (this.selectedEdges.length === 0) {
            alert('Выберите хотя бы одно ребро!');
            return;
        }

        
        const visited = new Set();
        const dfs = (city) => {
            visited.add(city);
            for (const edge of this.selectedEdges) {
                if (edge.from === city && !visited.has(edge.to)) {
                    dfs(edge.to);
                } else if (edge.to === city && !visited.has(edge.from)) {
                    dfs(edge.from);
                }
            }
        };

        if (this.cities.length > 0) {
            dfs(0);
            if (visited.size !== this.cities.length) {
                alert('Не все города соединены!');
                return;
            }
        }

        
        const isOptimal = this.selectedEdges.length === this.optimalEdges.length &&
            this.totalCost === this.optimalEdges.reduce((sum, edge) => sum + edge.weight, 0);

        if (isOptimal) {
            alert('Поздравляем! Вы нашли оптимальное решение!');
            document.getElementById('continueButton').classList.remove('hidden');
        } else {
            alert('Решение не оптимальное. Попробуйте еще раз!');
        }
    }

    nextLevel() {
        const levels = ['tutorial', 'easy', 'medium', 'hard', 'random'];
        const currentIndex = levels.indexOf(this.currentLevel);
        
        if (currentIndex < levels.length - 1) {
            this.currentLevel = levels[currentIndex + 1];
            document.getElementById('continueButton').classList.add('hidden');
            this.newGame();
        } else {
            alert('Поздравляем! Вы прошли все уровни!');
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const selectedCity = this.selectedCities.length === 1 ? this.selectedCities[0] : null;
        this.edges.forEach(edge => {
            const fromCity = this.cities[edge.from];
            const toCity = this.cities[edge.to];
            if (!fromCity || !toCity) return;
            const fromX = fromCity.x * this.canvas.width;
            const fromY = fromCity.y * this.canvas.height;
            const toX = toCity.x * this.canvas.width;
            const toY = toCity.y * this.canvas.height;
            const isSelected = this.selectedEdges.some(e => 
                (e.from === edge.from && e.to === edge.to) || 
                (e.from === edge.to && e.to === edge.from)
            );
            let highlight = false;
            if (selectedCity !== null && (edge.from === selectedCity || edge.to === selectedCity)) {
                highlight = true;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(toX, toY);
            if (isSelected) {
                this.ctx.strokeStyle = '#4CAF50';
                this.ctx.lineWidth = 4;
            } else if (highlight) {
                this.ctx.strokeStyle = '#2196F3'; 
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
            }
            this.ctx.stroke();
            if (selectedCity === null || highlight) {
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2;
                this.ctx.font = highlight ? 'bold 16px Arial' : '14px Arial';
                this.ctx.fillStyle = highlight ? '#e53935' : '#333';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(edge.weight.toString(), midX, midY);
            }
        });
        this.cities.forEach((city, index) => {
            const absX = city.x * this.canvas.width;
            const absY = city.y * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(absX, absY, this.cityRadius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(absX, absY, this.cityRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.selectedCities.includes(index) ? '#4CAF50' : '#fff';
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.fillStyle = '#333';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index.toString(), absX, absY);
        });
    }

    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;

        
        const scale = containerWidth / 700;
        this.cityRadius = Math.max(10, 15 * scale);

        
        if (this.cities && this.cities.length > 0) {
            this.draw();
        }
    }
}

window.addEventListener('load', () => {
    const game = new Game();
    game.updateCanvasSize();
    game.newGame();
}); 