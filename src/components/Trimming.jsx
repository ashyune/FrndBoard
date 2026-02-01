import { useState } from "react";

function Trimming({ isOpen, onClose, onSaveAudio }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#2a1a47] text-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#ddc2fc]">Audio Trimming</h2>
                <button onClick={onClose} className="text-3xl hover:text-[#ddc2fc]">
                    ✕
                </button>
            </div>
            
            <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="my-3"
            />
            {/*this currently only has the upload button but the uploads dont actually get uploaded yet. trimming not added either.*/}
            <div className="mt-8 text-center">
                <button
                    onClick={() => {
                        if(!selectedFile) return;
                        onSaveAudio(selectedFile);
                        onClose();
                    }}
                    className="bg-[#5B9BB5] hover:bg-[#76b8d4] font-bold font-xl text-white px-8 py-3 rounded"
                >
                    Save Trimmed Audio and Close
                </button>
            </div>
        </div>
    </div>
);
}

export default Trimming;
