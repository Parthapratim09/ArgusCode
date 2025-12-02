import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import CodeEditor from "../components/CodeEditor.jsx";

export default function Dashboard() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          selectedRoom={selectedRoom}
          selectedFile={selectedFile}
          onSelectRoom={(room) => {
            setSelectedRoom(room);
            setSelectedFile(null); 
          }}
          onSelectFile={(file) => {
            setSelectedFile(file);
          }}
        />

        <div className="flex-1 overflow-hidden">
  
          {!selectedRoom ? (
            
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Welcome! Select or create a room to start coding.
            </div>
          ) : !selectedFile ? (
            
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Select a file to start editing.
            </div>
          ) : (
          
            <CodeEditor
              key={selectedFile.id}
              file={selectedFile}
              onSaved={(updatedFile) => setSelectedFile(updatedFile)}
            />
          )}
        </div>
      </div>
    </div>
  );
}