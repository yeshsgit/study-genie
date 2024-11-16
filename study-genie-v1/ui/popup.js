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

function updateTime() {
    chrome.storage.local.get(["timer"], (res) => {
        const time = document.getElementById("time");
        timeLeft = res.timer
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        time.textContent = `${minutes}:${seconds}`;
    })
}

updateTime()
// setInterval(updateTime, 1000)