import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";


const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#020617", 
      paper: "#0f172a",   
    },
    text: {
      primary: "#ffffff",
      secondary: "#94a3b8",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a", 
          borderRadius: "12px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
        },
      },
    },
  },
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchRooms();
    fetchFiles();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/admin/rooms");
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data } = await api.get("/admin/files");
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoom = async (id) => {
    try {
      await api.delete(`/admin/rooms/${id}`);
      setRooms((prev) => prev.filter((room) => room._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFile = async (id) => {
    try {
      await api.delete(`/admin/files/${id}`);
      setFiles((prev) => prev.filter((file) => file._id !== id));
      setStats((prev) => ({ ...prev, files: Math.max(0, prev.files - 1) }));
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  async function toggleBan(userId, isBanned) {
    try {
      if (isBanned) {
        await api.put(`/admin/unban/${userId}`);
      } else {
        await api.put(`/admin/ban/${userId}`);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function openRoom(roomId) {
    try {
      const res = await api.get(`/admin/room/${roomId}`);
      console.log("Room response", res.data);
      setSelectedRoom(roomId);
      setRoomDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function changeRole(roomId, userId, role) {
    try {
      await api.put(`/admin/room/${roomId}/role`, { userId, role });
      openRoom(roomId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 4 }}>
          Admin Dashboard
        </Typography>

        
        <Grid container spacing={5} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "semibold" }}>
                  Users
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, color: "#60a5fa", fontWeight: "bold",px:10,py:2 }}>
                  {stats.users || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "semibold" }}>
                  Rooms
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, color: "#4ade80", fontWeight: "bold",px:10,py:2 }}>
                  {stats.rooms || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "semibold" }}>
                  Files
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, color: "#f472b6", fontWeight: "bold",px:10,py:2 }}>
                  {stats.files || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        
        <Card sx={{ p: 3, mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Users
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {users.map((user) => (
              <Box
                key={user._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#1e293b", 
                  p: 2,
                  borderRadius: 2,
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "semibold" }}>{user.name}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {user.email}
                  </Typography>
                  <Box>

  <Typography
    variant="caption"
    sx={{
      color: "#facc15",
      display: "block",
    }}
  >
    {user.role}
  </Typography>

  {user.isBanned && (
    <Typography
      variant="caption"
      sx={{
        color: "#ef4444",
        display: "block",
        fontWeight: "bold",
      }}
    >
      USER BANNED
    </Typography>
  )}

</Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => toggleBan(user._id, user.isBanned)}
                    disabled={user.role === "admin"}
                    sx={{
                      bgcolor: user.isBanned ? "#16a34a" : "#ca8a04",
                      "&:hover": { bgcolor: user.isBanned ? "#15803d" : "#a16207" },
                      textTransform: "none",
                    }}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => deleteUser(user._id)}
                    disabled={user.role === "admin"}
                    sx={{
                      bgcolor: "#ef4444",
                      "&:hover": { bgcolor: "#dc2626" },
                      textTransform: "none",
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

      
        <Card sx={{ p: 3, mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Rooms
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {rooms.map((room) => (
              <Box key={room._id}>
                
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#1e293b", 
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "semibold" }}>{room.name}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Room ID: {room.roomId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#60a5fa" }}>
                      Owner: {room.owner?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => openRoom(room.roomId)}
                      sx={{
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" },
                        textTransform: "none",
                      }}
                    >
                      Open
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => deleteRoom(room._id)}
                      sx={{
                        bgcolor: "#ef4444",
                        "&:hover": { bgcolor: "#dc2626" },
                        textTransform: "none",
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>

              
                {selectedRoom === room.roomId && roomDetails && (
                  <Box
                    sx={{
                      bgcolor: "#1e293b",
                      p: 3,
                      borderRadius: 2,
                      mt: 1.5,
                      border: "1px solid #334155", 
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          Room Details
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#60a5fa", mt: 0.5 }}>
                          Owner: {roomDetails?.room?.owner?.name}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedRoom(null);
                          setRoomDetails(null);
                        }}
                        sx={{
                          bgcolor: "#ef4444",
                          "&:hover": { bgcolor: "#dc2626" },
                          textTransform: "none",
                        }}
                      >
                        Close
                      </Button>
                    </Box>

                    
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                      Collaborators
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
                      {roomDetails?.room?.users
                        ?.filter((u) => u.user)
                        ?.map((u) => (
                          <Box
                            key={u.user?._id}
                            sx={{
                              bgcolor: "#334155", 
                              p: 2,
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: "semibold" }}>
                                {u.user?.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {u.user?.email}
                              </Typography>
                            </Box>

                            {roomDetails?.room?.owner?._id === u.user?._id ? (
                              <Typography variant="body2" sx={{ color: "#facc15", fontWeight: "bold" }}>
                                Owner
                              </Typography>
                            ) : (
                              <FormControl size="small">
                                <Select
                                  value={u.role}
                                  onChange={(e) =>
                                    changeRole(
                                      roomDetails?.room?.roomId,
                                      u.user?._id,
                                      e.target.value
                                    )
                                  }
                                  sx={{
                                    bgcolor: "#475569",
                                    color: "white",
                                    height: "35px",
                                  }}
                                >
                                  <MenuItem value="viewer">Viewer</MenuItem>
                                  <MenuItem value="editor">Editor</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Box>
                        ))}
                    </Box>

                  
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                      Room Files
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {roomDetails?.files?.length > 0 ? (
                        roomDetails?.files?.map((file) => (
                          <Box key={file._id} sx={{ bgcolor: "#334155", p: 1.5, borderRadius: 1 }}>
                            <Typography variant="body2">{file.name}</Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {file.type}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          No files found
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Card>

      
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Stored Files Management
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Size / Type</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No uploaded files found.
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: "#60a5fa" }}>
                        {file.name || file.filename || "unnamed_file"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {file.type || "Unknown Type"}
                      </TableCell>
                      <TableCell>
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => deleteFile(file._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}