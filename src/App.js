import { useState, useEffect, useRef } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const empty_col = [null, null, null, null];
  const [tracks, setTracks] = useState([[...empty_col]]);
  const sounds = ["Meow", "Woof", "Moo"];

  const soundFiles = {
    Meow: "/sounds/meow.mp3",
    Woof: "/sounds/woof.mp3",
    Moo: "/sounds/moo.mp3",
  };

  // Create AudioContext once
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());

  const [audioBuffers, setAudioBuffers] = useState({});

  const semitonesPerRow = [-6, -3, 0, +3];

  // Preload all audio safely
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
    setTracks([...tracks, [...empty_col]]);
  };
  const beat_duration = 0.5; 
  const handlePlay = async () => {
    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }

    const startTime = audioContext.current.currentTime;

    tracks.forEach((track, rowIndex) => {
      track.forEach((soundName, colIndex) => {
        if (!soundName) return;

        const source = audioContext.current.createBufferSource();
        source.buffer = audioBuffers[soundName];

        const semitones = semitonesPerRow[rowIndex];
        const playbackRate = Math.pow(2, semitones / 12);
        source.playbackRate.value = playbackRate;

        source.connect(audioContext.current.destination);
        const time = colIndex * beat_duration;
        source.start(startTime + time);
      });
    });
  };

  return (
    
    <div className="min-h-screen bg-[#52357B] text-white flex flex-col p-10">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sounds={sounds}
      />

      <h1 className="text-6xl font-bold text-center text-[#B2D8CE] mb-10">
        FrndBoard
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={addTrack}
          className="bg-[#648DB3] hover:bg-[#79b2c7] font-bold text-white px-6 py-2 rounded mr-4"
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
                className="h-16 bg-[#648DB3] rounded hover:bg-[#79b2c7] transition-all flex items-center justify-center"
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

function Sidebar({ sidebarOpen, setSidebarOpen, sounds }) {
  return (
    <>
    
      <div className="flex items-center mb-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 mr-4"
        >
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>

        <h2 className="text-2xl font-bold text-white">Tracks</h2>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Sound Library</h2>
        <ul>
          {sounds.map((sound, index) => (
            <li
              key={index}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", sound)}
              className="bg-[#648DB3] p-2 my-1 rounded hover:bg-[#79b2c7] cursor-pointer"
            >
              {sound}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
