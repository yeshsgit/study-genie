console.log("Imported timer.js")

const timerLongPeriod = 60 * 25
// const timerShortPeriod = 60 * 5

function startStopTimer() {
    chrome.storage.local.get(["isRunning"], (res) => {
        if (res.isRunning === false) {
            startTimer();
        }
        else {
            stopTimer();
        }
    });
}

function startTimer() {
    const startTime = Date.now();
    chrome.storage.local.set({
        startTime,
        isRunning: true
    });

    console.log("Timer started!");
}

function stopTimer() {
    chrome.storage.local.get(['startTime', 'totalTime'], (res) => {
        if (res.startTime) {
            // const timeRemaining = getTimeRemaining(res.startTime, res.totalTime);
            chrome.storage.local.set({
                isRunning: false,
                // timeRemaining,
                startTime: undefined
            });
        }
    });
    console.log("Timer stopped!");
}

function resetTimer() {
    chrome.storage.local.set({
        startTime: undefined,
        isRunning: false,
        totalTime: timerLongPeriod,
        timeRemaining: timerLongPeriod
    });
    updatePopup(timerLongPeriod);
    console.log("Timer reset!");
}

function updatePopup(timeLeft: number) {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    chrome.runtime.sendMessage({timer: `${minutes}:${seconds}`});
}

chrome.storage.local.get(["timer", "isRunning"], (res) => {
    chrome.storage.local.set({
        timer: "timer" in res ? res.timer : timerLongPeriod,
        isRunning: "isRunning" in res ? res.isRunning : false,
    });
});

export { startStopTimer, resetTimer,updatePopup };
