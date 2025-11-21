# FrndBoard
A fun, web-based soundboard that lets you turn your friends’ recorded sounds (meows, moos, weird noises or anything) into music. You can upload audio clips, assign them to pads, and play them live on an interactive grid. Built solely with frontend and browser audio APIs.

Try it out here :D - https://frndboard.netlify.app/

## Tech Stack & Tools

### Frontend
- **React.js** – Component-based UI development  
- **Tailwind CSS** – Utility-first styling  
- **JavaScript (ES6+)** – Logic, hooks, state management  
- **HTML5 / JSX** – UI structure  
- **CSS3** – Custom styling  

### Audio Processing
- **Web Audio API** – AudioContext, scheduling, playback  
- **WAV Export (Blob-based encoding)** – Client-side WAV rendering  
- **LameJS** – MP3 encoding  

### Build & Tooling
- **Create React App (CRA)** – Project scaffolding  
- **Node.js** – Runtime environment  
- **npm** – Package management  
- **ESLint** – Linting & code quality (via CRA)  

### Deployment
- **Git & GitHub** – Version control & repository hosting  
- **Netlify** – Hosting & continuous deployment  
---
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
