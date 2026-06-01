import React, { useEffect, useState, useRef,useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tooltip,
  Collapse,
  Divider,
  Snackbar,  Alert,
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios.js";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_API_SOCKET_URL;

export default function Sidebar({ selectedRoom, onSelectRoom, onSelectFile, selectedFile }) {
  const {user}=useContext(AuthContext);
  const [snackbar, setSnackbar] = useState({   
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const [rooms, setRooms] = useState([]);
  const [filesByRoom, setFilesByRoom] = useState({});
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState("");
  const [loadingFilesFor, setLoadingFilesFor] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const socketRef = useRef(null);
  const [collabOpen, setCollabOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {

    // socketRef.current = io(SOCKET_SERVER_URL, {
    //   // transports: ["websocket"],
    // });

    if (!user?._id) return;

  socketRef.current = io(SOCKET_SERVER_URL, {
    auth: {
      userId: user._id,
    },
  });
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.warn("Socket connect error", err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
  const socket = socketRef.current;
  if (!socket) return;

  socket.on("force-leave-room", ({ roomId }) => {
    showSnackbar("You were removed from the room", "error");
  
  setRooms(prev => prev.filter(r => r.roomId !== roomId));
  if (selectedRoom?.roomId === roomId) {
    onSelectRoom(null);
    onSelectFile(null);
  }
  });


  return () => {
    socket.off("force-leave-room");
  };
}, [selectedRoom]);

 
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/rooms");
        const list = Array.isArray(data) ? data : data?.rooms || data?.room ? [data.room] : [];
        setRooms(list);
      } catch (err) {
        console.error("Room fetch failed:", err?.message || err);
      }
    })();
  }, []);


  const fetchFilesForRoom = async (room) => {
    if (!room) return;
    const roomId = room.roomId;
    setLoadingFilesFor(roomId);
    try {
      const { data } = await api.get(`/files/room/${roomId}`);
      const list = Array.isArray(data) ? data : data?.files || data || [];
      setFilesByRoom((prev) => ({ ...prev, [roomId]: list }));
    } catch (err) {
      console.error("Failed to load files for room:", roomId, err?.message || err);
      setFilesByRoom((prev) => ({ ...prev, [roomId]: [] }));
    } finally {
      setLoadingFilesFor(null);
    }
  };

  
  useEffect(() => {
    
    if (!selectedRoom) return;

    const id = selectedRoom.roomId;
    const socket = socketRef.current; 
    if (!socket) return; 

    
    socket.emit("join-room", id);

    
    const fileCreatedHandler = (file) => {
      
      setFilesByRoom(prev => {
        const currentFiles = prev[id] || [];
        if (currentFiles.some(f => f._id === file._id)) return prev;
        return {
          ...prev,
          [id]: [file, ...currentFiles]
        };
      });
    };

    const fileUpdatedHandler = (file) => {
      
      setFilesByRoom(prev => {
        const currentFiles = prev[id] || [];
        const exists = currentFiles.some(f => f._id === file._id);
        const updatedList = exists
          ? currentFiles.map(f => f._id === file._id ? file : f)
          : [file, ...currentFiles];

        return { ...prev, [id]: updatedList };
      });

      
      if (selectedFile && selectedFile._id === file._id) {
        onSelectFile(file);
      }
    };

    const fileDeletedHandler = (fileId) => {
      
      setFilesByRoom(prev => {
        const currentFiles = prev[id] || [];
        return {
          ...prev,
          [id]: currentFiles.filter(f => f._id !== fileId)
        };
      });

      if (selectedFile && selectedFile._id === fileId) {
        onSelectFile(null);
      }
    };

    
  const userJoinedHandler = ({ roomId: joinedRoomId, user: newUser }) => {
    if (joinedRoomId !== id) return;

    
    setRooms(prev =>
      prev.map(r =>
        r.roomId === id
          ? { ...r, users: [...(r.users || []), newUser] }
          : r
      )
    );

    
    setCollaborators(prev => {
      if (prev.some(u => (u.user?._id || u.user) === (newUser.user?._id || newUser.user))) return prev;
      return [...prev, newUser];
    });
    
    showSnackbar(`${newUser.user?.name || "A user"} joined the room`, "info");
  };


const userLeftHandler = ({ roomId, userId }) => {
  if (roomId !== id) return;

  
  setCollaborators(prev =>
    prev.filter(c => (c.user?._id || c.user) !== userId)
  );

  
  setRooms(prev =>
    prev.map(r =>
      r.roomId === roomId
        ? {
            ...r,
            users: r.users.filter(
              u => (u.user?._id || u.user) !== userId
            ),
          }
        : r
    )
  );

  showSnackbar("A collaborator left the room", "info");
};

  
    socket.on(`file-created:${id}`, fileCreatedHandler);
    socket.on(`file-updated:${id}`, fileUpdatedHandler);
    socket.on(`file-deleted:${id}`, fileDeletedHandler);
    socket.on("room-user-joined", userJoinedHandler); 
    socket.on("room-user-left", userLeftHandler);

    return () => {
      socket.emit("leave-room", id);
      socket.off(`file-created:${id}`, fileCreatedHandler);
      socket.off(`file-updated:${id}`, fileUpdatedHandler);
      socket.off(`file-deleted:${id}`, fileDeletedHandler);
      socket.off("room-user-joined", userJoinedHandler); 
      socket.off("room-user-left", userLeftHandler);
    };

  }, [selectedRoom, selectedFile, onSelectFile, setFilesByRoom, socketRef]);





  const toggleExpand = (room) => {
    const id = room.roomId;
    if (expandedRoomId === id) {
      setExpandedRoomId(null);
    } else {
      setExpandedRoomId(id);
      
      if (!filesByRoom[id]) fetchFilesForRoom(room);
      
      
    }
  };


  const copyRoomId = async (roomId) => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      showSnackbar("Unable to copy","error");
    }
  };

  const createRoom = async () => {
    const name = prompt("Enter new room name:");
    if (!name) return;
    try {
      const { data } = await api.post("/rooms", { name });
      const createdRoom = data?.room || data;
      setRooms((prev) => [createdRoom, ...prev]);
      onSelectRoom && onSelectRoom(createdRoom);
      setSelectedFolder(null);
      setExpandedRoomId(createdRoom.roomId);
      fetchFilesForRoom(createdRoom);
      
    } catch (err) {
      console.error("Room creation failed", err?.message || err);
      showSnackbar(err?.response?.data?.message || "Failed to create room","error");
    }
  };

  const openJoin = () => {
    setJoinRoomInput("");
    setJoinOpen(true);
  };
  const closeJoin = () => setJoinOpen(false);

  const handleJoin = async () => {
    if (!joinRoomInput) return;
    try {
      const { data } = await api.post(`/rooms/${joinRoomInput}/join`);
      const joined = data?.room || data;
      
      setRooms((prev) => {
        if (prev.some((r) => r.roomId === joined.roomId)) return prev;
        return [joined, ...prev];
      });
      onSelectRoom && onSelectRoom(joined);
      setSelectedFolder(null);
      setExpandedRoomId(joined.roomId);
      fetchFilesForRoom(joined);
     
      closeJoin();
    } catch (err) {
      console.error("Join failed:", err?.response?.data || err?.message || err);
      showSnackbar(err?.response?.data?.message || "Failed to join room","error");
    }
  }
  
    const deleteRoom = async (room) => {
  if (!confirm("Are you sure? This will permanently delete the room.")) return;

  try {
    await api.delete(`/rooms/${room._id}`);
    setRooms((prev) => prev.filter((r) => r._id !== room._id));

    if (selectedRoom?._id === room._id) {
      onSelectRoom(null);
      onSelectFile(null);
    }

    showSnackbar("Room deleted successfully","success");
  } catch (err) {
    showSnackbar(err?.response?.data?.message || "Cannot delete room","error");
  }
};

