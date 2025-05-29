const MAX_QUESTIONS = 10;

let questions = [];
let allQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

const questionSection = document.getElementById('questionSection');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const quizResults = document.getElementById('quizResults');
const scoreDisplay = document.getElementById('scoreDisplay');
const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
const feedbackMessage = document.getElementById('feedbackMessage');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadQuestions() {
    try {
        const response = await fetch('include/data/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allQuestions = await response.json();

        if (allQuestions.length === 0) {
            questionSection.innerHTML = "<p>Tidak ada pertanyaan yang tersedia.</p>";
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            prevBtn.style.display = 'none';
            progressBar.parentNode.style.display = 'none';
            return;
        }

        const shuffledQuestions = shuffleArray([...allQuestions]);
        questions = shuffledQuestions.slice(0, MAX_QUESTIONS);

        shuffledOptionsOrder = [];
        questions.forEach(q => {
            const originalOptions = [...q.options];
            const shuffled = shuffleArray(originalOptions);
            shuffledOptionsOrder.push(shuffled);
        });

        userAnswers = new Array(questions.length).fill(null);
        totalQuestionsDisplay.textContent = questions.length;

        loadQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        questionSection.innerHTML = "<p>Gagal memuat kuis. Silakan coba lagi nanti.</p>";
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'none';
        prevBtn.style.display = 'none';
        progressBar.parentNode.style.display = 'none';
    }
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionSection.innerHTML = `
        <h2>Question No. ${currentQuestionIndex + 1} : ${q.question}</h2>
        ${q.audio ? `<button id="playAudioBtn" style="background: none; border: none; cursor: pointer;"><img src="https://img.icons8.com/ios-filled/50/000000/speaker.png" alt="Play Audio" width="30" height="30"></button>` : ''}
        <ul class="options-list">
            ${q.options.map((option, index) => `
                <li><button class="option-button" data-index="${index}">${option}</button></li>
            `).join('')}
        </ul>
    `;

    const selectedAnswerIndex = userAnswers[currentQuestionIndex];
    if (selectedAnswerIndex !== null) {
        const buttons = questionSection.querySelectorAll('.option-button');
        buttons[selectedAnswerIndex].classList.add('selected');
    }

    attachOptionListeners();
    updateNavigationButtons();
    updateProgressBar();
}

function attachOptionListeners() {
    const optionButtons = questionSection.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', function () {
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            userAnswers[currentQuestionIndex] = parseInt(this.dataset.index);
        });
    });
}

function updateNavigationButtons() {
    prevBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
    nextBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'none' : 'inline-block';
    submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
}

function updateProgressBar() {
    if (questions.length === 0) {
        progressBar.style.width = '0%';
        return;
    }
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function calculateScore() {
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] !== null && userAnswers[i] === questions[i].answer) {
            score++;
        }
    }
    return score;
}

function showResults() {
    questionSection.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    progressBar.parentNode.style.display = 'none';
    quizResults.style.display = 'block';

    calculateScore();
    scoreDisplay.textContent = score;
    totalQuestionsDisplay.textContent = questions.length;

    if (score / questions.length >= 0.8) {
        feedbackMessage.textContent = "Excellent! You've mastered the material very well.";
        feedbackMessage.style.color = "#28a745";
    } else if (score / questions.length >= 0.5) {
        feedbackMessage.textContent = "Excellent! Keep learning and improving your skills.";
        feedbackMessage.style.color = "#ffc107";
    } else {
        feedbackMessage.textContent = "Don't give up! Keep practicing for better results.";
        feedbackMessage.style.color = "#dc3545";
    }
}

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

nextBtn.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] === null && currentQuestionIndex < questions.length - 1) {
        showCustomAlert("Mohon pilih jawaban terlebih dahulu!");
        return;
    }

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        if (userAnswers[currentQuestionIndex] === null) {
            showCustomAlert("Mohon pilih jawaban terlebih dahulu sebelum menyelesaikan kuis!");
            return;
        }
        showResults();
    }
});

submitBtn.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] === null) {
        showCustomAlert("Mohon pilih jawaban terlebih dahulu sebelum menyelesaikan kuis!");
        return;
    }
    showResults();
});

function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f44336; /* Merah */
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 1.1em;
        animation: fadeOut 3s forwards; /* Animasi fade out */
    `;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        if (alertBox.parentNode) {
            alertBox.parentNode.removeChild(alertBox);
        }
    }, 3000);

    const styleSheet = document.styleSheets[0];
    const keyframes = `
        @keyframes fadeOut {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    if (![...styleSheet.cssRules].some(rule => rule.name === 'fadeOut')) {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    }
}


// Panggil fungsi loadQuestions saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadQuestions);
