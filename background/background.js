import {startStopTimer, resetTimer, updatePopup} from './timer.js';


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command === 'start/stop') {
        startStopTimer();
    }
    else if (request.command === 'reset') {
        resetTimer();
    }
    return true
});