# Pi Study Nook

build a complete 3-screen react prototype called compile (use the pi symbol in place of "pi")  using tailwind css and lucide icons. create a modern dark-mode layout with a clean navigation bar to switch between the screens.                                                                          screen 1 : Dashboard-  render a distraction free landing page split into two equal card. left card- a clean daily focus checklist where users add, toggle, clear to0do items.  right card- an interactive "quick scratchpad" text area for rapid temporary note-jotting.                               screen 2 : folder and intelligent notes hub left pane- a side bar with subject folders (physics, chemistry, maths) along with a plus icon to add more folders if need be.  clicking the folder changes the main panel view to show grid cards of existing saved documents in the subject. inside a specific subjects view add a prominent "[+] create new subject" button.  main area- (n ew notes vies) - a clean markdown style notepad editor.  include an " auto sort and save" button when clicked, trigger a 1.5-second loading spinner, apend a beautifully formatted markdown table of relevant academic formulas to the bottom of the text based on title of notes example for thermo dynamics add of thermo formulae, clear the editor and fire a success toast animation moving it to the correct folder.                                                                                                                                                   screen 3 : Focused Split-Screen Workspace

- Create a 50/50 split-screen environment.

- RIGHT HALF: A persistent floating scratchpad for typing lecture notes.

- LEFT HALF: An App Integration Dock with three tabs: [YouTube], [Files/PDF], [Notion Doc].

  1. YouTube Tab: Features a "No-Distraction Search Bar". Searching a topic displays 3 mock academic videos. Clicking "Watch" loads an embedded video. Add a toggle button called "✨ Fullscreen Focus Mode" that collapses the note editor completely, stretching the video player to 100% width. Ensure that if a video finishes, a clean "Lesson Complete" dark screen masks the entire iframe to prevent algorithm recommendations.

  2. Files/Notion Tab: A file list simulation displaying mock textbook PDFs. Clicking a file renders its text smoothly within the left window next to the note taker.

Ensure the entire app feels responsive, beautifully animated, and intuitive for a neurodivergent student preparing for tough exams.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pi-study-nook.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a7f749e1-3581-4ac3-be78-8b5b9033cc15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
