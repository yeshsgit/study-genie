import { initAI, initSummariser, generateSummary, generateFlashcards, generateQuestions } from '../components/nano.ts';
import { showError, showLoading, displaySummary, displayFlashcards, displayQuestions } from './update-ui.ts';

// Global variables
let isSummariserReady: boolean | void = false;
let isAIReady: boolean | void = false;
let selectedText: string | null = null;

// Add AI button event listeners
const flashcardsBtn = document.getElementById('generateFlashcards');
const questionsBtn = document.getElementById('generateQuestions');
const summaryBtn = document.getElementById('generateSummary');

const AIStatusElement = document.getElementById('status');

if (AIStatusElement) {
  AIStatusElement.textContent = "AI not Ready";
}
initializeAI();

// Add message event listeners
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'sidepanelCommand') {

        if (message.command === "Generate Summary") {
            handleSummaryEvent(message.selectedText)
        }
        if (message.command === "Generate Flashcards") {
            handleFlashcardsEvent(message.selectedText)
        }
        if (message.command === "Generate Questions") {
          handleQuestionsEvent(message.selectedText)
        }
        if (message.command === "updateSidepanelSelectedText") {
            selectedText = message.selectedText
            showselectedText(message.selectedText)
        }
    }
});

const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement | null;

if (downloadButton) {
  downloadButton.addEventListener('click', downloadContent);
}
// Function to download the content
function downloadContent(): void {
  const resultDiv = document.getElementById('results') as HTMLElement | null;
  if (!resultDiv) {
    alert('Result div not found!');
    return;
  }
  const content = resultDiv.textContent || resultDiv.innerText;
  if (!content.trim()) {
    alert('No content available to download!');
    return;
  }
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


// Event listeners for AI buttons
if (flashcardsBtn) {
    flashcardsBtn.addEventListener('click', () => handleFlashcardsEvent(selectedText));
}
if (questionsBtn) {
    questionsBtn.addEventListener('click', () => handleQuestionsEvent(selectedText));
}
if (summaryBtn) {
    summaryBtn.addEventListener('click', () => handleSummaryEvent(selectedText));
}

// Functions to handle AI events
async function initializeAI() {
  isSummariserReady = await initSummariser().catch((error: any) => {
    showError("Failed to initialize AI Summariser: " + error.message);
  });
  isAIReady = await initAI().catch((error: any) => {
    showError("Failed to initialize AI: " + error.message);
  });
  if ((isSummariserReady === true) && (isAIReady === true)) {
    if (AIStatusElement) {
      AIStatusElement.textContent = "AI Ready";
    }
  } else {
      if (AIStatusElement) {
        AIStatusElement.textContent = "Problem with AI";
      }
  }
}
async function handleSummaryEvent(textForSummary: string | null = null) {
  showLoading(); 
    try {
      if (!textForSummary) throw Error("Please enter some study material");
      const stream = generateSummary(textForSummary)
      let result = '';
      let previousChunk = '';

      for await (const chunk of await stream) {
        const newChunk = chunk.startsWith(previousChunk)
        ? chunk.slice(previousChunk.length) : chunk;
        console.log(newChunk);
        result += newChunk;
        previousChunk = chunk;
        displaySummary(result);
      }

    } catch (error: any) {
      showError("Failed to generate summary: " +error.message);
    }
}
async function handleFlashcardsEvent(textForFlashcards: string | null = null) {
  showLoading();
  try {
    if (!textForFlashcards) throw Error("Please enter some study material");
    const flashcards = await generateFlashcards(textForFlashcards)
    displayFlashcards(flashcards)
  } catch (error: any) {
    showError("Failed to generate flashcards: " + error.message);
  }
}
async function handleQuestionsEvent(textForQuestions: string | null = null) {
  showLoading();
  try {
    if (!textForQuestions) throw Error("Please enter some study material");
    const questions = await generateQuestions(textForQuestions)
    displayQuestions(questions)
  } catch (error: any) {
    showError("Failed to generate questions: " + error.message);
  }
}

// Timer section

// Global variables
let isTimerExpanded = false;

const timerPreview = document.getElementById('timer-preview');
const timerSection = document.getElementById('timer-controls');
const minimise = document.getElementById('minimise-timer-btn');
const startStopTimerBtn = document.getElementById("start-stop-timer-btn")
const resetTimerBtn = document.getElementById("reset-timer-btn")

minimise?.addEventListener('click', () => {
    if (timerSection) {
        isTimerExpanded = false
        timerSection?.classList.remove('active');
        timerSection.style.display = 'none';
    }
});

if (timerPreview && timerSection) {

  timerPreview.addEventListener('click', () => {
    console.log("Timer is to be expanded");
    isTimerExpanded = !isTimerExpanded;

    if (isTimerExpanded) {
      timerSection.classList.add('active');
      timerSection.style.display = 'block';
    } else {
      timerSection.classList.remove('active');
      timerSection.style.display = 'none';
    }
  });
}

function getTimeRemaining(): number {
    const timeMinutes = document.getElementById("minutes");
    const timeSeconds = document.getElementById("seconds");

    // Return 25 minutes (1500 seconds) if either element is not found
    if (!timeMinutes || !timeSeconds) {
        return 60 * 25;
    }

    // Use optional chaining and nullish coalescing to handle null values
    const minutesText = timeMinutes.textContent ?? "0"; // Default to "0" if textContent is null
    const secondsText = timeSeconds.textContent ?? "0"; // Default to "0" if textContent is null

    const minutes = parseInt(minutesText, 10) || 0; // Default to 0 if parsing fails
    const seconds = parseInt(secondsText, 10) || 0; // Default to 0 if parsing fails

    return (60 * minutes) + seconds;
}

if (startStopTimerBtn) {
  startStopTimerBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "start/stop" });
    const timeRemaining = getTimeRemaining()
    chrome.storage.local.set({
        timeRemaining: timeRemaining
    })
  });
}

