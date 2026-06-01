import * as React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const forgetTheme = createTheme({
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

export default function ForgetPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [disabled, setDisabled] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      showSnackbar("Please enter your email.", "error");
      return;
    }
    try {
      await api.post("/auth/send-verification-code", { email });
      showSnackbar("OTP Sent successfully.", "success");
      setDisabled(true);
      setTimeout(() => setDisabled(false), 30000); 
    } catch (err) {
      showSnackbar(err.response?.data?.msg || "Sending OTP failed. Please try again.", "error");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      showSnackbar("Please fill out the OTP token field.", "error");
      return;
    }
    try {
      const response = await api.post("/auth/verify", { verificationCode: otp });
      showSnackbar(response.data.msg || "OTP Verified! Now update your credentials.", "success");
      setIsVerified(true);
    } catch (err) {
      showSnackbar(err.response?.data?.msg || "Verification failed. Please try again.", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showSnackbar("Passwords do not match.", "error");
      return;
    }
    try {
      const response = await api.post("/auth/reset-password", { email, newPassword });
      showSnackbar(response.data.msg || "Password reset successful!", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showSnackbar(err.response?.data?.msg || "Password reset failed. Please try again.", "error");
    }
  };

  return (
    <ThemeProvider theme={forgetTheme}>
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
            alignItems: 'center',
            position: 'relative',
            px: { xs: 3, sm: 6, md: 8 },
            py: 4,
            bgcolor: '#0f172a',
            minHeight: '100vh',
          }}
        >
          
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{
              position: 'absolute',
              top: 24,
              left: { xs: 16, sm: 40 },
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Back to Login
          </Button>

          <Box sx={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', pt: { xs: 6, sm: 0 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Reset Access
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Verify identity credentials to authorize terminal key recovery.
              </Typography>
            </Box>

            {!isVerified ? (
              <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  disabled={isVerified}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResendOTP}
                  disabled={disabled}
                  sx={{ py: 1.2, textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                >
                  {disabled ? "Cooling Down (30s)..." : "Send Verification OTP"}
                </Button>

              
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Enter Secure OTP Token"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  onClick={handleVerifyOTP}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                  }}
                >
                  Verify Token
                </Button>
              </Box>
            ) : (
              
              <Box component="form" noValidate onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
                  Identity token validated. Enter your updated access credentials below.
                </Alert>

                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    label="New Password"
                  />
                </FormControl>

                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Confirm New Password</InputLabel>
                  <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirm New Password"
                  />
                </FormControl>

                {newPassword && confirmPassword && (
                  <Typography variant="caption" sx={{ color: newPassword === confirmPassword ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                    {newPassword === confirmPassword ? "✓ Credentials match perfectly" : "✗ Credentials do not match"}
                  </Typography>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={newPassword !== confirmPassword || !newPassword}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                  }}
                >
                  Apply Updated Password
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

      
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background: 'radial-gradient(circle at 30% 30%, #115e5944 0%, #020617 80%)',
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
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}