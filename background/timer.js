console.log("Imported timer.js")

const timerLongPeriod = 60 * 25
const timerShortPeriod = 60 * 5

function startStopTimer() {
    let response;
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
    chrome.storage.local.set({
        isRunning: true 
    });
    console.log("Timer started!");
}

function stopTimer() {
    chrome.storage.local.set({
        isRunning: false 
    });
    console.log("Timer stopped!");
}

function resetTimer() {
    chrome.storage.local.set({
        timer: timerLongPeriod,
        isRunning: false 
    });
    updatePopup(timerLongPeriod)
    console.log("Timer reset!");
}

function updatePopup(timeLeft, status) {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    chrome.runtime.sendMessage({timer: `${minutes}:${seconds}`});
}

chrome.storage.local.get(["timer", "isRunning"], (res) => {
    chrome.storage.local.set({
        timer: "timer" in res ? res.timer : timerLongPeriod,
        isRunning: "isRunning" in res ? res.isRunning : false,
    });
});

chrome.alarms.create("pomodoroTimer", {
    periodInMinutes: 1/60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pomodoroTimer") {
        chrome.storage.local.get(["timer", "isRunning"], (res) => {
            if (res.isRunning && res.timer > 0) {
                let timer = res.timer - 1;
                updatePopup(timer)
                console.log(timer)
                chrome.storage.local.set({
                    timer,
                });
            }
        });
    }
});

export { startStopTimer, resetTimer,updatePopup };
