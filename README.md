# study-genie

## Set-up Instructions
1. Clone repository.
2. Run `cd study-genie` to enter study genie directory.
3. Run `npm i` to install dependencies.
4. Build program into dist folder with `npm run build`.
5. Install chrome dev `https://www.google.com/chrome/dev/?extra=devchannel`
6. Open chrome and set the following flags:
7. Go to `chrome://flags/#optimization-guide-on-device-model` and set to "Enabled BypassPerfRequirement"
8. Go to `chrome://flags/#prompt-api-for-gemini-nano` and set to "Enabled".
9. Go to `chrome://flags/#summarization-api-for-gemini-nano` and set to "Enabled".
10. Got to `chrome://flags/#text-safety-classifier` and set to "Enabled Executes safety classifier but no retraction of output" (Avoids Untested Language Errors).
11. Navigate to `chrome://extensions` and enable developer mode.
12. Load Unpacked the dist folder that you created in step 4.

## How to use
1. Once the Study Genie is set up you can pin it for easier access.
2. Either select text and choose functionality from dropdown or paste text into the sidebar to generate flashcards, notes and practice questions.
3. Enable the dynamic glossary with the toggle at the top of the sidepanel for highlighted keywords and definitions on hover, all directly in the website.
4. Access the built in study timer by clicking on the time to reveal a drop down with timer controls.
