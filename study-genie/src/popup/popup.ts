import { initAI, generateFlashcards, generateQuestions, generateSummary, generateDefinitions} from '../components/nano.ts';

// Navigation functionality
function switchTab(tabName: string) {
  const tabs = document.querySelectorAll('.nav-tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    }
  });
  
  contents.forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tabName}-section`) {
      content.classList.add('active');
    }
  });
}

// Initialize everything when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AI
  initAI();
  
  // Add AI tools event listeners
  const flashcardsBtn = document.getElementById('generateFlashcards');
  const questionsBtn = document.getElementById('generateQuestions');
  const summaryBtn = document.getElementById('generateSummary');
  const definitionsBtn = document.getElementById('definitions');
  const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement | null;
  if (flashcardsBtn) {
    flashcardsBtn.addEventListener('click', generateFlashcards);
  }
  if (questionsBtn) {
    questionsBtn.addEventListener('click', generateQuestions);
  }
  if (summaryBtn) {
    summaryBtn.addEventListener('click', generateSummary);
  }
  if (definitionsBtn) {
    definitionsBtn.addEventListener('click', generateDefinitions);
  }
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadContent);
  } else {
    console.error('Download button not found!');
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

// Attach the function to the download button




  
  // Add navigation event listeners
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
      }
    });
  });
});