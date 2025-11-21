import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import LetterAnim from "./components/LetterAnim";
import Instructions from "./components/Instructions";

import toWav from "audiobuffer-to-wav";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  const [tracks, setTracks] = useState([Array(4).fill(null)]);
  const [sounds, setSounds] = useState(["Meow", "Woof1", "Woof2", "Moo"]);
  const [uploadedSounds, setUploadedSounds] = useState([]);

  const soundFiles = {
    Meow: "/sounds/meow.mp3",
    Woof1: "/sounds/woof1.mp3",
    Woof2: "/sounds/woof2.mp3",
    Moo: "/sounds/moo.mp3",
  };

  const [currentStep, setCurrentStep] = useState(0);
  const playbackInterval = useRef(null);

  // create audiocontext once
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const [audioBuffers, setAudioBuffers] = useState({});

  // semitones for each row (4 rows), top to bottom
  const semitonesPerRow = [6, 3, 0, -3]; 
  
  const [bpm, setBpm] = useState(120);
  const beat_duration = 60/bpm; // seconds 
  const [exportLoopCount, setExportLoopCount] = useState(1);

  //looping!
  const [isLooping, setIsLooping] = useState(false);
  const loopTimeout = useRef(null);
  
  const getShortName = (name, maxLength = 8) => {
    if(name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf(".");
    const ext = extIndex !== -1 ? name.slice(extIndex) : "";
    return name.slice(0, maxLength - ext.length - 3) + "..." + ext;
  };

  const Float32ToInt16 = (float32Array) => {
    const int16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }

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

    const totalDuration = tracks.length * beat_duration * 1000;
    
    if(loopTimeout.current) clearTimeout(loopTimeout.current);
    loopTimeout.current = setTimeout(() => {
      stopVisualPlayhead();
      if(isLooping) handlePlay();
    }, totalDuration);
  };

  const toggleLoop = () => {
    setIsLooping(prev => {
      if(prev && loopTimeout.current) {
        clearTimeout(loopTimeout.current);
        loopTimeout.current = null;
        stopVisualPlayhead();
      }
      return !prev;
    });
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

    setUploadedSounds(prev => [file.name, ...prev]);
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

  const exportWav = async () => {
    if(tracks.length === 0) return;
    
    const sampleRate = 48000; // Use standard sample rate
    const duration = tracks.length * beat_duration * exportLoopCount;
    const offlineContext = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

    // Render all sounds with proper pitch shifting
    for (let loop = 0; loop < exportLoopCount; loop++) {
      for (let colIndex = 0; colIndex < tracks.length; colIndex++) {
        const column = tracks[colIndex];
        for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
          const soundName = column[rowIndex];
          if (!soundName) continue;

          const buffer = audioBuffers[soundName];
          if (!buffer) continue;

          const source = offlineContext.createBufferSource();
          source.buffer = buffer;
          const playbackRate = Math.pow(2, semitonesPerRow[rowIndex] / 12);
          source.playbackRate.value = playbackRate;
          source.connect(offlineContext.destination);
          source.start((loop * tracks.length + colIndex) * beat_duration);
        }
      }
    }

    const renderedBuffer = await offlineContext.startRendering();
    const wavArrayBuffer = toWav(renderedBuffer);
    const blob = new Blob([wavArrayBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "waow.wav";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMp3 = async () => {
    if(tracks.length === 0) return;

    const sampleRate = 48000; // Use standard sample rate
    const duration = tracks.length * beat_duration * exportLoopCount;
    const offlineContext = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

    // Render all sounds with proper pitch shifting
    for (let loop = 0; loop < exportLoopCount; loop++) {
      for (let colIndex = 0; colIndex < tracks.length; colIndex++) {
        const column = tracks[colIndex];
        for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
          const soundName = column[rowIndex];
          if (!soundName) continue;

          const buffer = audioBuffers[soundName];
          if (!buffer) continue;

          const source = offlineContext.createBufferSource();
          source.buffer = buffer;
          const playbackRate = Math.pow(2, semitonesPerRow[rowIndex] / 12);
          source.playbackRate.value = playbackRate;
          source.connect(offlineContext.destination);
          source.start((loop * tracks.length + colIndex) * beat_duration);
        }
      }
    }

    const renderedBuffer = await offlineContext.startRendering();
    const pcmData = renderedBuffer.getChannelData(0);
    
    const mp3Encoder = new window.lamejs.Mp3Encoder(1, sampleRate, 128);    
    const chunkSize = 1152;
    let mp3Data = [];

    for (let i = 0; i < pcmData.length; i += chunkSize) {
      const chunk = pcmData.subarray(i, i + chunkSize);
      const mp3buf = mp3Encoder.encodeBuffer(Float32ToInt16(chunk));
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    const blob = new Blob(mp3Data, { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waow.mp3";
    a.click();
    URL.revokeObjectURL(url);
  };

  const [stars] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 3,
      speed: ['animate-float', 'animate-float-slow', 'animate-float-fast'][Math.floor(Math.random() * 3)],
    }))
  );
  
  return (
    
    <div className="min-h-screen bg-[#3b2261] text-white flex flex-col p-10 pt-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map(star => (
          <div
            key={star.id}
            className={`absolute text-white animate-twinkle ${star.speed}`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              fontSize: `${star.size}rem`,
              animationDelay: `${star.delay}s`,
              color: '#ddc2fc',
              textShadow: '0 0 10px #ddc2fc, 0 0 20px #ddc2fc',
            }}
          >
            ✧
          </div>
        ))}
      </div>
      
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sounds={sounds}
        uploadedSounds={uploadedSounds}
        handleUpload={handleUpload}
      />

      <Instructions
        isOpen={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />

      <button
        onClick={() => setInstructionsOpen(true)}
        className="fixed top-8 right-4 bg-[#5B9BB5] hover:bg-[#76b8d4] text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg z-40"
        title="Instructions"
      >
        ?
      </button>

      <div className="flex justify-center mb-5">
        <LetterAnim text="FrndBoard" />
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={addTrack}
          disabled={tracks.length >= 8}
          className={`bg-[#5B9BB5] hover:bg-[#76b8d4] font-bold text-white px-6 py-2 rounded mr-4
            ${tracks.length >= 8 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#76b8d4]"}
          `}
        >
          Add Track
        </button>

        <button
          onClick={handlePlay}
          className="bg-[#5B9BB5] hover:bg-[#76b8d4] font-bold text-white px-6 py-2 rounded mr-4"
        >
           Play :D
        </button>

        <button
          onClick={()=> setTracks([Array(4).fill(null)])}
          className="bg-[#5B9BB5] hover:bg-[#76b8d4] font-bold text-white px-6 py-2 rounded mr-4"
        >
          Reset Tracks
        </button>
        
        <button
          onClick={toggleLoop}
            className={`font-bold text-white px-4 py-2 rounded transition-colors
              ${isLooping ? "bg-[#6ec3cc] hover:bg-[#78d6d3]" : "bg-[#5B9BB5] hover:bg-[#76b8d4]"}
            `}
        >
          {isLooping ? "Stop Loop" : "Loop"}
        </button>

      </div>
      <div
        className="w-full max-w-4xl mx-auto grid gap-4"
        style={{ gridTemplateColumns: `repeat(${tracks.length}, 1fr)` }}
      >
        {tracks.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3 relative">

            {/*Removing individual columns*/}
            <button
              className="absolute top-1 right-1 text-white bg-[#5459AC] rounded w-4 h-4 text-xs flex items-center justify-center hover:bg-[#484d96  ] z-10"
              onClick={() => setTracks(prev => prev.filter((_, i) => i !== colIndex))}
            >
              ✕
            </button>
            {column.map((slot, rowIndex) => (
              <div
                key={rowIndex}
                className={`h-16 rounded transition-all flex items-center justify-center
                  ${currentStep === colIndex ?
                    "bg-[#B2D8CE] scale-105 shadow-lg" : 
                    "bg-[#5B9BB5] hover:bg-[#76b8d4]"}
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTracks(prevTracks => {
                    return prevTracks.map((col, cIndex) => {
                      if (cIndex !== colIndex) return col; 

                      const newCol = Array.isArray(col) ? [...col] : Array(4).fill(null);
                      newCol[rowIndex] = null;
                      return newCol;
                    });
                  });
                }}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                {slot ? getShortName(slot) : "-"}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center mt-5">
        <div className="flex items-center gap-4">
          <label className="font-bold">BPM:</label>
          <input
            type="range"
            min="30"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-48 accent-[#5b9bb5]"
          />
          <span className="font-bold">{bpm}</span>
        </div>
      </div>
      
      <div className="flex justify-center mt-6 mb-8">
        <div className="flex gap-4 items-center font-bold text-white px-6 py-3">
          <div className="flex items-center gap-2 bg-[#3b2261] px-3 py-2 rounded border border-[#5B9BB5]">
            <label className="text-sm">Export loops:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={exportLoopCount}
              onChange={(e) => setExportLoopCount(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded bg-[#2a1a47] border border-[#5B9BB5] text-center"
            />
          </div>
          <button onClick={exportWav} className="bg-[#5B9BB5] rounded shadow-lg hover:bg-[#76b8d4] px-4 py-2">
            Export as WAV
          </button>
          <button onClick={exportMp3} className="bg-[#5B9BB5] rounded shadow-lg hover:bg-[#76b8d4] px-4 py-2">
            Export as MP3
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;