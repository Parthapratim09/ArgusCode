import React, { useState } from "react";
import { 
  Box, 
  IconButton, 
  Typography, 
  Drawer, 
  useTheme, 
  useMediaQuery 
} from "@mui/material";


import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";


import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import CodeEditor from "../components/CodeEditor.jsx";

const NAVBAR_HEIGHT = 64; 
const SIDEBAR_WIDTH = 320; 

export default function Dashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100vh", 
        width: "100vw",
        bgcolor: "#020617", 
        color: "#ffffff",
        overflow: "hidden"
      }}
    >
      <Navbar />

      
      {!isDesktop && (
        <IconButton
          onClick={handleToggleSidebar}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.speedDial,
            bgcolor: "#14b8a6", 
            color: "#020617",
            p: 1.75,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
            border: "1px solid #2dd4bf",
            "&:hover": { bgcolor: "#0d9488" },
            "&:active": { transform: "scale(0.95)" }
          }}
          aria-label="toggle workspace sidebar"
        >
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      
      <Box sx={{ display: "flex", flexGrow: 1, height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, overflow: "hidden", position: "relative" }}>
        
        
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop || isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            height: "100%", 
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              bgcolor: isDesktop ? "transparent" : "#0f172a", 
              borderRight: "1px solid #1e293b", 
              color: "inherit",
              position: isDesktop ? "relative" : "fixed",
              height: "100%", 
              top: 0,
              
              
              overflowX: "hidden", 
              overflowY: "auto",
            },
            "& .MuiBackdrop-root": {
              top: `${NAVBAR_HEIGHT}px`,
              backdropFilter: "blur(2px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)"
            }
          }}
        >
          <Sidebar
            selectedRoom={selectedRoom}
            selectedFile={selectedFile}
            onSelectRoom={(room) => {
              setSelectedRoom(room);
              setSelectedFile(null);
              setIsSidebarOpen(false); 
            }}
            onSelectFile={(file) => {
              setSelectedFile(file);
              setIsSidebarOpen(false); 
            }}
          />
        </Drawer>

      
        <Box component="main" sx={{ flexGrow: 1, overflow: "hidden", height: "100%" }}>
          {!selectedRoom ? (
           
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", px: 3, textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: "medium", fontSize: "1.1rem" }}>
                Welcome! Select or create a room to start coding.
              </Typography>
            </Box>
          ) : !selectedFile ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", px: 3, textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: "medium", fontSize: "1.1rem" }}>
                Select a file to start editing.
              </Typography>
            </Box>
          ) : (
            <CodeEditor
              key={selectedFile.id}
              file={selectedFile}
              selectedRoom={selectedRoom}
              onSaved={(updatedFile) => setSelectedFile(updatedFile)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}