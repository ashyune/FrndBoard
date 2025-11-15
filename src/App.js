import { useState } from "react";
import Track from "./components/Track";

function App() {
  const [tracks, setTracks] = useState([
    [null, null, null, null]
  ]);

  const addTrack = () => {
    setTracks([...tracks, [null, null, null, null]]);
  };

  return (
    <div className="min-h-screen bg-[#52357B] text-white flex flex-col p-10">
      <h1 className="text-6xl font-bold text-center text-[#B2D8CE] mb-10">
        FrndBoard
      </h1>
      <br></br>

      <div className="flex justify-center mb-6">
        <button onClick = {addTrack} 
        className="bg-[#648DB3] hover:bg-[#79b2c7] font-bold text-white px-6 py-2 rounded transition-all duration-200">
            Add Track
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
        {tracks.map((track, tIndex) => (
          <div
            key={tIndex}
            className="grid grid-cols-4 gap-3">
            {track.map((slot, sIndex) => (
              <div
                key={sIndex}
                className="h-16 bg-[#648DB3] rounded hover:bg-[#79b2c7] transition-all duration-200">
                {/* sound name here */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

