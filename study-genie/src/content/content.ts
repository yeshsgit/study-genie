// Styles for the popup
const popupStyles = `
.sg-popup {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    padding: 8px;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
}

.sg-dropdown-trigger {
    cursor: pointer;
    padding: 4px;
    color: black;
}

.sg-dropdown-trigger:hover {
    background: #f0f0f0;
    border-radius: 3px;
}

.sg-dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: none;
    min-width: 150px;
}

.sg-dropdown-content.show {
    display: block;
}

.sg-dropdown-item {
    padding: 8px 12px;
    cursor: pointer;
    color: black;
}

.sg-dropdown-item:hover {
    background: #f0f0f0;
}

.sg-close-button {
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
    color: black;
}

.sg-close-button:hover {
    background: #f0f0f0;
    border-radius: 4px;
}`;

const statusPopupStyles = `
.sg-status-popup {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    z-index: 100000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    opacity: 0;
    transform: translateY(-8px);
}

.sg-status-popup.visible {
    opacity: 1;
    transform: translateY(0);
}

.sg-status-popup.loading {
    border-left: 4px solid #3498db;
}

.sg-status-popup.success {
    border-left: 4px solid #2ecc71;
}

.sg-status-popup.error {
    border-left: 4px solid #e74c3c;
}

.sg-status-popup .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #3498db;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;

const glossaryStyles = `
  .glossary-highlight {
    background-color: rgba(255, 220, 100, 0.6);
    cursor: help;
    position: relative;
    color: inherit;
    padding: 0 1px;
    transition: all 0.2s ease;
  }

  .glossary-highlight:hover {
    background-color: rgba(255, 220, 100, 0.85);
    border-bottom-color: rgba(255, 193, 7, 1);
  }

  .glossary-tooltip {
    position: fixed;
    padding: 12px 16px;
    background-color: #ffffff;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 
                0 2px 4px rgba(0, 0, 0, 0.08);
    z-index: 100000;
    max-width: 300px;
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #2c3e50;
    font-size: 14px;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    text-align: left;
    pointer-events: none;
  }

  .glossary-tooltip::before {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background-color: #ffffff;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.08);
  }

  .glossary-tooltip.visible {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  @media (prefers-color-scheme: dark) {
    .glossary-highlight {
      background-color: rgba(255, 220, 100, 0.3);
      border-bottom-color: rgba(255, 193, 7, 0.6);
    }

    .glossary-highlight:hover {
      background-color: rgba(255, 220, 100, 0.4);
      border-bottom-color: rgba(255, 193, 7, 0.8);
    }

    .glossary-tooltip {
      background-color: #2c3e50;
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 
                  0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .glossary-tooltip::before {
      background-color: #2c3e50;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = popupStyles + glossaryStyles + statusPopupStyles;
document.head.appendChild(styleSheet);

class SelectionPopup {
  private popup: HTMLDivElement | null = null;
  private dropdownContent: HTMLDivElement | null = null;
  private currentSelection: string = '';

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Open popup when highlighting text
    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection) {
          const SelectedText = selection.toString().trim();
          if (SelectedText) {
            this.currentSelection = SelectedText;
            this.showPopup(selection);
          }
        }
      }, 50);
    });

    // Close popup when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (this.popup && !this.popup.contains(e.target as Node)) {
        this.removePopup();
      }
    });
  }

  private showPopup(selection: Selection) {
    // Remove existing popup if any
    this.removePopup();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Create popup
    this.popup = document.createElement('div');
    this.popup.className = 'sg-popup';

    // Create dropdown trigger
    const dropdownTrigger = document.createElement('div');
    dropdownTrigger.className = 'sg-dropdown-trigger';
    dropdownTrigger.innerHTML = '▼';
    dropdownTrigger.addEventListener('mouseenter', () => this.showDropdown());
    this.popup.addEventListener('mouseleave', () => this.hideDropdown());


    // Create dropdown content
    this.dropdownContent = document.createElement('div');
    this.dropdownContent.className = 'sg-dropdown-content';

    // Dropdown items
    const items = ['Generate Flashcards', 'Generate Questions', 'Generate Summary'];
    items.forEach(item => {
      const dropdownItem = document.createElement('div');
      dropdownItem.className = 'sg-dropdown-item';
      dropdownItem.textContent = item;
      dropdownItem.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'aiCommand',
          aiCommand: item,
          selectedText: this.currentSelection
        }, async (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
          } else {
            console.log("Response:", response);
          }
        });
        this.removePopup();
      });
      this.dropdownContent?.appendChild(dropdownItem);
    });

    // Create close button
    const closeButton = document.createElement('div');
    closeButton.className = 'sg-close-button';
    closeButton.innerHTML = '✕';
    closeButton.addEventListener('click', () => this.removePopup());

    // Assemble popup
    this.popup.appendChild(dropdownTrigger);
    this.popup.appendChild(this.dropdownContent);
    this.popup.appendChild(closeButton);

    // Position popup under the selection
    this.popup.style.left = `${window.scrollX + rect.left}px`;
    this.popup.style.top = `${window.scrollY + rect.bottom + 5}px`;

    // Add to document
    document.body.appendChild(this.popup);

    // Send message to background script
    chrome.runtime.sendMessage({ type: 'highlightedText', selectedText: this.currentSelection }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Response:", response);
      }
    });
  }

  private showDropdown() {
    if (this.dropdownContent) {
      this.dropdownContent.classList.add('show');
    }
  }

  private hideDropdown() {
    if (this.dropdownContent) {
      this.dropdownContent.classList.remove('show');
    }
  }

  private removePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
      this.dropdownContent = null;
      this.currentSelection = '';
      chrome.runtime.sendMessage({ type: 'highlightedText', selectedText: '' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        } else {
          console.log("Response:", response);
        }
      });
    }
  }
}

