// Extract main content from the webpage
function getMainContent() {
    const content = document.body.innerText || "";
    return content.substring(0, 2000); // Send only the first 2000 characters for analysis.
}

// Send content to the background script
chrome.runtime.sendMessage({ type: "content", data: getMainContent() }, (response) => {
    console.log("Response from background script:", response);
});
