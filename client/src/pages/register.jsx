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
  Snackbar
} from '@mui/material';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import { useNavigate} from 'react-router-dom';

function CustomUsernameField({ value, onChange }) {
  return (
    <TextField
      id="input-with-icon-name"
      label="Name"
      name="name"
      value={value}
      onChange={onChange}
      type="text"
      size="small"
      required
      fullWidth
      sx={{ my: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AccountCircle fontSize="inherit" />
          </InputAdornment>
        ),
      }}
      variant="outlined"
    />
  );
}

function CustomEmailField({ value, onChange }) {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Email"
      name="email"
      value={value}
      onChange={onChange}
      type="email"
      size="small"
      required
      fullWidth
      sx={{ my: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <MailOutlinedIcon fontSize='inherit'/>
          </InputAdornment>
        ),
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField({ value, onChange }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <FormControl sx={{ my: 1 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={value}
        onChange={onChange}
        size="small"
        required
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function CustomButton() {
  return (
    <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ my: 2 }}>
      Register
    </Button>
  );
}

function SignInLink() {
  return (
    <Typography variant="body2">
      
      Already have an account?{' '}
      <Link href="/login" variant="body2" underline="hover">
        Login
      </Link>
    </Typography>
  );
}

function Title() {
  return (
    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
      Create Account
    </Typography>
  );
}

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", formData);
      setSuccess(true);
      navigate("/login");
    //   setTimeout(() => navigate("/verify",{state:{email:formData.email}}), 500);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    }
  };

  return (
    <AppProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Box
          sx={{
            p: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 3,
            maxWidth: 400,
            width: '100%',
            bgcolor: 'background.paper'
          }}
        >
          <form noValidate onSubmit={handleSubmit}>
            <Title />

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

            <CustomUsernameField value={formData.username} onChange={handleChange} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>  
            <CustomEmailField value={formData.email} onChange={handleChange} />
            </Box>
           
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>  
            <CustomOTPField value={formData.otp} onChange={handleChange} />
            <CustomOTPButton name="Verify" task={handleVerifyOTP} />
            </Box> */}
            
            <CustomPasswordField value={formData.password} onChange={handleChange} />
            <CustomButton />
            <Box sx={{ textAlign: 'center' }}>
              <SignInLink />
            </Box>
          </form>
        </Box>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </AppProvider>
  );
}
