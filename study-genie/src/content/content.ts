
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
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = popupStyles;
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

function getPageText() {
    chrome.storage.local.get(["isGlossaryActive"], (res) => {
        if (res.isGlossaryActive === true) {
            console.log("Glossary active")
            let text = extractVisibleText();
            console.log(text.substring(0, 2000));
            chrome.runtime.sendMessage({
                type: 'genGlossary',
                text: text.substring(0, 2000)
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                } else {
                    console.log("Response:", response);
                }
            });
        } else {
            console.log("Glossary not active")
        }
    });
}

// Initialize the selection popup and run the getPageText function on start
new SelectionPopup();
getPageText();

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "getPageText") {
        console.log("Getting page text")
        getPageText();
    }
});

console.log('Selection popup script loaded');
