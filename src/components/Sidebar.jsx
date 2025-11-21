function Sidebar({ sidebarOpen, setSidebarOpen, sounds, uploadedSounds, handleUpload }) {
  return (
    <>
      <div className="flex items-center mb-6 mt-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-[#5B9BB5] hover:bg-[#76b8d4] rounded-sm mr-4"
        >
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>

        <h2 className="text-2xl font-bold text-white">Tracks</h2>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#2a1a47] text-white p-4 transition-transform duration-300 z-50 overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Sound Tracks :&gt;</h2>

        <input
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          className="my-3"
        />

        {/* Uploaded tracks */}
        {uploadedSounds.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-[#ddc2fc] mt-4 mb-2">Your Uploads</h3>
            <ul>
              {uploadedSounds.map((sound, index) => (
                <li
                  key={`uploaded-${index}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", sound)}
                  className="bg-[#5B9BB5] p-2 my-1 rounded hover:bg-[#76b8d4] cursor-pointer"
                >
                  {sound}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Sample tracks */}
        <h3 className="text-sm font-bold text-[#ddc2fc] mt-4 mb-2">Sample Tracks (Use your own &gt;:3)</h3>
        <ul>
          {sounds.map((sound, index) => (
            <li
              key={`sample-${index}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", sound)}
              className="bg-[#5B9BB5] p-2 my-1 rounded hover:bg-[#76b8d4] cursor-pointer"
            >
              {sound}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
