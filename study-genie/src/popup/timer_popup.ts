const startStopTimerBtn = document.getElementById("start-stop-timer-btn")
const resetTimerBtn = document.getElementById("reset-timer-btn")


function getTimeRemaining(): number {
    const timeMinutes = document.getElementById("minutes");
    const timeSeconds = document.getElementById("seconds");

    // Return 25 minutes (1500 seconds) if either element is not found
    if (!timeMinutes || !timeSeconds) {
        return 60 * 25;
    }

    // Use optional chaining and nullish coalescing to handle null values
    const minutesText = timeMinutes.textContent ?? "0"; // Default to "0" if textContent is null
    const secondsText = timeSeconds.textContent ?? "0"; // Default to "0" if textContent is null

    const minutes = parseInt(minutesText, 10) || 0; // Default to 0 if parsing fails
    const seconds = parseInt(secondsText, 10) || 0; // Default to 0 if parsing fails

    return (60 * minutes) + seconds;
}

if (startStopTimerBtn) {
  startStopTimerBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "start/stop" });
    const timeRemaining = getTimeRemaining()
    chrome.storage.local.set({
        timeRemaining: timeRemaining
    })
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
  
    chrome.storage.local.get(["startTime", "totalTime", "isRunning", "timeRemaining"], (res) => {
      const timeMinutes = document.getElementById("minutes");
      if (!timeMinutes) return;
      const timeSeconds = document.getElementById("seconds");
      if (!timeSeconds) return;
  
      // console.log(`time remaining: ${res.timeRemaining}`)
  
      let timeLeft: number;
      if (res.isRunning && res.startTime) {
        const elapsedSeconds = Math.floor((Date.now() - res.startTime) / 1000);
        timeLeft = Math.max(0, res.timeRemaining - elapsedSeconds);
      } else {
        timeLeft = res.timeRemaining || 0;
      }

      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
      // console.log(`time remaining: ${minutes}:${seconds}`)
  
      timeMinutes.textContent = minutes;
      timeSeconds.textContent = seconds;
    });
  }
  
  updateTime();
  const timeUpdateInterval = setInterval(updateTime, 1000);
  
  // Cleanup interval when popup closes
  window.addEventListener('unload', () => {
    clearInterval(timeUpdateInterval);
  });