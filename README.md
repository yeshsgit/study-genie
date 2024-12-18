# Study Genie

## Setup Instructions
### Setup Chrome built in AI
The setup instructions are in google docs sheets.<br>
Navigate to the **Setup** section in each sheet and follow the instructions.<br>
Ensure you are using [Chrome Dev](https://www.google.com/chrome/dev/)
1. [Prompt API setup instructions](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0) <br>
2. [Summarisation API setup instrctions](https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0)<br>
3. Got to `chrome://flags/#text-safety-classifier` and set to "Enabled Executes safety classifier but no retraction of output" (Avoids Untested Language Errors).
### Setup Study Genie Chrome Extension
1. Clone repository.
2. Run `cd study-genie` to enter study genie directory.
3. Run `npm i` to install dependencies.
4. Build program into dist folder with `npm run build`.
5. Navigate to `chrome://extensions` and enable developer mode.
6. Load Unpacked the dist folder that you created in step 4.


## How to use
1. Once the Study Genie is set up you can pin it for easier access.
2. Either select text and choose functionality from dropdown or paste text into the sidebar to generate flashcards, notes and practice questions.
3. Enable the dynamic glossary with the toggle at the top of the sidepanel for highlighted keywords and definitions on hover, all directly in the website.
4. Access the built in study timer by clicking on the time to reveal a drop down with timer controls.

<img src="https://github.com/user-attachments/assets/7beb4843-e619-49db-8994-d0e68ea05732" alt="Study Genie UI" width="300" />
<img src="https://github.com/user-attachments/assets/501ef9a3-d3c6-4adb-9a38-8b9b79b82be5" alt ="Dynamic Glossary" width="400" />
<img src="https://github.com/user-attachments/assets/e5ece2f9-2f6e-428f-b471-fe98544cacb8" alt="Highlight text to chat" width="300" />
