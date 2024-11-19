import {startStopTimer, resetTimer } from '../components/timer.ts';


chrome.runtime.onMessage.addListener(async (request) => {
    if (request.command === 'start/stop') {
        startStopTimer();
    }
    else if (request.command === 'reset') {
        resetTimer();
    }
    return true
});

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