const leaveRoom = async (room) => {
  if (!confirm("Leave this room? You will lose access.")) return;

  try {
    await api.post(`/rooms/${room.roomId}/leave`);
    setRooms((prev) => prev.filter((r) => r.roomId !== room.roomId));

    if (selectedRoom?.roomId === room.roomId) {
      onSelectRoom(null);
      onSelectFile(null);
    }

    showSnackbar("Left room successfully","success");
  } catch (err) {
    showSnackbar(err?.response?.data?.message || "Failed to leave room","error");
  }
};
;

  const addFile = async (room) => {
    if (!room) {
      showSnackbar("Select a room first","warning");
      return;
    }
    const name = prompt("New file name (e.g. main.py):");
    if (!name) return;
    try {
      
      const payload = {
        roomId: room.roomId,
        name,
        content: "",
        parentId: selectedFolder?._id || null,
        type: "file",
      };

      const { data } = await api.post("/files", payload);
      const created = data?.file || data;
      if (!created) throw new Error("Invalid file response");

      setSelectedFolder(null);
      showSnackbar("File created successfully","success");
    } catch (err) {
      console.error("Add file error:", err?.message || err);
      showSnackbar(err?.response?.data?.message || "Failed to create file","error");
    }
  };


  const deleteFile = async (roomId, file) => {
    if (!file) return;
    if (!confirm(`Delete file "${file.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/files/${file._id}`);
      

      if (selectedFile && selectedFile._id === file._id) {
         onSelectFile && onSelectFile(null);
      }
      showSnackbar(`${file.name} deleted`,"error");

    } catch (err) {
      console.error("Delete file failed:", err?.message || err);
      showSnackbar(err?.response?.data?.message || "Failed to delete file","error");
    }
  };

  const addFolder = async (room) => { 
    if (!room) {
      showSnackbar("Select a room first","warning");
      return;
    }
    const name = prompt("New folder name:");
    if (!name) return;

    try{
      const res=await api.post("/files/folder",{
        roomId: room.roomId,
        name,
        parentId: selectedFolder?._id || null,
      });
     
      showSnackbar("Folder created successfully","success");
    } catch (err) {
      console.error("Add folder error:", err?.message || err);
      showSnackbar(err?.response?.data?.message || "Failed to create folder","error");
    }
  };