class StatusPopup {
  private popup: HTMLDivElement | null = null;
  private hideTimeout: number | null = null;

  constructor() {
    this.injectStyles();
    this.createPopup();
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .sg-status-popup {
        position: fixed;
        top: 16px;
        right: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        background-color: #ffffff;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 100000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        opacity: 0;
        transform: translateY(-8px);
      }

      .sg-status-popup.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .sg-status-popup.loading {
        border-left: 4px solid #3498db;
      }

      .sg-status-popup.success {
        border-left: 4px solid #2ecc71;
      }

      .sg-status-popup.error {
        border-left: 4px solid #e74c3c;
      }

      .sg-status-popup .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #3498db;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  private createPopup() {
    this.popup = document.createElement('div');
    this.popup.className = 'sg-status-popup';
    document.body.appendChild(this.popup);
  }

  showLoading(message: string = 'Generating glossary...') {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    if (this.popup) {
      this.popup.className = 'sg-status-popup visible loading';
      this.popup.innerHTML = `
        <div class="spinner"></div>
        <span>${message}</span>
      `;
    }
  }

  showSuccess(message: string = 'Glossary generated!', duration: number = 3000) {
    if (this.popup) {
      this.popup.className = 'sg-status-popup visible success';
      this.popup.innerHTML = `
        <span>${message}</span>
      `;

      this.hideTimeout = window.setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  showError(message: string = 'Failed to generate glossary', duration: number = 5000) {
    if (this.popup) {
      this.popup.className = 'sg-status-popup visible error';
      this.popup.innerHTML = `
        <span>${message}</span>
      `;

      this.hideTimeout = window.setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  private hide() {
    if (this.popup) {
      this.popup.classList.remove('visible');
    }
  }
}

// Create a single instance of StatusPopup
const statusPopup = new StatusPopup();

function extractVisibleText(): string {
  // Elements that typically contain main content
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.main-content',
    '#main-content',
    '.post-content',
    '.article-content',
    '.content'
  ];

  // Elements to exclude
  const excludeSelectors = [
    'nav',
    'header',
    'footer',
    'cite',
    '#header',
    '#footer',
    '.nav',
    '.navigation',
    '.menu',
    '.sidebar',
    '[role="navigation"]',
    '[role="complementary"]',
    '.reference',
    'sup.reference',
    '[class*="nav"]'
  ];

  // Try to find main content container first
  let mainContent: Element | null = null;
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element;
      break;
    }
  }

  // If no main content container found, use body
  const contentContainer = mainContent || document.body;

  // Create a clone to modify
  const clonedContent = contentContainer.cloneNode(true) as HTMLElement;

  // Remove excluded elements from the clone
  excludeSelectors.forEach(selector => {
    const elements = clonedContent.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Function to get all text content from an element
  function getElementText(element: Element): string {
    // Skip if element is hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return '';
    }

    // Get text content including nested elements
    let text = '';
    element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent?.trim() || '';
        if (nodeText) text += nodeText + ' ';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip if it's a reference or footnote
        const el = node as Element;
        if (!el.classList.contains('reference') && !el.matches('sup.reference')) {
          text += getElementText(el as Element) + ' ';
        }
      }
    });
    return text.trim();
  }

  // Extract text from paragraphs and other content elements
  const textElements = clonedContent.querySelectorAll('p, li, article, section, span');
  const textContent: string[] = [];

  textElements.forEach(element => {
    const text = getElementText(element);
    if (text.length > 20) { // Only keep meaningful text chunks
      textContent.push(text);
    }
  });

  return textContent.join('\n\n').trim() || '';
}

