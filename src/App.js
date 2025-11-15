function App() {
  return (
    <div className="min-h-screen bg-[#52357B] text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-[#B2D8CE]">
        FrndBoard
      </h1>
      <br></br>
        <div className="flex flex-col gap-3 w-full max-w-3xl">
          {/* Track 1 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
          </div>

          {/* Track 2 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
          </div>

          {/* Track 3 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
          </div>

          {/* Track 4 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
            <div className="h-16 bg-[#648DB3] rounded-md"></div>
          </div>
  
        </div>
    </div>
  );
}

export default App;

