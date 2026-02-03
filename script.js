// 연락하기 폼 제출 시 메일을 받을 Formspree 폼 ID (https://formspree.io 에서 무료 가입 후 폼 생성 → ID 복사)
const FORMSPREE_FORM_ID = "YOUR_FORM_ID";

const quizData = [
  { meaning: "물", word: "みず" },
  { meaning: "불", word: "ひ" },
  { meaning: "산", word: "やま" },
  { meaning: "바다", word: "うみ" },
  { meaning: "하늘", word: "そら" },
  { meaning: "책", word: "ほん" },
  { meaning: "학교", word: "がっこう" },
  { meaning: "친구", word: "ともだち" },
  { meaning: "음식", word: "たべもの" },
  { meaning: "노래", word: "うた" },
  { meaning: "꽃", word: "はな" },
  { meaning: "고양이", word: "ねこ" },
  { meaning: "개", word: "いぬ" },
  { meaning: "시간", word: "じかん" },
  { meaning: "버스", word: "バス" },
  { meaning: "지하철", word: "ちかてつ" },
  { meaning: "여행", word: "りょこう" },
  { meaning: "음악", word: "おんがく" },
  { meaning: "영화", word: "えいが" },
  { meaning: "연필", word: "えんぴつ" }
];

const intro = document.getElementById("intro");
const quizScreen = document.getElementById("quizScreen");
const startQuizBtn = document.getElementById("startQuizBtn");
const questionCountSelect = document.getElementById("questionCount");
const quizSubtitle = document.getElementById("quizSubtitle");
const questionLabel = document.getElementById("questionLabel");
const questionText = document.getElementById("questionText");
const choicesBox = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const retryBtn = document.getElementById("retryBtn");
const scoreEl = document.getElementById("score");
const questionIndexEl = document.getElementById("questionIndex");
const questionTotalEl = document.getElementById("questionTotal");
const summary = document.getElementById("summary");
const summaryText = document.getElementById("summaryText");
const contactModal = document.getElementById("contactModal");
const contactBtn = document.getElementById("contactBtn");
const contactBtnQuiz = document.getElementById("contactBtnQuiz");
const contactModalClose = document.getElementById("contactModalClose");
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const contactSubmit = document.getElementById("contactSubmit");

let currentIndex = 0;
let score = 0;
let shuffledQuestions = [];
let answered = false;
let quizMode = "ko-ja"; // "ko-ja" | "ja-ko"

const shuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const generateWordChoices = (correctWord) => {
  const incorrect = shuffleArray(
    quizData.filter((item) => item.word !== correctWord)
  )
    .slice(0, 3)
    .map((item) => item.word);
  return shuffleArray([correctWord, ...incorrect]);
};

const generateMeaningChoices = (correctMeaning) => {
  const incorrect = shuffleArray(
    quizData.filter((item) => item.meaning !== correctMeaning)
  )
    .slice(0, 3)
    .map((item) => item.meaning);
  return shuffleArray([correctMeaning, ...incorrect]);
};

const updateStatus = () => {
  questionIndexEl.textContent = String(currentIndex + 1);
  questionTotalEl.textContent = String(shuffledQuestions.length);
  scoreEl.textContent = String(score);
};

const showSummary = () => {
  summary.style.display = "flex";
  summaryText.textContent = `총 ${shuffledQuestions.length}문제 중 ${score}개 맞혔어요!`;
};

const renderQuestion = () => {
  answered = false;
  feedback.textContent = "";
  nextBtn.disabled = true;
  choicesBox.innerHTML = "";

  const current = shuffledQuestions[currentIndex];
  const isKoToJa = quizMode === "ko-ja";

  if (isKoToJa) {
    questionLabel.textContent = "뜻";
    questionText.textContent = current.meaning;
    questionText.classList.remove("question-text--ja");
    const choices = generateWordChoices(current.word);
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "choice";
      button.textContent = choice;
      button.dataset.value = choice;
      button.addEventListener("click", () => handleChoice(button, choice, "word"));
      choicesBox.appendChild(button);
    });
  } else {
    questionLabel.textContent = "일본어 단어";
    questionText.textContent = current.word;
    questionText.classList.add("question-text--ja");
    const choices = generateMeaningChoices(current.meaning);
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "choice";
      button.textContent = choice;
      button.dataset.value = choice;
      button.addEventListener("click", () => handleChoice(button, choice, "meaning"));
      choicesBox.appendChild(button);
    });
  }

  updateStatus();
};

