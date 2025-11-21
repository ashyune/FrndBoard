function Sidebar({ sidebarOpen, setSidebarOpen, sounds, handleUpload }) {
  return (
    <>
      {/* menu button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-[#2a1a47] rounded hover:bg-[#2f1d4f] mr-4"
        >
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>

        <h2 className="text-2xl font-bold text-white">Tracks</h2>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#2a1a47] text-white p-4 transition-transform duration-300 z-50 overflow-hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Closing sidebar */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Sound Tracks :&gt;</h2>

        {/* File upload */}
        <input
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          className="my-3"
        />

        {/* List of tracks */}
        <ul className="mt-4">
          {sounds.map((sound, index) => (
            <li
              key={index}
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
