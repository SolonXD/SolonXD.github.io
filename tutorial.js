class Tutorial {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.steps = [
            {
                message: "Добро пожаловать в игру Краскала! Давайте научимся играть.",
                highlight: null
            },
            {
                message: "Алгоритм Краскала - это алгоритм поиска минимального остовного дерева в графе. Он работает следующим образом:\n\n1. Сортируем все дороги по их длине\n2. Начинаем с пустого графа\n3. Добавляем дороги по одной, начиная с самых коротких\n4. Пропускаем дороги, которые создают цикл\n5. Продолжаем, пока не соединим все города",
                highlight: null
            },
            {
                message: "В нашем случае:\n- Вершины - это города\n- Рёбра - это дороги между городами\n- Вес ребра - это длина дороги\n\nНаша цель - соединить все города между собой дорогами так, чтобы общая длина дорог была минимальной.",
                highlight: null
            },
            {
                message: "Перед вами 4 города. Ваша задача - соединить их между собой дорогами так, чтобы общая длина дорог была минимальной.",
                highlight: null
            },
            {
                message: "Нажмите на два города, чтобы построить между ними дорогу. Длина дороги показана на ребре.\n\nПопробуйте найти оптимальное решение самостоятельно!",
                highlight: null,
                isLast: true
            }
        ];
        
        this.setupTutorialUI();
    }

    setupTutorialUI() {
        
        const overlay = document.createElement('div');
        overlay.id = 'tutorialOverlay';
        overlay.className = 'tutorial-overlay';
        
        
        const tutorialContainer = document.createElement('div');
        tutorialContainer.id = 'tutorialContainer';
        tutorialContainer.className = 'tutorial-container';
        
        
        const messageElement = document.createElement('div');
        messageElement.id = 'tutorialMessage';
        messageElement.className = 'tutorial-message';
        
        
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'tutorial-navigation';
        
        const prevButton = document.createElement('button');
        prevButton.id = 'prevTutorialStep';
        prevButton.textContent = '← Назад';
        prevButton.className = 'tutorial-button';
        
        const nextButton = document.createElement('button');
        nextButton.id = 'nextTutorialStep';
        nextButton.textContent = 'Далее →';
        nextButton.className = 'tutorial-button';
        
        const closeButton = document.createElement('button');
        closeButton.id = 'closeTutorial';
        closeButton.textContent = 'Начать игру';
        closeButton.className = 'tutorial-button tutorial-button-close hidden';
        
        navigationContainer.appendChild(prevButton);
        navigationContainer.appendChild(nextButton);
        navigationContainer.appendChild(closeButton);
        
        tutorialContainer.appendChild(messageElement);
        tutorialContainer.appendChild(navigationContainer);
        
        overlay.appendChild(tutorialContainer);
        
        
        document.querySelector('.game-info').appendChild(overlay);
        
        
        prevButton.addEventListener('click', () => this.previousStep());
        nextButton.addEventListener('click', () => this.nextStep());
        closeButton.addEventListener('click', () => this.closeTutorial());
        
        
        this.showCurrentStep();
    }

    showCurrentStep() {
        const step = this.steps[this.currentStep];
        const messageElement = document.getElementById('tutorialMessage');
        messageElement.textContent = step.message;
        
        
        const prevButton = document.getElementById('prevTutorialStep');
        const nextButton = document.getElementById('nextTutorialStep');
        const closeButton = document.getElementById('closeTutorial');
        
        prevButton.disabled = this.currentStep === 0;
        nextButton.disabled = !this.canProceed();
        
        
        if (step.isLast) {
            nextButton.classList.add('hidden');
            closeButton.classList.remove('hidden');
        } else {
            nextButton.classList.remove('hidden');
            closeButton.classList.add('hidden');
        }
    }

    canProceed() {
        const step = this.steps[this.currentStep];
        if (!step.validate) return true;
        return step.validate();
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showCurrentStep();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showCurrentStep();
        }
    }

    closeTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    reset() {
        this.currentStep = 0;
        this.showCurrentStep();
    }
} 