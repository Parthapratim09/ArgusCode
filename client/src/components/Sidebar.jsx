import React, { useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios.js";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL;

export default function Sidebar({ selectedRoom, onSelectRoom, onSelectFile, selectedFile }) {
  const [rooms, setRooms] = useState([]);
  const [filesByRoom, setFilesByRoom] = useState({});
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState("");
  const [loadingFilesFor, setLoadingFilesFor] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // create socket once
    socketRef.current = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
    });

    // generic listeners 
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

  // load room list on mount
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

  // when a room is selected/expanded, fetch files for that room (if not cached)
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

  // ----- START: NEW SOCKET LOGIC HOOK -----
  useEffect(() => {
    // when selectedRoom changes, subscribe to room events
    if (!selectedRoom) return;

    const id = selectedRoom.roomId;
    const socket = socketRef.current; 
    if (!socket) return; 

    // tell server socket
    socket.emit("join-room", id);

    // listen to file events for this room
    const fileCreatedHandler = (file) => {
      // Adapted for your filesByRoom state
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
      // Adapted for your filesByRoom state
      setFilesByRoom(prev => {
        const currentFiles = prev[id] || [];
        const exists = currentFiles.some(f => f._id === file._id);
        const updatedList = exists
          ? currentFiles.map(f => f._id === file._id ? file : f)
          : [file, ...currentFiles];

        return { ...prev, [id]: updatedList };
      });

      // if this file is currently open in editor, update editor content:
      if (selectedFile && selectedFile._id === file._id) {
        onSelectFile(file);
      }
    };

    const fileDeletedHandler = (fileId) => {
      // Adapted for your filesByRoom state
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

    // Attach listeners
    socket.on(`file-created:${id}`, fileCreatedHandler);
    socket.on(`file-updated:${id}`, fileUpdatedHandler);
    socket.on(`file-deleted:${id}`, fileDeletedHandler);

    // cleanup
    return () => {
      socket.emit("leave-room", id);
      socket.off(`file-created:${id}`, fileCreatedHandler);
      socket.off(`file-updated:${id}`, fileUpdatedHandler);
      socket.off(`file-deleted:${id}`, fileDeletedHandler);
    };

  }, [selectedRoom, selectedFile, onSelectFile, setFilesByRoom, socketRef]);
  // ----- END: NEW SOCKET LOGIC HOOK -----


  // ----- START: MODIFIED toggleExpand -----
  // toggle expand for room (dropdown behavior)
  const toggleExpand = (room) => {
    const id = room.roomId;
    if (expandedRoomId === id) {
      setExpandedRoomId(null);
    } else {
      setExpandedRoomId(id);
      // fetch files if not fetched yet
      if (!filesByRoom[id]) fetchFilesForRoom(room);
      
      // All socket logic was removed from here
    }
  };
  // ----- END: MODIFIED toggleExpand -----

  // copy roomId
  const copyRoomId = async (roomId) => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      alert("Unable to copy");
    }
  };

  // Create room (immediate show)
  const createRoom = async () => {
    const name = prompt("Enter new room name:");
    if (!name) return;
    try {
      const { data } = await api.post("/rooms", { name });
      const createdRoom = data?.room || data;
      setRooms((prev) => [createdRoom, ...prev]);
      onSelectRoom && onSelectRoom(createdRoom);
      // expand newly created
      setExpandedRoomId(createdRoom.roomId);
      fetchFilesForRoom(createdRoom);
      // No need to emit 'join-room' here, the new useEffect
      // will handle it when 'selectedRoom' changes.
    } catch (err) {
      console.error("Room creation failed", err?.message || err);
      alert(err?.response?.data?.message || "Failed to create room");
    }
  };

  // Join by short room ID
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
      // add to rooms list if not present
      setRooms((prev) => {
        if (prev.some((r) => r.roomId === joined.roomId)) return prev;
        return [joined, ...prev];
      });
      onSelectRoom && onSelectRoom(joined);
      setExpandedRoomId(joined.roomId);
      fetchFilesForRoom(joined);
      // No need to emit 'join-room' here, the new useEffect
      // will handle it when 'selectedRoom' changes.
      closeJoin();
    } catch (err) {
      console.error("Join failed:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "Failed to join room");
    }
  };

  // Add file to selected room (uses short roomId string)
  const addFile = async (room) => {
    if (!room) {
      alert("Select a room first");
      return;
    }
    const name = prompt("New file name (e.g. main.py):");
    if (!name) return;
    try {
      const payload = { roomId: room.roomId, name, content: "" };
      const { data } = await api.post("/files", payload);
      const created = data?.file || data;
      if (!created) throw new Error("Invalid file response");

      // update local map with dedupe
      setFilesByRoom((prev) => {
        const list = prev[room.roomId] || [];
        const filtered = list.filter((f) => f._id !== created._id);
        return { ...prev, [room.roomId]: [created, ...filtered] };
      });

      // notify editor selection
      onSelectFile && onSelectFile(created);
      // emit to server not required (server will broadcast via controller)
    } catch (err) {
      console.error("Add file error:", err?.message || err);
      alert(err?.response?.data?.message || "Failed to create file");
    }
  };

  // Delete file
  const deleteFile = async (roomId, file) => {
    if (!file) return;
    if (!confirm(`Delete file "${file.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/files/${file._id}`);
      // No need to update state manually, the socket
      // event 'file-deleted' will handle it.
      
      // We only need to deselect the file if it's the one we deleted
      if (selectedFile && selectedFile._id === file._id) {
         onSelectFile && onSelectFile(null);
      }
      // server will broadcast deletion event as well
    } catch (err) {
      console.error("Delete file failed:", err?.message || err);
      alert(err?.response?.data?.message || "Failed to delete file");
    }
  };

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
              return (
                <Box key={room._id || room.roomId} sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      onSelectRoom && onSelectRoom(room);
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                          Files
                        </Typography>
                        <Button size="small" variant="text" onClick={() => addFile(room)} startIcon={<AddIcon />}>
                          New
                        </Button>
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
                          {files.map((f) => (
                            <ListItem
                              key={f._id}
                              // button
                              onClick={() => onSelectFile && onSelectFile(f)}
                              secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); deleteFile(room.roomId, f); }}>
                                  <DeleteIcon sx={{ color: "#f87171" }} />
                                </IconButton>
                              }
                              sx={{
                                py: 0.5,
                                px: 1,
                                borderRadius: "0.375rem",
                                "&:hover": { backgroundColor: "#0f1724" },
    
                                backgroundColor: selectedFile && selectedFile._id === f._id ? "#1e293b" : "transparent",
                              }}
                            >
                              <ListItemText primary={f.name} primaryTypographyProps={{ variant: "body2", color: "#e2e8f0" }} secondary={f.language} />
                            </ListItem>
                          ))}
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

      {/* Join Room Dialog */}
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
    </div>
  );
}