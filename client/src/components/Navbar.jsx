import React from "react";
import { useState,useContext } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    IconButton,
} from "@mui/material";

import { AuthContext } from "../context/authContext.jsx";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };  
    const handleLogout = () => {
        logout();
        handleClose();
    }
    return (
        <AppBar position="sticky" elevation={1} sx={{ bgcolor: "#1976d2" }}>
            <Toolbar className="flex justify-between">
                <Typography variant="h6" sx={{fontWeight:"bold"}}>
                    ArgusCode
                </Typography>
                <div>
                    <IconButton onClick={handleMenu}>
                        <Avatar  
                            src="/user.png"
                            alt={user ? user.name : "User"}
                           sx={{ bgcolor: "#ffffff", color: "#1976d2", width: 36, height: 36 }}
                        />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        PaperProps={{sx:{backgroundColor:"#0f4c81", color:"white"}}}
                    >
                        <MenuItem disabled>
                        <Typography variant="body2" sx={{opacity:0.8}}>
                            {user ? user.name : "unknown user"}
                        </Typography>
                        </MenuItem>
                        <MenuItem disabled>
                        <Typography variant="body2" sx={{opacity:0.8}}>
                            {user ? user.email : "unknown email"}
                        </Typography>
                        </MenuItem>
                        <Divider sx={{background:"#334155"}} />
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    );
}