const renderTree = (files, parentId = null) =>
  files
    .filter((f) => String(f.parentId) === String(parentId))
    .map((f) => {
      const isFolder = f.type === "folder";
      const isExpanded = expandedFolders[f._id];

      return (
        <Box key={f._id} sx={{ ml: parentId ? 2 : 0 }}>
          <ListItem
            sx={{
              py: 0.5,
              px: 1,
              borderRadius: "0.375rem",
              "&:hover": { backgroundColor: "#0f1724" },
              backgroundColor:
                selectedFolder?._id === f._id
                  ? "#334155"
                  : selectedFile?._id === f._id
                  ? "#1e293b"
                  : "transparent",
            }}
          >
          
            <Box
              sx={{ display: "flex", alignItems: "center", flex: 1 }}
              onClick={() => {
                if (isFolder) {
                  setSelectedFolder(f);
                  toggleFolder(f._id);
                } else {
                  setSelectedFolder(null);
                  onSelectFile(f);
                }
              }}
            >
              {isFolder && (
                <Box sx={{ mr: 1, cursor: "pointer" }}>
                  {isExpanded ? <ExpandLessIcon sx={{ color: "#94a3b8" }} /> : <ExpandMoreIcon sx={{ color: "#94a3b8" }} />}
                </Box>
              )}
              <ListItemText
                primary={<>{isFolder ? <FolderOutlinedIcon /> : <FileOpenOutlinedIcon/>} {f.name}</>}
                primaryTypographyProps={{
                  variant: "body2",
                  color: "#e2e8f0",
                }}
              />
            </Box>

          
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(selectedRoom?.roomId, f);
              }}
            >
              <DeleteIcon sx={{ color: "#f87171" }} />
            </IconButton>
          </ListItem>

          {isFolder && isExpanded && selectedFolder?._id === f._id && (
  <Box sx={{ ml: 4, display: "flex", gap: 1 }}>
    <Button
      size="small"
      onClick={() => addFile(selectedRoom)}
    >
      + File
    </Button>

    <Button
      size="small"
      onClick={() => addFolder(selectedRoom)}
    >
      + Folder
    </Button>
  </Box>
)}

        
          {isFolder && isExpanded && renderTree(files, f._id)}
        </Box>
      );
    });
  const toggleFolder = (folderId) => {  
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  }

  
const updateRole = async (userId, role) => {
  try {
    await api.put(`/rooms/${selectedRoom.roomId}/role`, {
      userId,
      role,
    });

    
    setCollaborators(prev =>
      prev.map(c =>
        (c.user?._id || c.user) === userId ? { ...c, role } : c
      )
    );

    
    setRooms(prev =>
      prev.map(r =>
        r.roomId === selectedRoom.roomId
          ? {
              ...r,
              users: r.users.map(u =>
                (u.user?._id || u.user) === userId ? { ...u, role } : u
              ),
            }
          : r
      )
    );

    showSnackbar("Role updated", "success");
  } catch (err) {
    showSnackbar(err.response?.data?.message || "Failed to update role", "error");
  }
};

