import * as React from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  IconButton,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { AuthContext } from '../context/authContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

function CustomEmailField() {
  return (
    <TextField
      label="Email"
      name="email"
      type="email"
      size="small"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <MailOutlinedIcon fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        size="small"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
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
    <Button type="submit" variant="outlined" color="info" size="small" fullWidth sx={{ my: 2 }}>
      Log In
    </Button>
  );
}

function SignUpLink() {
  return (
    <>
      <span>New user..? </span>
      <Link href="/register" variant="body2" underline="none">Register</Link>
    </>
  );
}

function ForgotPasswordLink() {
  return (
    <Box textAlign="center">
      <Link href="/forget-password" variant="body2">Forgot password?</Link>
    </Box>
  );
}

function Title() {
  return (
    <Typography component="div">
      <Box sx={{ fontFamily: 'Monospace', fontSize: 'h4.fontSize', fontWeight: 'bold', m: 1 }}>
        LOGIN
      </Box>
    </Typography>
  );
}

export default function Login() {
  const theme = useTheme();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

     const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleLogin = async (provider, formData,event) => {
    event.preventDefault; 
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await login(email, password);

      showSnackbar("Login successful!", "success");

      setTimeout(() => {
      navigate("/");
    }, 800);

    } catch (error) {
      showSnackbar(`${error.response?.data?.msg || error.message}`, "error");

    }
  };

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={handleLogin}
        slots={{
          title: Title,
          emailField: CustomEmailField,
          passwordField: CustomPasswordField,
          submitButton: CustomButton,
          signUpLink: SignUpLink,
          forgotPasswordLink: ForgotPasswordLink,
        }}
        slotProps={{ form: { noValidate: true } }}
        providers={providers}
      />
      <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
    </AppProvider>
  );
}
