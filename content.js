// content.js for definations

function findDifficultWords() {
    const difficultWords = ["ephemeral", "ambivalent", "ameliorate", "perspicuous"];
    const bodyText = document.body.innerHTML;

    const regex = new RegExp(`\\b(${difficultWords.join('|')})\\b`, 'gi');
    const updatedText = bodyText.replace(regex, (word) => {
        return `<span class="difficult-word" data-word="${word.toLowerCase()}">${word}</span>`;
    });

    document.body.innerHTML = updatedText;
}
async function fetchDefinition(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";
    } catch (error) {
        console.error("Error fetching definition:", error);
        return "Definition not found.";
    }
}
async function generateDefinitions() {
    const difficultWordElements = document.querySelectorAll(".difficult-word");

    for (const element of difficultWordElements) {
        const word = element.getAttribute("data-word");
        const definition = await fetchDefinition(word);

        const tooltip = document.createElement("div");
        tooltip.className = "word-tooltip";
        tooltip.innerText = definition;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        element.addEventListener("mouseleave", () => {
            tooltip.remove();
        });
    }
}
function addGenerateButton() {
    const button = document.createElement("button");
    button.id = "generate-definitions-button";
    button.innerText = "Generate Definitions";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#007bff";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    button.addEventListener("click", () => {
        findDifficultWords();
        generateDefinitions();
    });

    document.body.appendChild(button);
}
addGenerateButton();