const kickUser = async (userId) => {
  try {
    await api.post(
      `/rooms/${selectedRoom.roomId}/kick`,
      { userId }
    );

    
    setCollaborators((prev) =>
      prev.filter((c) => (c.user?._id || c.user) !== userId)
    );

     
    setRooms(prev =>
      prev.map(r =>
        r.roomId === selectedRoom.roomId
          ? { ...r, users: r.users.filter(u => (u.user?._id || u.user) !== userId) }
          : r
      )
    );

    socketRef.current.emit("kick-user", {
      roomId: selectedRoom.roomId,
      userId,
    });
    showSnackbar("User removed from room", "success");
  } catch (err) {
    showSnackbar(
      err.response?.data?.message || "Failed to kick user","error");
  }
};
const currentUserId = user?._id || user?.id;
const isOwner =
  selectedRoom?.owner?._id?.toString() === currentUserId?.toString() ||
  selectedRoom?.owner?.toString() === currentUserId?.toString();
  

  return (
    <div className="bg-slate-900 text-white h-full w-72 p-4 flex flex-col border-r border-slate-800">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="font-semibold tracking-wide">
          My Rooms
        </Typography>

        <div className="flex gap-1">
          <Button
            size="small"
            variant="contained"
            sx={{ backgroundColor: "#3b82f6", "&:hover": { backgroundColor: "#2563eb" } }}
            onClick={createRoom}
            startIcon={<AddIcon />}
          >
            Room
          </Button>

          <Button size="small" variant="outlined" onClick={openJoin} startIcon={<SearchIcon />} sx={{ color: "white", borderColor: "#334155" }}>
            Join
          </Button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <List>
          {rooms.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              No rooms yet. Create or join one!
            </Typography>
          ) : (
            rooms.map((room) => {
              const selected = selectedRoom && (selectedRoom._id === room._id || selectedRoom.roomId === room.roomId);
              const expanded = expandedRoomId === room.roomId;
              const files = filesByRoom[room.roomId] || [];
              const currentUserId = user?._id || user?.id;
              const isOwner =room.owner?._id?.toString() === currentUserId?.toString() || room.owner?.toString() === currentUserId?.toString();
              const myRole = isOwner? "owner" : room.users?.find((u) => u.user?._id?.toString() === currentUserId?.toString() || u.user?.toString() === currentUserId?.toString())?.role;

console.log("Room owner ID:", room.owner?._id, "Current user ID:", currentUserId);
              return (
                <Box key={room._id || room.roomId} sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      onSelectRoom && onSelectRoom(room);
                      setSelectedFolder(null);
                      toggleExpand(room);
                    }}
                    sx={{
                      backgroundColor: selected ? "#0b1220" : "transparent",
                      borderRadius: "0.5rem",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <ListItemText
                        primary={room.name}
                        secondary={`ID: ${room.roomId}`}
                        primaryTypographyProps={{ color: "white", noWrap: true }}
                        secondaryTypographyProps={{ color: "#94a3b8", noWrap: true }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Tooltip title="Copy Room ID">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); copyRoomId(room.roomId); }}>
                          <ContentCopyIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(room); }}>
                        {expanded ? <ExpandLessIcon sx={{ color: "#94a3b8" }} /> : <ExpandMoreIcon sx={{ color: "#94a3b8" }} />}
                      </IconButton>
                    </Box>
                  </ListItemButton>

                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 1, pt: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      
                      {isOwner ? (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          style={{ marginRight: '10px', padding: '19px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // setCollaborators(room.users || []);
                            setCollaborators([
                            { user: room.owner, role: "owner" },
                            ...(room.users || []),
                           ]);
                            setCollabOpen(true);
                          }}
                        >
                          Collaborators
                        </Button>

                      <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoom(room);
                      }}
                    >
                    Delete Room
                    </Button>
                    </>
                  ) : (
                  <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      leaveRoom(room);
                    }}
                  >
                    Leave Room
                  </Button>
                )}
              </Box>
              <Divider sx={{ borderColor: "#1f2937", mb: 1 }} />

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                          Files
                        </Typography>
                        
                        {(myRole === "owner" || myRole === "editor" || myRole === "viewer"  ) && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => addFile(room)}
                            startIcon={<AddIcon />}
                          >
                            New
                          </Button>
                        )}

                      </Box>
                      <Divider sx={{ borderColor: "#1f2937", mb: 1 }} />
                      {/* Folder */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                          Folder
                        </Typography>
                        
                        {(myRole === "owner" || myRole === "editor"|| myRole === "viewer") && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => addFolder(room)}
                            startIcon={<AddIcon />}
                          >
                            New
                          </Button>
                        )}

                      </Box>

                      <Divider sx={{ borderColor: "#1f2937", mb: 1 }} />

                      {loadingFilesFor === room.roomId ? (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Loading files...
                        </Typography>
                      ) : files.length === 0 ? (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          No files yet
                        </Typography>
                      ) : (
                        <List disablePadding>
                            {renderTree(files)}
                        </List>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })
          )}
        </List>
      </div>

      
      <Dialog open={joinOpen} onClose={closeJoin}>
        <DialogTitle>Join a Room</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Enter the short Room ID (e.g. A12X9M)
          </Typography>
          <TextField autoFocus label="Room ID" fullWidth value={joinRoomInput} onChange={(e) => setJoinRoomInput(e.target.value.trim())} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeJoin}>Cancel</Button>
          <Button onClick={handleJoin} variant="contained">
            Join
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}   
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
  <Dialog open={collabOpen} onClose={() => setCollabOpen(false)} fullWidth>
  <DialogTitle>Room Collaborators</DialogTitle>
  
  <DialogContent dividers>
    {collaborators.map((c) => {
      const isOwnerUser = (c.user?._id || c.user)?.toString() === (selectedRoom.owner?._id || selectedRoom.owner)?.toString();

      return (
      <Box
        key={c.user?._id || c.user}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography>{c.user?.name || c.user}</Typography>
        <Typography>{c.user?.email || c.user}</Typography>


        {isOwnerUser ? (
          <Typography fontWeight="bold">Owner</Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            
            <Box sx={{ display: "flex", gap: 1 }}>

  <Button
  size="small"
  variant={c.role === "viewer" ? "contained" : "outlined"}
  color={c.role === "viewer" ? "info" : "inherit"}
  onClick={() => updateRole(c.user?._id || c.user, "viewer")}
>
  Viewer
</Button>

<Button
  size="small"
  variant={c.role === "editor" ? "contained" : "outlined"}
  color={c.role === "editor" ? "success" : "inherit"}
  onClick={() => updateRole(c.user?._id || c.user, "editor")}
>
  Editor
</Button>

  {isOwner && !isOwnerUser && (
  <Tooltip title="Remove user from room">
    <IconButton
      size="small"
      color="error"
      onClick={() => kickUser(c.user._id || c.user)}
    >
      <DeleteIcon />
    </IconButton>
  </Tooltip>
)}

</Box>
          </Box>
        )}
      </Box>
      );
    })}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setCollabOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

    </div>
  );
}