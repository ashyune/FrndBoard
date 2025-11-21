function Instructions({ isOpen, onClose }) {
  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#2a1a47] text-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#ddc2fc]">How to create your own tracks!</h2>
                <button onClick={onClose} className="text-3xl hover:text-[#ddc2fc]">
                    ✕
                </button>
            </div>

            <div className="space-y-6">
                <section>
                    <h3 className="text-xl font-bold text-[#5B9BB5] mb-2">✧ Adding Sounds</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Open the sidebar by clicking the menu button (Tracks)</li>
                        <li>
                            Use the file upload button to add your own audio files
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li className="italic">Do trim your clips beforehand to your liking</li>
                                <li className="italic">I used this for trimming - <a href="https://clideo.com/cut-audio" target="_blank" rel="noopener noreferrer" style={{color: "#d2abffff"}}>Clideo Audio Trimmer</a></li>
                                <li className="italic">Recommended audio length - 0.1 to 1 second</li>
                            </ul>
                        </li>
                        <li>Drag sounds from the sidebar onto the track slots</li>
                        <li>I'd recommend collecting audio files from friends and then mixing those (hence, frndboard)</li>

                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-[#5B9BB5] mb-2">✧ Creating Tracks</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Click "Add Track" to create a new column (up to 8 tracks)</li>
                        <li>Each column has 4 rows with different pitches (high to low)</li>
                        <li>Drag and drop sounds into any slot</li>
                        <li>Click a slot to preview the sound at that pitch</li>
                        <li>Right click a slot to remove the sound</li>
                        <li>Click the ✕ button on top of a track to delete the entire column</li>
                        <li>Alternatively click the "Reset Tracks" button to clear all tracks</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-[#5B9BB5] mb-2">✧ Playback</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Click "Play :D" to hear your track yayay!</li>
                        <li>
                            Click "Loop" to repeat your track continuously
                            <ul className="list-none ml-6 mt-1">
                                <li className="italic">Note: loop feature may be a lil buggy sorry ;-;</li>
                            </ul>
                        </li>
                        <li>Click "Stop Loop" to stop looping</li>
                        <li>Adjust BPM (30-300) with the slider to change tempo</li>
                        <li className="font-bold">!!! Currently, while loop is ON - tracks cannot be removed and bpm cannot be changed.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-[#5B9BB5] mb-2">✧ Exporting</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Click "Export as WAV" for lossless audio</li>
                        <li>Click "Export as MP3" for compressed audio</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-[#5B9BB5] mb-2">✧ Other random info</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Different rows play the same sound at different pitches</li>
                        <li>Try layering sounds in the same column :D</li>
                        <li>Please ignore the sample sounds lmao ty</li>
                        <li>Do share your exported tracks with us everyone hehe</li>
                    </ul>
                </section>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onClose}
                    className="bg-[#5B9BB5] hover:bg-[#76b8d4] font-bold font-xl text-white px-8 py-3 rounded"
                >
                    Lessgooo
                </button>
            </div>
        </div>
    </div>
);
}

export default Instructions;
