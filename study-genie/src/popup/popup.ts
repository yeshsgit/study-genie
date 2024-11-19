import { initAI, generateFlashcards, generateQuestions, generateSummary } from '../components/nano.ts';

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
  
  if (flashcardsBtn) {
    flashcardsBtn.addEventListener('click', generateFlashcards);
  }
  if (questionsBtn) {
    questionsBtn.addEventListener('click', generateQuestions);
  }
  if (summaryBtn) {
    summaryBtn.addEventListener('click', generateSummary);
  }
  
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