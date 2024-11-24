// AI Tools functionality
let aiSession: any = null;

async function initAI() {
  try {
    const { available } = await (window as any).ai.languageModel.capabilities();
    if (available === "no") {
      showError("AI model is not available on this device");
      return false;
    }

    aiSession = await (window as any).ai.languageModel.create({
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

async function generateFlashcards() {
  const textElement = document.getElementById('studyText') as HTMLTextAreaElement;
  const text = textElement?.value;
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Your goal is to generate 5 concise flashcards from the provided text.
Format each flashcard as a JSON object with two properties: "front" (containing a question or keyword) and "back" (containing a brief answer or definition). 
Output all flashcards as a list of JSON objects.

User: "Waves."
Response:
[
  {
    "front": "What are waves?",
    "back": "Waves are oscillations or vibrations about a rest position, transferring energy between stores."
  },
  {
    "front": "What is the difference between longitudinal and transverse waves?",
    "back": "In longitudinal waves, vibrations are parallel to wave travel direction. In transverse waves, they are at right angles."
  },
  {
    "front": "What do mechanical waves require to travel?",
    "back": "Mechanical waves require a medium (solid, liquid, or gas) to travel through."
  }
]

REMEMBER you must only return a list of json objects, nothing else.

Now, create 5 flashcards based on this text:
${text}`;

  try {
    showLoading();
    const result = await aiSession.prompt(prompt);
    const flashcards = JSON.parse(result);
    displayFlashcards(flashcards);
  } catch (error: any) {
    showError("Failed to generate flashcards: " + error.message);
  }
}

async function generateQuestions() {
  const textElement = document.getElementById('studyText') as HTMLTextAreaElement;
  const text = textElement?.value;
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Your goal is to generate 3 practice questions from the provided text.
Format each question as a JSON object with two properties: "question" (containing a question) and "answer" (containing a brief answer). 
Output all question as a list of JSON objects.

User: "Biology."
Response:
[
  { "question": "What is photosynthesis?", "answer": "The process by which green plants use sunlight to synthesize foods from carbon dioxide and water." },
  { "question": "Main function of the heart", "answer": "To pump blood throughout the body, supplying oxygen and nutrients." },
  { "question": "What does DNA stand for?", "answer": "The full form of DNA is Deoxyribonucleic acid." }
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

async function generateSummary() {
  const textElement = document.getElementById('studyText') as HTMLTextAreaElement;
  const text = textElement?.value;
  if (!text) {
    showError("Please enter some study material");
    return;
  }

  const prompt = `Create a concise summary of the key points from this text:
  ${text}`;

  try {
    showLoading();
    const result = await aiSession.prompt(prompt);
    displaySummary(result);
  } catch (error: any) {
    showError("Failed to generate summary: " + error.message);
  }
}

async function generateDefinitions() {
  const textElement = document.getElementById('studyText') as HTMLTextAreaElement;
  const text = textElement?.value;
  if (!text) {
    showError("Please enter some text to analyze for definitions");
    return;
  }

  const prompt = `Extract a list of 7 unique or uncommon keywords or terms from the following paragraph. For each keyword, provide a short and concise definition or explanation. Format the output as "keyword: definition".
  Paragraph:
  ${text}`;

  try {
    showLoading();
    const result = await aiSession.prompt(prompt);
    const dictionary = parseDefinitions(result);
    console.log(dictionary)
    displayDefinitions(dictionary);
  } catch (error: any) {
    showError("Failed to generate definitions: " + error.message);
  }
}

// function parseDefinitions(response: string): Record<string, string> {
//   const dictionary: Record<string, string> = {};
//   const lines = response.split('\n'); // Split response into lines.

//   for (const line of lines) {
//     const [keyword, ...definitionParts] = line.split(':'); // Split at the first colon.
//     if (keyword && definitionParts.length) {
//       const definition = definitionParts.join(':').trim(); // Rejoin the definition in case it contains colons.
//       dictionary[keyword.trim()] = definition;
//     }
//   }

//   return dictionary;
// }

function parseDefinitions(response: string): Record<string, string> {
  const dictionary: Record<string, string> = {};
  const lines = response.split('\n'); // Split response into lines.

  for (const line of lines) {
    // Remove all '*' characters from the line.
    const cleanedLine = line.replace(/\*/g, '').trim();

    // Only process lines that contain a colon (:) and are not empty after cleaning.
    if (cleanedLine.includes(':')) {
      const [keyword, ...definitionParts] = cleanedLine.split(':'); // Split at the first colon.
      if (keyword && definitionParts.length > 0) {
        const definition = definitionParts.join(':').trim(); // Rejoin the definition in case it contains colons.
        dictionary[keyword.trim()] = definition;
      }
    }
  }

  return dictionary;
}


function displayFlashcards(flashcards: any[]) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = '';
  flashcards.forEach((card, index) => {
    resultsDiv.innerHTML += `
      <div class="flashcard">
        <div class="front">${index + 1}. ${card.front}</div>
        <div class="back">${card.back}</div>
      </div>
    `;
  });
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
      ${summary}
    </div>
  `;
}

function displayDefinitions(dictionary: Record<string, string>) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  // Create a formatted HTML output for the dictionary
  const formattedOutput = Object.entries(dictionary)
    .map(([keyword, definition]) => `<strong>${keyword}</strong>: ${definition}`)
    .join('<br>');

  resultsDiv.innerHTML = `
    <div class="definitions">
      <h3>Definitions</h3>
      ${formattedOutput}
    </div>
  `;
}

function showError(message: string) {
  const errorDiv = document.getElementById('error');
  if (!errorDiv) return;
  
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
  
  resultsDiv.innerHTML = '<div class="loading">Generating...</div>';
}


export { generateFlashcards, generateQuestions, generateSummary, generateDefinitions, initAI };
