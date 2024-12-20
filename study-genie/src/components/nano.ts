import dedent from "dedent";

// AI Tools functionality
let aiSession: any = null;
let aiSummariser: any = null;

async function initAI(systemPrompt: string | null = null, temporary: boolean = false): Promise<AILanguageModel | boolean> {
  try {
    const { available } = await window.ai.languageModel.capabilities();
    if (available === "no") {
      throw Error("AI model is not available on this device");
    }

    const defaultSystemPrompt = dedent`You are an expert tutor helping students study effectively. 
      You can create flashcards, practice questions, and summaries from study material.
      Always be concise and focus on key concepts.`
    systemPrompt = systemPrompt || defaultSystemPrompt

    if (temporary === true) {
      const tempAISession = await window.ai.languageModel.create({
        systemPrompt: systemPrompt
      });
      return tempAISession;
    }

    aiSession = await window.ai.languageModel.create({
      systemPrompt: systemPrompt
    });

    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = "AI Ready";
    }
    return true;
  } catch (error: any) {
    throw Error(error.message);
  }
}

async function initSummariser(): Promise<boolean> {
  try {
    const { available } = await window.ai.summarizer.capabilities();
    if (available === "no") {
      throw Error("AI Summarise is not available on this device");
    }

    aiSummariser = await window.ai.summarizer.create({
      sharedContext: dedent`You are an assistant designed to analyze study material and generate concise, structured notes to aid in learning. Your role is to identify the key points, concepts, and important information from the provided text and present them in an organized format. Focus on clarity, brevity, and relevance, avoiding unnecessary details or repetitive information. Structure the notes logically, using headings, bullet points, or numbered lists as appropriate.
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
    throw Error(error.message);
  }
}

async function generateFlashcards(text: string): Promise<Record<string, string>[]> {
  try {
    if (!text) {
      throw Error("Please enter some study material");
    }

    const prompt = dedent`Your goal is to generate 5 concise flashcards from the provided text.
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
    const result = await aiSession.prompt(prompt);
    const flashcards = JSON.parse(result); // Parse as a dictionary
    return flashcards;
  } catch (error: any) {
    throw Error(error.message);
  }
}

async function generateQuestions(text: string): Promise<any[]> {
  try {
    if (!text) {
      throw Error("Please enter some study material");
    }

    const prompt = dedent`Your goal is to generate 3 practice questions from the provided text.
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
    const result = await aiSession.prompt(prompt);
    const questions = JSON.parse(result);
    return questions;
  } catch (error: any) {
    throw Error(error.message);
  }
}

async function generateSummary(text: string): Promise<AsyncIterable<string>> {
  try {
    if (!text) {
      throw Error("Please enter some study material");
    }

    const prompt = dedent`Analyze the following study material and generate CONSICE AND FACTUALLY ACCURATE, structured notes. Ensure the notes capture the key concepts, definitions, examples (if applicable), and important points, while avoiding unnecessary details. Use headings, bullet points, and clear formatting for easy understanding. Structure the output as follows:
    # [Title or Topic of the Study Material]

    ### [Heading or Key Concept 1]
    - Point 1
    - Point 2
    - Example (if applicable)

    ### [Heading or Key Concept 2]
    - Point 1
    - Point 2
    - Example (if applicable)

    ### [Additional Headings or Key Concepts]
    - Point 1
    - Point 2
    - Example (if applicable)
    ...
    Make the notes comprehensive yet succinct, ensuring they are useful for study and revision purposes.
    
    Text:${text}`;

    const stream = await aiSummariser.summarizeStreaming(prompt);
    return stream;

  } catch (error: any) {
    throw Error(error.message);
  }
}

export { generateFlashcards, generateQuestions, generateSummary, initAI, initSummariser };