import { startStopTimer, resetTimer } from '../components/timer.ts';

interface AppState {
  highlightedText: string;
}

let appState: AppState = {
  highlightedText: ''
};

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.command === 'start/stop') {
    startStopTimer();
  }
  else if (message.command === 'reset') {
    resetTimer();
  }

  if (message.type === 'aiCommand') {
    appState.highlightedText = message.selectedText
    if (sender.tab?.id) {
      sendResponse({ response: `AI command: ${message.aiCommand}\n, Text: ${message.selectedText}` });

      await chrome.sidePanel.open({ tabId: sender.tab.id })

      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "sidepanelCommand",
          command: message.aiCommand,
          selectedText: message.selectedText
        })
      }, 500)


    } else {
      sendResponse({ response: "Command failed tabid does not exist." });
    }
  }

  if (message.type === 'highlightedText') {
    appState.highlightedText = message.selectedText;
    chrome.runtime.sendMessage({
      type: "sidepanelCommand",
      command: "updateSidepanelSelectedText",
      selectedText: message.selectedText
    })
    if (sender.tab?.id) {
      sendResponse({ response: `Highlighted text updated to: ${message.selectedText}` });
    }
  }

  if (message.type === 'activateGlossary') {
    console.log("Activating Glossary command received");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab =  tabs[0];
      console.log(activeTab);
      if (activeTab.id) {
        console.log(`Activating Glossary on tab ${activeTab.id}`);
        chrome.tabs.sendMessage(activeTab.id, { action: 'ACTIVATE_GLOSSARY' });
      }
    });
  }
});

// Initialise Glossary state
chrome.storage.local.get(["isGlossaryActive"], (res) => {
  chrome.storage.local.set({
    isGlossaryActive: res.isGlossaryActive || false,
  });
});

// Timer functionality
const timerLongPeriod = 60 * 25

interface TimerState {
  startTime?: number;
  isRunning: boolean;
  totalTime: number;
  timeRemaining: number;
}

function getTimeRemaining(startTime: number, totalTime: number): number {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, totalTime - elapsedSeconds);
}

// Initialize timer state
chrome.storage.local.get(["startTime", "isRunning", "totalTime", "timeRemaining"], (res) => {
  const state: TimerState = {
    startTime: res.startTime,
    isRunning: res.isRunning || false,
    totalTime: res.totalTime || timerLongPeriod,
    timeRemaining: res.timeRemaining || timerLongPeriod
  };
  chrome.storage.local.set({
    startTime: state.startTime,
    isRunning: state.isRunning,
    totalTime: state.totalTime,
    timeRemaining: state.timeRemaining
  })

  if (state.isRunning && state.startTime) {
    const timeRemaining = getTimeRemaining(state.startTime, state.totalTime);
    if (timeRemaining > 0) {
      return;
    } else {
      // Timer has ended while extension was inactive
      resetTimer();
    }
  }
});