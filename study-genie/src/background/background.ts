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