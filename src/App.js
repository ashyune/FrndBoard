import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import LetterAnim from "./components/LetterAnim";

import toWav from "audiobuffer-to-wav";

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

  const [bpm, setBpm] = useState(120);
  const beat_duration = 60/bpm; // seconds 

  //looping!
  const [isLooping, setIsLooping] = useState(false);
  const loopTimeout = useRef(null);
  
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

  const exportWav = () => {
    if(tracks.length === 0) return;
    const sampleRate = audioContext.current.sampleRate;
    const numChannels = 1;
    const totalLength = Math.ceil(tracks.length * beat_duration * sampleRate);
    const finalBuffer = audioContext.current.createBuffer(numChannels, totalLength, sampleRate);

    for (let colIndex = 0; colIndex < tracks.length; colIndex++) {
      const column = tracks[colIndex];
      column.forEach((soundName, rowIndex) => {
        if (!soundName) return;
        const sourceBuffer = audioBuffers[soundName];
        if (!sourceBuffer) return;

        const playbackRate = Math.pow(2, semitonesPerRow[rowIndex] / 12);
        const startSample = Math.floor(colIndex * beat_duration * sampleRate);

        for (let channel = 0; channel < Math.min(sourceBuffer.numberOfChannels, numChannels); channel++) {
          const inputData = sourceBuffer.getChannelData(channel);
          const outputData = finalBuffer.getChannelData(channel);

          for (let i = 0; i < inputData.length; i++) {
            const j = startSample + i;
            if (j < outputData.length) {
              outputData[j] += inputData[i]; // simple additive mixing
            }
          }
        }
      });
    }
    
    const wavArrayBuffer = toWav(finalBuffer);
    const blob = new Blob([wavArrayBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "frndboard_export.wav";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMp3 = () => {
    if(tracks.length === 0) return;

    const sampleRate = audioContext.current.sampleRate;
    const numChannels = 1;
    const totalLength = Math.ceil(tracks.length * beat_duration * sampleRate);
    const buffer = audioContext.current.createBuffer(numChannels, totalLength, sampleRate);
    
    for (let colIndex = 0; colIndex < tracks.length; colIndex++) {
      const column = tracks[colIndex];
      column.forEach((soundName, rowIndex) => {
        if (!soundName) return;
        const srcBuffer = audioBuffers[soundName];
        if (!srcBuffer) return;

        const startSample = Math.floor(colIndex * beat_duration * sampleRate);
        const playbackRate = Math.pow(2, semitonesPerRow[rowIndex] / 12);

        for (let i = 0; i < srcBuffer.length; i++) {
          const sampleIndex = startSample + Math.floor(i / playbackRate);
          if (sampleIndex < buffer.length) {
            buffer.getChannelData(0)[sampleIndex] += srcBuffer.getChannelData(0)[i];
          }
        }
      });
    }

    const pcmData = buffer.getChannelData(0);
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
    a.download = "FrndBoardExport.mp3";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 0.5 + 0.5, // for font size
    delay: Math.random() * 3,
    speed: ['animate-float', 'animate-float-slow', 'animate-float-fast'][Math.floor(Math.random() * 3)],
  }));
  
  return (
    
    <div className="min-h-screen bg-[#3b2261] text-white flex flex-col p-10">
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
        handleUpload={handleUpload}
      />

      <div >
        <LetterAnim text="FrndBoard" />
      </div>

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

        <button
          onClick={()=> setTracks([Array(4).fill(null)])}
          className="bg-[#648DB3] hover:bg-[#79b2c7] font-bold text-white px-6 py-2 rounded mr-4"
        >
          Reset Tracks
        </button>
        
        <button
          onClick={toggleLoop}
            className={`font-bold text-white px-4 py-2 rounded transition-colors
              ${isLooping ? "bg-[#64b39b] hover:bg-[#79c7aa]" : "bg-[#648DB3] hover:bg-[#79b2c7]"}
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

      <div className="flex justify-center items-center mt-8">
        <div className="flex items-center gap-4">
          <label className="font-bold">BPM:</label>
          <input
            type="range"
            min="30"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-48 accent-[#648DB3]"
          />
          <span className="w-12 text-center font-bold">{bpm} BPM</span>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 font-bold text-white px-6 py-3 ">
        <button onClick={exportWav} className="bg-[#648DB3] rounded shadow-lg z-50 hover:bg-[#79b2c7] px-4 py-2 rounded">
          Export as WAV
        </button>
        <button onClick={exportMp3} className="bg-[#648DB3] rounded shadow-lg z-50 hover:bg-[#79b2c7] px-4 py-2 rounded">
          Export as MP3
        </button>
      </div>

    </div>
  );
}

export default App;