async function getPageText(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isGlossaryActive"], (res) => {
      if (res.isGlossaryActive === true) {
        const text = extractVisibleText();
        console.log(`Extracted text: ${text.substring(0, 2000)}`);
        resolve(text);
      } else {
        console.log("Glossary not active")
        resolve(null);
      }
    });
  });
}

async function generateGlossary(extractedText: string) {
  try {
    const systemPrompt = `You are a precise and careful academic assistant. Your task is to analyze text and extract ONLY the most crucial technical terms and their definitions. Follow these strict rules:

1. ONLY include terms that are:
    - Explicitly defined or explained in the text
    - Central to understanding the main topic
    - Technical or domain-specific
    - Actually used in meaningful context (not just mentioned in passing)

2. DO NOT include:
    - Common words, even if they're long
    - Terms that appear but aren't crucial to the main topic
    - General vocabulary words
    - Terms without clear contextual definitions

3. Format Rules:
    - Output MUST be valid JSON
    - Format: {"term": "definition"}
    - Definitions must be concise (max 25 words)
    - Use the exact term as it appears in text
    - Definitions must reflect the specific context from the text

4. Quality Control:
    - Verify each term appears in the original text
    - Ensure definitions match the text's context
    - Limit to maximum 10-15 most important terms
    - When in doubt, exclude the term

Remember: It's better to return fewer, high-quality entries than many low-quality ones.`

    const initialPrompts: ( AILanguageModelAssistantPrompt | AILanguageModelUserPrompt )[] = [
      { role: "user", content: "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts, specialized organelles found in plant cells. During photosynthesis, plants use chlorophyll, a green pigment, to capture sunlight. The light energy is used to convert carbon dioxide and water into glucose and oxygen. This glucose serves as food for the plant, while the oxygen is released into the atmosphere as a byproduct. The process involves two main stages: the light-dependent reactions and the Calvin cycle." },
      { role: "assistant", content: 
`{
    "photosynthesis": "Process where plants convert light energy into chemical energy using carbon dioxide and water",
    "chloroplasts": "Specialized organelles in plant cells where photosynthesis occurs",
    "chlorophyll": "Green pigment in plants that captures sunlight for photosynthesis",
    "light-dependent reactions": "First stage of photosynthesis involving light energy capture",
    "Calvin cycle": "Second stage of photosynthesis where glucose is produced"
}` }
    ]

    const { available } = await window.ai.languageModel.capabilities();
    if (available === "no") {
      throw Error("AI model is not available on this device");
    }
    const glossaryAI = await window.ai.languageModel.create({
      systemPrompt: systemPrompt,
      initialPrompts: initialPrompts
    });
    console.log("Glossary AI created");

    const prompt = `Generate a dictionary of key words or phrases and their definitions from this study material:
REMEMBER you must only return a valid dictionary, nothing else.
${extractedText}`
    let glossary = await glossaryAI.prompt(prompt);
    console.log(`Raw glossary: ${glossary}`);

    if (glossary.startsWith("```json") && glossary.endsWith("```")) {
      glossary = glossary.slice(7, -3).trim(); // Remove the 7 characters for ```json and the last 3 for ```
  }
    const glossaryJSON: Record<string, string> = JSON.parse(glossary);
    // return glossaryJSON;
    const lowercaseGlossary: any = {};
    for (const [key, value] of Object.entries(glossaryJSON)) {
      lowercaseGlossary[key.toLowerCase()] = value;
    }
    return lowercaseGlossary;

  } catch (error: any) {
    console.error("Error generating glossary:", error);
  }
}

