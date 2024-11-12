const startStopTimerBtn = document.getElementById("start-stop-timer-btn")
const resetTimerBtn = document.getElementById("reset-timer-btn")

startStopTimerBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({command: "start/stop"});
});


resetTimerBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({command: "reset"});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.timer) {
        document.getElementById("time").textContent = message.timer;
    }
});