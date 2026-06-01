import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  Chip,
} from "@mui/material";


import CodeIcon from "@mui/icons-material/Code";
import GroupsIcon from "@mui/icons-material/Groups";
import TimelineIcon from "@mui/icons-material/Timeline";
import SchoolIcon from "@mui/icons-material/School";
import TerminalIcon from "@mui/icons-material/Terminal";
import SecurityIcon from "@mui/icons-material/Security";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";


const homeTheme = createTheme({
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
    primary: {
      main: "#14b8a6", 
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function Home() {
  const navigate = useNavigate();

  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const teamMembers = [
    { name: "Partha Pratim Makhal", role: "" },
    { name: "Hoomanjli Sambodhi", role: "" },
    { name: "Riya Singh", role: "" },
    { name: "Gargi Mondal", role: "" },
  ];

  const upgrades = [
    {
      title: "Cloud Deployment",
      desc: "Migrated infrastructure to the cloud for real-time global availability.",
      icon: <CloudQueueIcon color="primary" fontSize="large" />,
    },
    {
      title: "Multi-Language Code Execution",
      desc: "Expanded compiling capabilities beyond v1.0 parameters to fully execute Java and other engines smoothly.",
      icon: <TerminalIcon color="primary" fontSize="large" />,
    },
    {
      title: "Role-Based File Access Controls",
      desc: "Granular access layers (Viewers vs. Editors). No more structural overwrites by random guests.",
      icon: <SecurityIcon color="primary" fontSize="large" />,
    },
    {
      title: "OTP Email Verification",
      desc: "Secured user accounts and minimized bot profiles via cryptographic active email handshakes.",
      icon: <CodeIcon color="primary" fontSize="large" />,
    },
    {
      title: "Live Active User Metrics",
      desc: "Real-time socket trackers showing precisely who is active inside workspaces at any millisecond.",
      icon: <GroupsIcon color="primary" fontSize="large" />,
    },
  ];

  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />

  
      <AppBar position="fixed" sx={{ bgcolor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", backgroundImage: "none" }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 1, color: "primary.main" }}>
                ARGUS<span style={{ color: "#fff" }}>CODE</span>
              </Typography>
            </Box>

        
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
              <Button color="inherit" onClick={() => scrollToSection("about")} sx={{ textTransform: "none", fontSize: "1rem" }}>About</Button>
              <Button color="inherit" onClick={() => scrollToSection("team")} sx={{ textTransform: "none", fontSize: "1rem" }}>Our Team</Button>
              <Button color="inherit" onClick={() => scrollToSection("journey")} sx={{ textTransform: "none", fontSize: "1rem" }}>Our Journey</Button>
            </Box>

            
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="text" onClick={() => navigate("/login")} sx={{ textTransform: "none", color: "white" }}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate("/register")} sx={{ textTransform: "none", borderRadius: 2, px: 3, fontWeight: "bold" }}>
                Register
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

    
      <Box id="about" sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 8, md: 12 }, background: "radial-gradient(circle at 50% 10%, #115e5933 0%, #020617 70%)" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="B.Tech Final Year Project" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: "600" }} />
              <Typography variant="h2" component="h1" sx={{ fontWeight: "800", mb: 2, lineHeight: 1.1, fontSize: { xs: "2.8rem", md: "4rem" } }}>
                Watch over your code together.
              </Typography>
              <Typography variant="h5" sx={{ color: "primary.main", fontWeight: "600", mb: 3 }}>
                Real-Time Collaborative Coding Engine
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", fontSize: "1.1rem", mb: 4, lineHeight: 1.7 }}>
                Inspired by <strong>Argus Panoptes</strong>, the mythological Greek giant with a hundred eyes, 
                ArgusCode acts as the definitive pair of eyes watching your repository. Code together, sync files instantly, 
                and compile your systems seamlessly in an all-in-one centralized sandbox environment.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate("/register")}
                sx={{ textTransform: "none", fontSize: "1.1rem", px: 4, py: 1.5, borderRadius: 2, fontWeight: "bold" }}
              >
                Launch Workspace
              </Button>
            </Grid>

            
            <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
              <Box 
                sx={{ 
                  position: "relative",
                  width: "100%", 
                  maxWidth: "450px", 
                  p: 2, 
                  bgcolor: "#0f172a", 
                  borderRadius: 4, 
                  border: "1px solid #1e293b",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                }}
              >
              
                <Box 
                  component="img" 
                  src="/logo_img_WOB.png" 
                  alt="ArgusCode Logo" 
                  sx={{ width: "100%", height: "auto", borderRadius: 2 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

    
      <Box id="team" sx={{ py: 10, bgcolor: "#0f172a" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
            The Architects Behind ArgusCode
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: "text.secondary", mb: 6 }}>
            Department of Information Technology — <strong>Haldia Institute of Technology</strong>
          </Typography>

        
          <Box sx={{ display: "flex", justifyContent: "center", mb: 8 }}>
            <Card sx={{ maxWidth: 550, width: "100%", bgcolor: "#1e293b", border: "1px solid #334155", textAlign: "center", p: 3 }}>
              <CardContent>
                <Avatar sx={{ width: 80, height: 80, mx: "auto", mb: 2, bgcolor: "primary.main" }}>
                  <SchoolIcon fontSize="large" sx={{ color: "#020617" }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
                  Mr. Ayan Mukherji
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: "medium", mt: 0.5 }}>
                  Project Mentor
                </Typography>
                <Divider sx={{ my: 2, borderColor: "#334155" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Assistant Professor • Department of IT <br />
                  Haldia Institute Of Technology
                </Typography>
              </CardContent>
            </Card>
          </Box>

      
          <Grid container spacing={3}>
            {teamMembers.map((member, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ height: "100%", bgcolor: "#020617", border: "1px solid #1e293b", textAlign: "center",p:4, borderRadius: 5, transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                  <Avatar sx={{ width: 60, height: 60, mx: "auto", mb: 2, bgcolor: "#334155", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                    {member.role}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    
      <Box id="journey" sx={{ py: 10, bgcolor: "#020617" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
            Our Journey: Evolution to v2.0
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: "text.secondary", mb: 8 }}>
            How we refactored core structures to scale our application from prototyping to production-ready capabilities.
          </Typography>

          <Grid container spacing={4}>
            {upgrades.map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper variant="outlined" sx={{ p: 4, height: "100%", bgcolor: "#0f172a", borderColor: "#1e293b", borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {item.icon}
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                  <Box sx={{ mt: "auto", pt: 1 }}>
                    <Chip label="v2.0 Feature" size="small" color="primary" sx={{ fontWeight: "bold" }} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      
      <Box sx={{ py: 4, bgcolor: "#020617", borderTop: "1px solid #0f172a", textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            © {new Date().getFullYear()} ArgusCode. Built as an IT Final Year Project at Haldia Institute of Technology.
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}