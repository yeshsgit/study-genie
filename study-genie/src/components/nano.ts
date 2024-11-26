// AI Tools functionality
let aiSession: any = null;
let aiSummariser: any = null;

async function initAI() {
  try {
    const { available } = await window.ai.languageModel.capabilities();
    if (available === "no") {
      showError("AI model is not available on this device");
      return false;
    }

    aiSession = await window.ai.languageModel.create({
      systemPrompt: `You are an expert tutor helping students study effectively. 
      You can create flashcards, practice questions, and summaries from study material.
      Always be concise and focus on key concepts.`
    });
    
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = "AI Ready";
    }
    return true;
  } catch (error: any) {
    showError("Failed to initialize AI: " + error.message);
    return false;
  }
}

async function initSummariser() {
  try {
    const { available } = await window.ai.summarizer.capabilities();
    if (available === "no") {
      showError("AI Summarise is not available on this device");
      return false;
    }

    aiSummariser = await window.ai.summarizer.create({
      sharedContext: `You are an expert tutor helping students study effectively. 
      Your goal is to condense the information you are given into high quality plain text summaries.
      You must use only the information provided in the given material.
      Do not hallucinate and do not make up facts, details or any other information.
      Always be concise and focus on key concepts.
      If you cannot summarise the content due to any of the following reasons:
      1. Content is factually inaccurate
      2. Content does not contain any details to summarise
      Then reply with 'Cannot generate summary due to <reason for not generating summary>'`,
      
    });
    
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = "AI Summariser Ready";
    }
    return true;
  } catch (error: any) {
    showError("Failed to initialize AI Summariser: " + error.message);
    return false;
  }
}

async function generateFlashcards(text: string) {
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Your goal is to generate 5 concise flashcards from the provided text.
Format each flashcard as a dictionary where the key is the "front" (containing a question or keyword) and the value is the "back" (containing a brief answer or definition). 
Output all flashcards as a dictionary of key-value pairs.

User: "Waves."
Response:
{
  "What are waves?": "Waves are oscillations or vibrations about a rest position, transferring energy between stores.",
  "What is the difference between longitudinal and transverse waves?": "In longitudinal waves, vibrations are parallel to wave travel direction. In transverse waves, they are at right angles.",
  "What do mechanical waves require to travel?": "Mechanical waves require a medium (solid, liquid, or gas) to travel through."
}

REMEMBER you must only return a dictionary, nothing else.

Now, create flashcards based on this text:
${text}`;

  try {
    showLoading();
    const result = await aiSession.prompt(prompt);
    const flashcards = JSON.parse(result); // Parse as a dictionary
    renderFlashcards(flashcards); // Pass to side panel
  } catch (error: any) {
    showError("Failed to generate flashcards: " + error.message);
  }
}

function renderFlashcards(flashcards: Record<string, string>) {

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
        <button id="prevBtn" ${index === 0 ? "disabled" : ""}>Previous</button>
        <span>${index + 1} / ${flashcardArray.length}</span>
        <button id="nextBtn" ${
          index === flashcardArray.length - 1 ? "disabled" : ""
        }>Next</button>
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

async function generateQuestions(text: string) {
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Your goal is to generate 3 practice questions from the provided text.
Format each question as a JSON object with two properties: "question" (containing a question) and "answer" (containing a brief answer). 
Output all question as a list of JSON objects.

User: "The Document Object Model (DOM) is the data representation of the objects that comprise the structure and content of a document on the web. This guide will introduce the DOM, look at how the DOM represents an HTML document in memory and how to use APIs to create web content and applications."
Response:
[
  {
    "question": "What is the Document Object Model (DOM)?",
    "answer": "The DOM is the data representation of the objects that make up the structure and content of a document on the web."
  },
  {
    "question": "What does the DOM represent in memory?",
    "answer": "The DOM represents an HTML document in memory."
  },
  {
    "question": "What can you use DOM APIs for?",
    "answer": "DOM APIs can be used to create web content and applications."
  }
]

REMEMBER you must only return a list of json objects, nothing else.

Now, create 3 practice questions based on this text:
${text}`;

  try {
    showLoading();
    const result = await aiSession.prompt(prompt);
    const questions = JSON.parse(result);
    displayQuestions(questions);
  } catch (error: any) {
    showError("Failed to generate questions: " + error.message);
  }
}

async function generateSummary(text: string) {
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Generate a concise and factual summary of the key points from this material:
  ${text}`;

  let previousChunk = ''
  let result = ''

  try {
    showLoading();
    const stream = await aiSummariser.summarizeStreaming(prompt);
      // const stream = await aiSession.prompt(prompt);
    for await (const chunk of stream) {
      const newChunk = chunk.startsWith(previousChunk)
      ? chunk.slice(previousChunk.length) : chunk;
      console.log(newChunk);
      result += newChunk;
      previousChunk = chunk;

      displaySummary(result)
    }
  } catch (error: any) {
    showError("Failed to generate summary: " + error.message);
  }
}

function displayQuestions(questions: any[]) {
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

function displaySummary(summary: string) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = `
    <div class="summary">
      <span style="display:block" class="note">${summary}</span>
    </div>
  `;
}

function showError(message: string) {
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

function showLoading() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = '<div class="selectedText">Generating...</div>';
}

export { generateFlashcards, generateQuestions, generateSummary, initAI, initSummariser };