const startStopTimerBtn = document.getElementById("start-stop-timer-btn")
const resetTimerBtn = document.getElementById("reset-timer-btn")

if (startStopTimerBtn) {
    startStopTimerBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "start/stop" });
    });
}

if (resetTimerBtn) {
    resetTimerBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "reset" });
    });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.timer) {
        const time = document.getElementById("time")
        if (time) {
            time.textContent = message.timer;
        }
    }
});

function updateTime() {
    chrome.storage.local.get(["timer"], (res) => {
        const time = document.getElementById("time");
        let timeLeft = res.timer
        let minutes_raw = Math.floor(timeLeft / 60);
        let seconds_raw = timeLeft % 60;
        let minutes = minutes_raw < 10 ? '0' + minutes_raw : minutes_raw;
        let seconds = seconds_raw < 10 ? '0' + seconds_raw : seconds_raw;
        if (time) {
            time.textContent = `${minutes}:${seconds}`;
        }
    })
}

updateTime()
// setInterval(updateTime, 1000)