if (resetTimerBtn) {
  resetTimerBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "reset" });
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.timer) {
    const time = document.getElementById("time")
    if (time) {
      time.textContent = message.timer;
    }
  }
});

function updateTime() {
  
    chrome.storage.local.get(["startTime", "totalTime", "isRunning", "timeRemaining"], (res) => {
      const timeMinutes = document.getElementById("minutes");
      if (!timeMinutes) return;
      const timeSeconds = document.getElementById("seconds");
      if (!timeSeconds) return;
  
      let timeLeft: number;
      if (res.isRunning && res.startTime) {
        const elapsedSeconds = Math.floor((Date.now() - res.startTime) / 1000);
        timeLeft = Math.max(0, res.timeRemaining - elapsedSeconds);
      } else {
        timeLeft = res.timeRemaining || 0;
      }

      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
      // console.log(`time remaining: ${minutes}:${seconds}`)
  
      timeMinutes.textContent = minutes;
      timeSeconds.textContent = seconds;
    });
  }
  
  updateTime();
  const timeUpdateInterval = setInterval(updateTime, 1000);
  
  // Cleanup interval when popup closes
  window.addEventListener('unload', () => {
    clearInterval(timeUpdateInterval);
  });

// handles showing selected text
function showselectedText(selectedText: string) {
    const selectedTextDiv = document.getElementById('selectedText');
    if (!selectedTextDiv) return;
    if (selectedText!==''){
        const maxLength = 100;
        const isTruncated = selectedText.length > maxLength;
        const truncatedText = selectedText.slice(0, maxLength);

        selectedTextDiv.innerHTML = `
            <div class="loading">
                Text you have selected: 
                <span id="textContent">${isTruncated ? truncatedText : selectedText}</span>
                ${isTruncated ? `<button id="toggleTextBtn" class="toggle-btn">More</button>` : ''}
            </div>
        `;

        // handles showing selected text
        if (isTruncated) {
            const toggleTextBtn = document.getElementById('toggleTextBtn');
            let isExpanded = false; // State to track whether full text is shown or hidden

            toggleTextBtn?.addEventListener('click', () => {
                const textContentSpan = document.getElementById('textContent');
                if (textContentSpan) {
                    if (isExpanded) {
                        // Hide extra text
                        textContentSpan.textContent = truncatedText;
                        toggleTextBtn.textContent = 'More';
                    } else {
                        // Show full text
                        textContentSpan.textContent = selectedText;
                        toggleTextBtn.textContent = 'Less';
                    }
                    isExpanded = !isExpanded; // Toggle state
                }
            });
        }
    } else {
        selectedTextDiv.innerHTML = `<div></div>`;
    }
}
