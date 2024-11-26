import { initAI, initSummariser, generateSummary, generateFlashcards, generateQuestions } from '../components/nano.ts';

initSummariser()
initAI()
let selectedText: string | null = null;
// Add AI button event listeners
const flashcardsBtn = document.getElementById('generateFlashcards');
const questionsBtn = document.getElementById('generateQuestions');
const summaryBtn = document.getElementById('generateSummary');

// Add message event listeners
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'sidepanelCommand') {

        if (message.command === "Generate Summary") {
            generateSummary(message.selectedText)
        }
        if (message.command === "Generate Flashcards") {
            generateFlashcards(message.selectedText)
        }
        if (message.command === "Generate Questions") {
            generateQuestions(message.selectedText)
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
    flashcardsBtn.addEventListener('click', () => {
        if (!selectedText) return;
        generateFlashcards(selectedText)
    });
}
if (questionsBtn) {
    questionsBtn.addEventListener('click', () => {
        if (!selectedText) return;
        generateQuestions(selectedText)
    });
}
if (summaryBtn) {
    summaryBtn.addEventListener('click', () => {
        if (!selectedText) return;
        generateSummary(selectedText)
    });
}

// Timer section
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
