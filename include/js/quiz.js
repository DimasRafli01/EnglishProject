const MAX_QUESTIONS = 10;

let questions = [];
let allQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let shuffledOptionsOrder = [];

let score = 0;

// Mendapatkan elemen-elemen DOM
const questionSection = document.getElementById('questionSection');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const quizResults = document.getElementById('quizResults');
const scoreDisplay = document.getElementById('scoreDisplay');
const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
const feedbackMessage = document.getElementById('feedbackMessage');

// Fungsi untuk mengacak array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fungsi utama untuk memuat pertanyaan dari JSON
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

        // 1. Acak urutan pertanyaan
        const shuffledQuestionOrder = shuffleArray([...allQuestions]);
        questions = shuffledQuestionOrder.slice(0, MAX_QUESTIONS);

        // 2. Untuk setiap pertanyaan yang dipilih, acak juga urutan opsinya
        shuffledOptionsOrder = [];
        questions.forEach(q => {
            const originalOptions = [...q.options];
            const shuffled = shuffleArray(originalOptions);
            shuffledOptionsOrder.push(shuffled);
        });

        // Inisialisasi array jawaban pengguna
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

// Fungsi untuk menampilkan pertanyaan ke UI
function loadQuestion() {
    const q = questions[currentQuestionIndex];
    const currentOptions = shuffledOptionsOrder[currentQuestionIndex];

    questionSection.innerHTML = `
        <h2>Question No. ${currentQuestionIndex + 1} : ${q.question}</h2>
        <ul class="options-list">
            ${currentOptions.map((optionText, shuffledIndex) => `
                <li><button class="option-button" data-shuffled-index="${shuffledIndex}">${optionText}</button></li>
            `).join('')}
        </ul>
    `;

    // Tandai pilihan yang sudah dipilih pengguna sebelumnya
    const selectedShuffledIndex = userAnswers[currentQuestionIndex];
    if (selectedShuffledIndex !== null) {
        const buttons = questionSection.querySelectorAll('.option-button');
        buttons[selectedShuffledIndex].classList.add('selected');
    }

    attachOptionListeners();
    updateNavigationButtons();
    updateProgressBar();
}

// Fungsi untuk melampirkan event listener ke tombol pilihan jawaban
function attachOptionListeners() {
    const optionButtons = questionSection.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', function () {
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            userAnswers[currentQuestionIndex] = parseInt(this.dataset.shuffledIndex);
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

// Fungsi untuk menghitung skor akhir
function calculateScore() {
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const selectedShuffledIndex = userAnswers[i];
        const optionsInOrder = shuffledOptionsOrder[i];

        if (selectedShuffledIndex !== null) {
            const selectedAnswerText = optionsInOrder[selectedShuffledIndex];
            const correctAnswerText = question.options[question.answer];

            if (selectedAnswerText === correctAnswerText) {
                score++;
            }
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

// Event Listeners
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

nextBtn.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] === null && currentQuestionIndex < questions.length - 1) {
        showCustomAlert("Please select an answer first!");
        return;
    }

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        if (userAnswers[currentQuestionIndex] === null) {
            showCustomAlert("Please select an answer before finishing the quiz!");
            return;
        }
        showResults();
    }
});

submitBtn.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] === null) {
        showCustomAlert("Please select an answer before finishing the quiz!");
        return;
    }
    showResults();
});

// Fungsi untuk Custom Alert
function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f44336;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 1.1em;
        animation: fadeOut 3s forwards;
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

document.addEventListener('DOMContentLoaded', loadQuestions);