async function DynamicGlossary() {
  console.log("INSIDE DYNAMIC GLOSSARY GENERATION FUNCTION")
  statusPopup.showLoading();
  try {
    const text = await getPageText();
    console.log("FINISHED CALLING GET PAGE TEXT")
    if (!text) {
      console.log("No text found");
      statusPopup.showError("No text found on page");
    } else {
      console.log("glossary text found");
      const glossary = await generateGlossary(text);
      console.log(`glossary generated: ${JSON.stringify(glossary)}`);
      if (Object.keys(glossary || {}).length === 0) {
        statusPopup.showError("No glossary terms found");
      } else {
        injectGlossary(glossary);
        statusPopup.showSuccess(`Generated ${Object.keys(glossary).length} glossary terms`);
      }
    }
  } catch (error) {
    console.error("Error in DynamicGlossary:", error);
    statusPopup.showError("Failed to generate glossary");
  }
}

function createGlossaryTooltip(text: string, definition: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'glossary-highlight';
  span.textContent = text;

  const tooltip = document.createElement('div');
  tooltip.className = 'glossary-tooltip';
  tooltip.textContent = definition;
  
  // Add event listeners for better tooltip control
  let timeout: number;
  
  span.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    console.log(`Definition of ${text}: ${definition}`);
    
    const spanRect = span.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate tooltip dimensions
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    document.body.appendChild(tooltip);
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Default position (above the word)
    let top = spanRect.top - tooltipRect.height - 8;
    let left = spanRect.left + (spanRect.width / 2) - (tooltipRect.width / 2);
    
    // Check if tooltip would go above viewport
    if (top < 0) {
      // Try below
      top = spanRect.bottom + 8;
      
      // If below also doesn't fit, try right side
      if (top + tooltipRect.height > viewportHeight) {
        top = Math.max(0, spanRect.top);
        left = spanRect.right + 8;
        
        // If right side doesn't fit, try left side
        if (left + tooltipRect.width > viewportWidth) {
          left = Math.max(0, spanRect.left - tooltipRect.width - 8);
        }
      }
    }
    
    // Ensure tooltip stays within viewport bounds
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });

  span.addEventListener('mouseleave', () => {
    timeout = window.setTimeout(() => {
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    }, 200);
  });

  document.body.appendChild(tooltip);
  return span;
}

function processTextNode(node: Node, pattern: RegExp, glossary: Record<string, string>): DocumentFragment | null {
  const text = node.textContent;
  if (!text || !pattern.test(text)) return null;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  pattern.lastIndex = 0; // Reset regex state
  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const highlightSpan = createGlossaryTooltip(match[0], glossary[match[0].toLowerCase()]);
    fragment.appendChild(highlightSpan);
    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
}

function walkDOMTree(node: Node, pattern: RegExp, glossary: Record<string, string>) {
  if (node.nodeType === Node.TEXT_NODE) {
    const fragment = processTextNode(node, pattern, glossary);
    if (fragment) {
      node.parentNode?.replaceChild(fragment, node);
    }
  } else {
    // Skip script and style elements
    if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') return;

    // Recursively process child nodes
    for (const child of Array.from(node.childNodes)) {
      walkDOMTree(child, pattern, glossary);
    }
  }
}

function injectGlossaryStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = glossaryStyles;
  document.head.appendChild(styleSheet);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createKeywordPattern(keywords: string[]): RegExp {
  // Sort keywords by length (longest first) to ensure longer phrases are matched before shorter ones
  const sortedKeywords = keywords
    .map(k => escapeRegExp(k))
    .sort((a, b) => b.length - a.length);
    
  return new RegExp(`\\b(${sortedKeywords.join('|')})\\b`, 'gi');
}

function injectGlossary(glossary: Record<string, string>) {
  injectGlossaryStyles();
  
  const keywords = Object.keys(glossary);
  const pattern = createKeywordPattern(keywords);

  walkDOMTree(document.body, pattern, glossary);
}

// Initialize the selection popup and run the getPageText function on start
new SelectionPopup();
DynamicGlossary();

console.log('Selection popup script loaded');
