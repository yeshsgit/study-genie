// AI Tools functionality
let aiSession: any = null;

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


export { generateFlashcards, generateQuestions, generateSummary, initAI };


// prompt for definition generation... maybe

// role: "system", content: "Assistants goal is to identify challenging words and phrases from study material and providing brief informative explanations."

// role: "user", content:"Among various 2D materials, graphene has received extensive research attention in the last 2-3 decades due to its fascinating properties. The discovery of graphene provided an immense boost up and new dimension to materials research and nanotechnology. The multidisciplinary characteristics of graphene havea wide range of applications from health to aerospace. Modern graphene research has been directed towards the exploration of new graphene derivatives and their utilisations for fabrication of products and devices. The enhancement of graphene properties by functionalization or surface modification is another innovative approach. However, like other 2D materials, graphene research also needs amendments and up-gradation in the light of recent scientific output. In this contribution, we have reassessed the recent research output on graphene and graphene-based materials for applications in different fields. For the reader's comfort and to maintain lucidity, first, some fundamental aspects of graphene are discussed and then recent overviews in graphene research are explored in a systematic manner. Overall, this review article provides an outline of graphene in terms of fundamental properties, cutting-edge research and applications.
// "
// role: "assistant", content: "2D materials: Materials that have a thickness of only a few atomic layers, exhibiting unique properties due to their two-dimensional structure.

// Graphene: A single layer of carbon atoms arranged in a hexagonal lattice, known for its extraordinary electrical, thermal, and mechanical properties.

// Nanotechnology: A field of science and technology focused on the manipulation and application of materials at the nanoscale, typically below 100 nanometers.

// Multidisciplinary characteristics: The ability of graphene to find applications across diverse fields such as electronics, medicine, and aerospace due to its versatile properties.

// Graphene derivatives: Modified forms of graphene, such as graphene oxide or reduced graphene oxide, created to tailor its properties for specific applications."

// role: "user", content: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data."
