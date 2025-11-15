import Track from "./components/Track";

function App() {
  return (
    <div className="min-h-screen bg-[#52357B] text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-[#B2D8CE]">
        FrndBoard
      </h1>
      <br></br>
        <div className="flex flex-col gap-3 w-full max-w-3xl">
          {/* Track 1 */}
          <Track/>
          <Track/>
          <Track/>
          <Track/>
        </div>
    </div>
  );
}

export default App;

