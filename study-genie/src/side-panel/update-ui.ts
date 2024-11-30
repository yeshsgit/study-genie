/**
 * [Displays loading message in the side panel]
 * @returns {void}
 */
function showLoading(): void {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = '<div class="selectedText">Generating...</div>';
}


/**
 * [Displays error message in the side panel]
 * @param {string} message [Error message]
 * @returns {void}
 */
function showError(message: string): void {
    const errorDiv = document.getElementById('error');
    if (!errorDiv) return;
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="selectedText"></div>';
    
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    setTimeout(() => {
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    }, 5000);
  }

/**
 * [Displays summary in the side panel]
 * @param {string} summary 
 * @returns {void}
 */
function displaySummary(summary: string): void {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
      <div class="summary">
      <span style="display:block" class="note">${summary}</span>
      </div>
    `;
}

/**
 * [Displays questions and answers in the side panel]
 * @param {any[]} questions 
 * @returns {void}
 */
function displayQuestions(questions: any[]): void {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = '';
  questions.forEach((q, index) => {
    resultsDiv.innerHTML += `
      <div class="question">
        <div class="q-text">${index + 1}. ${q.question}</div>
        <div class="answer">${q.answer}</div>
      </div>
    `;
  });
}

/**
 * [Displays flashcards in the side panel]
 * @param {Record<string, string>} flashcards 
 * @returns {void}
 */
function displayFlashcards(flashcards: Record<string, string>[]): void {

  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  resultsDiv.innerHTML = ""; // Clear any existing content

  const flashcardArray = Object.entries(flashcards);
  let currentIndex = 0;

  function updateFlashcard(index: number) {
    const [front, back] = flashcardArray[index];
    if (!resultsDiv) return;
    resultsDiv.innerHTML = `
      <div class="flashcard">
        <div class="flashcard-inner">
          <div class="flashcard-front">${front}</div>
          <div class="flashcard-back">${back}</div>
        </div>
      </div>
      <div class="flashcard-navigation">
        <button id="prevBtn" ${index === 0 ? "disabled" : ""}>
          <i class="fas fa-arrow-left"></i>
        </button>
        <span>${index + 1} / ${flashcardArray.length}</span>
        <button id="nextBtn" ${
          index === flashcardArray.length - 1 ? "disabled" : ""}>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      <div class="flashcard-download">
        <button id="downloadBtn">Download</button>
      </div>  
    `;

    // Add flipping functionality
    const flashcard = resultsDiv.querySelector(".flashcard");
    if (flashcard) {
      flashcard.addEventListener("click", () => {
        flashcard.classList.toggle("flipped");
      });
    }

    // Add navigation event listeners
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const downloadBtn = document.getElementById("downloadBtn")
    
    prevBtn?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateFlashcard(currentIndex);
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (currentIndex < flashcardArray.length - 1) {
        currentIndex++;
        updateFlashcard(currentIndex);
      }
    });

    downloadBtn?.addEventListener("click", () => {
      downloadContent(flashcards)
    })
  }

  // Initialize with the first flashcard
  updateFlashcard(currentIndex);
}

function downloadContent(flashcards: any): void {

  const content = Object.entries(flashcards)
    .map(([question, answer]) => `${question}\t${answer}`)
    .join("\n");
  // Get the current date and time
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Format timestamp
  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = `flashcards_${timestamp}.txt`;
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke the object URL
  URL.revokeObjectURL(url);
}

export { showError, displaySummary, showLoading, displayFlashcards, displayQuestions };