const handleChoice = (button, choice, type) => {
  if (answered) return;
  answered = true;

  const current = shuffledQuestions[currentIndex];
  const isCorrect = type === "word" ? choice === current.word : choice === current.meaning;
  const correctAnswer = type === "word" ? current.word : current.meaning;

  if (isCorrect) {
    score += 1;
    feedback.textContent = "정답입니다!";
    button.classList.add("correct");
  } else {
    feedback.textContent = `아쉽네요! 정답은 "${correctAnswer}" 입니다.`;
    button.classList.add("wrong");
    const correctButton = Array.from(choicesBox.children).find(
      (btn) => btn.dataset.value === correctAnswer
    );
    if (correctButton) {
      correctButton.classList.add("correct");
    }
  }

  nextBtn.disabled = false;
  updateStatus();
};

const startQuiz = (count, mode) => {
  quizMode = mode || document.querySelector('input[name="quizMode"]:checked')?.value || "ko-ja";
  const num = count == null ? quizData.length : Math.min(Number(count) || quizData.length, quizData.length);
  currentIndex = 0;
  score = 0;
  shuffledQuestions = shuffleArray(quizData).slice(0, num);
  summary.style.display = "none";
  intro.style.display = "none";
  quizScreen.classList.add("visible");
  document.body.classList.remove("intro-active");

  if (quizSubtitle) {
    quizSubtitle.textContent = quizMode === "ko-ja"
      ? "한국어 뜻을 보고 알맞은 일본어 단어를 골라주세요."
      : "일본어 단어를 보고 알맞은 한국어 뜻을 골라주세요.";
  }
  renderQuestion();
};

const showIntro = () => {
  intro.style.display = "block";
  quizScreen.classList.remove("visible");
  document.body.classList.add("intro-active");
};

nextBtn.addEventListener("click", () => {
  if (currentIndex < shuffledQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    choicesBox.innerHTML = "";
    questionText.textContent = "퀴즈가 끝났어요!";
    feedback.textContent = "";
    nextBtn.disabled = true;
    showSummary();
  }
});

startQuizBtn.addEventListener("click", () => {
  const count = questionCountSelect.value;
  const mode = document.querySelector('input[name="quizMode"]:checked')?.value || "ko-ja";
  startQuiz(count, mode);
});

restartBtn.addEventListener("click", () => showIntro());

retryBtn.addEventListener("click", () => {
  const count = questionCountSelect.value;
  const mode = document.querySelector('input[name="quizMode"]:checked')?.value || "ko-ja";
  startQuiz(count, mode);
});

questionTotalEl.textContent = String(quizData.length);
showIntro();

// 연락하기 모달
function openContactModal() {
  contactModal.classList.add("visible");
  contactModal.setAttribute("aria-hidden", "false");
  contactFormStatus.textContent = "";
  contactFormStatus.className = "contact-form-status";
  document.body.style.overflow = "hidden";
}

function closeContactModal() {
  contactModal.classList.remove("visible");
  contactModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

contactBtn.addEventListener("click", openContactModal);
if (contactBtnQuiz) contactBtnQuiz.addEventListener("click", openContactModal);
contactModalClose.addEventListener("click", closeContactModal);
contactModal.addEventListener("click", (e) => {
  if (e.target === contactModal) closeContactModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && contactModal.classList.contains("visible")) closeContactModal();
});

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!FORMSPREE_FORM_ID || FORMSPREE_FORM_ID === "YOUR_FORM_ID") {
    contactFormStatus.textContent = "메일 발송을 사용하려면 script.js 상단의 FORMSPREE_FORM_ID를 Formspree 폼 ID로 바꿔 주세요.";
    contactFormStatus.className = "contact-form-status error";
    return;
  }
  contactSubmit.disabled = true;
  contactFormStatus.textContent = "제출 중...";
  contactFormStatus.className = "contact-form-status";

  const formData = new FormData(contactForm);
  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.ok || !data.error)) {
      contactFormStatus.textContent = "제출되었습니다. 빠른 시일 내에 연락드리겠습니다.";
      contactFormStatus.className = "contact-form-status success";
      contactForm.reset();
    } else {
      contactFormStatus.textContent = data.error || "제출에 실패했습니다. 나중에 다시 시도해 주세요.";
      contactFormStatus.className = "contact-form-status error";
    }
  } catch (err) {
    contactFormStatus.textContent = "네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.";
    contactFormStatus.className = "contact-form-status error";
  }
  contactSubmit.disabled = false;
});
