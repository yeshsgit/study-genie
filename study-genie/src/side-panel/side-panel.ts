import { initAI, initSummariser, generateSummary, generateFlashcards, generateQuestions } from '../components/nano-updated.ts';

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
