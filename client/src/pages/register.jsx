import * as React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  Alert,
  IconButton,
  Typography,
  Box,
  Snackbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Grid,
} from '@mui/material';

import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const registerTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617', 
      paper: '#0f172a',   
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8', 
    },
    primary: {
      main: '#14b8a6', 
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", formData);
      setSuccess(true);
      setTimeout(() => navigate("/verify",{state:{email:formData.email}}), 500);
      
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={registerTheme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        
        
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={0}
          square
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            px: { xs: 3, sm: 6, md: 8 },
            bgcolor: '#0f172a',
          }}
        >
        
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 24,
              left: { xs: 16, sm: 40 },
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Back to Home
          </Button>

          <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', my: 'auto', pt: { xs: 8, sm: 0 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Join the real-time collaborative coding workspace.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit}>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

            
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              
              <FormControl sx={{ mt: 2, mb: 3 }} fullWidth variant="outlined" required>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>


              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  mb: 3,
                  boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                }}
              >
                Sign Up Now
              </Button>

              
              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link
                  href="/login"
                  underline="none"
                  sx={{ color: 'primary.main', fontWeight: '600', '&:hover': { underline: 'hover' } }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background: 'radial-gradient(circle at 70% 30%, #115e5944 0%, #020617 80%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            borderLeft: '1px solid #1e293b',
          }}
        >
          <Box sx={{ maxWidth: '440px', textAlign: 'center' }}>
            <Box
              component="img"
              src="/logo_img_WOB.png"
              alt="ArgusCode Logo"
              sx={{
                width: '100%',
                maxHeight: '280px',
                objectFit: 'contain',
                borderRadius: 4,
                mb: 4,
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: '800', mb: 1, letterSpacing: 1 }}>
              ARGUS<span style={{ color: '#14b8a6' }}>CODE</span>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Distributed source tracking, custom execution modules, and multi-user sync environments built seamlessly into a single workspace.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}