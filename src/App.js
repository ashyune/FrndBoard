import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const empty_col = [null, null, null, null];
  const [tracks, setTracks] = useState([Array(4).fill(null)]);
  const [sounds, setSounds] = useState(["Meow", "Woof", "Moo"]);

  const soundFiles = {
    Meow: "/sounds/meow.mp3",
    Woof: "/sounds/woof.mp3",
    Moo: "/sounds/moo.mp3",
  };

  const [currentStep, setCurrentStep] = useState(0);
  const playbackInterval = useRef(null);

  // create audiocontext once
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const [audioBuffers, setAudioBuffers] = useState({});

  // semitones for each row (4 rows), top to bottom
  const semitonesPerRow = [6, 3, 0, -3]; 
    
  // preload all audio safely
  useEffect(() => {
    const loadAudio = async () => {
      const buffers = {};

      for (const sound of sounds) {
        try {
          console.log("Fetching:", soundFiles[sound]);

          const response = await fetch(soundFiles[sound]);
          console.log("Response status:", response.status);

          if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
          }

          const arrayBuffer = await response.arrayBuffer();
          const decoded = await audioContext.current.decodeAudioData(arrayBuffer);

          buffers[sound] = decoded;
          console.log("Decoded:", sound);

        } catch (err) {
          console.error("Error loading sound:", sound, err);
        }
      }

      setAudioBuffers(buffers);
    };

    loadAudio();
  }, []);

  // Play a sound
  const playSound = async (soundName, rowIndex = 2) => {
    const buffer = audioBuffers[soundName];
    if (!buffer) {
      console.warn("Sound not loaded:", soundName);
      return;
    }

    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }

    const source = audioContext.current.createBufferSource();
    source.buffer = audioBuffers[soundName];
    const semitones = semitonesPerRow[rowIndex];
    const playbackRate = Math.pow(2, semitones / 12); //this is some math formula for pitch shifting apparently ;-;
    source.playbackRate.value = playbackRate;

    source.connect(audioContext.current.destination);
    source.start();
  };

  const addTrack = () => {
    if(tracks.length >=8){
      alert("You can only add upto 8 tracks :3");
      return;
    }
    setTracks(prev => [...prev, Array(4).fill(null)]);
  };
  const beat_duration = 0.5; 
  const handlePlay = async () => {
    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }

    const startTime = audioContext.current.currentTime;

    for (let colIndex = 0; colIndex < tracks.length; colIndex++) {
      const column = tracks[colIndex];
      for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
        const soundName = column[rowIndex];
        if (!soundName) continue;

        const source = audioContext.current.createBufferSource();
        source.buffer = audioBuffers[soundName];
        source.playbackRate.value = Math.pow(2, semitonesPerRow[rowIndex] / 12);
        source.connect(audioContext.current.destination);

        source.start(startTime + colIndex * beat_duration); // first column plays immediately
      }
    }

    startVisualPlayhead();
    setTimeout(stopVisualPlayhead, tracks.length * beat_duration * 1000);
  };

  const handleUpload = async(e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await audioContext.current.decodeAudioData(arrayBuffer);

    setAudioBuffers((prev) => ({
      ...prev,
      [file.name]: decoded,
    }));

    setSounds(prev => [...prev, file.name]);
    console.log("Uploaded:", file.name);
  };

  const startVisualPlayhead = () => {
    if (playbackInterval.current) return;

    const interval = beat_duration * 1000; //basically converting to ms
    playbackInterval.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % tracks.length);
    }, interval);
  };
  
  const stopVisualPlayhead = () => {
    clearInterval(playbackInterval.current);
    playbackInterval.current = null;
    setCurrentStep(0);
  };

  return (
    
    <div className="min-h-screen bg-[#52357B] text-white flex flex-col p-10">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sounds={sounds}
        handleUpload={handleUpload}
      />

      <h1 className="text-6xl font-bold text-center text-[#B2D8CE] mb-10">
        FrndBoard
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={addTrack}
          disabled={tracks.length >= 8}
          className={`bg-[#648DB3] hover:bg-[#79b2c7] font-bold text-white px-6 py-2 rounded mr-4
            ${tracks.length >= 8 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#79b2c7]"}
          `}
        >
          Add Track
        </button>

        <button
          onClick={handlePlay}
          className="bg-[#648DB3] hover:bg-[#79b2c7] font-bold text-white px-6 py-2 rounded mr-4"
        >
           Play :D
        </button>
      </div>

      <div
        className="w-full max-w-4xl mx-auto grid gap-4"
        style={{ gridTemplateColumns: `repeat(${tracks.length}, 1fr)` }}
      >
        {tracks.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3">
            {column.map((slot, rowIndex) => (
              <div
                key={rowIndex}
                className={`h-16 bg-[#648DB3] rounded hover:bg-[#79b2c7] transition-all flex items-center justify-center
                  ${currentStep === colIndex ?
                    "bg-[#B2D8CE] scale-105 shadow-lg" : 
                    "bg-[#648DB3] hover:bg-[#79b2c7]"}
                  `}
                  
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const droppedSound = e.dataTransfer.getData("text/plain");
                  playSound(droppedSound, rowIndex);
                  const newTracks = [...tracks];
                  newTracks[colIndex][rowIndex] = droppedSound;
                  setTracks(newTracks);
                }}
                onClick={() => {
                  const sound = tracks[colIndex][rowIndex];
                  if (sound) playSound(sound, rowIndex);
                }}
              >
                {slot || "-"}
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
