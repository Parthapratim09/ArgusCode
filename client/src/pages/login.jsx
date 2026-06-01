import * as React from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Grid,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { AuthContext } from '../context/authContext.jsx';

const loginTheme = createTheme({
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

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      await login(email, password);
      showSnackbar('Welcome back! Login successful.', 'success');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (error) {
      showSnackbar(`${error.response?.data?.message || error.message}`, 'error');
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Grid container sx={{ minHeight: '100vh' }}>
        
        
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
            borderRight: '1px solid #1e293b',
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
              The comprehensive hundred-eyed platform keeping watch over your repository workspace in real time.
            </Typography>
          </Box>
        </Grid>

      
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

          <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', my: 'auto' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Securely log into your collaborative programming console.
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              
              <FormControl sx={{ mt: 2, mb: 1 }} fullWidth variant="outlined" required>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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

              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Link
                  href="/forgot-password"
                  variant="body2"
                  underline="hover"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  Forgot password?
                </Link>
              </Box>

          
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
                Sign In to Platform
              </Button>

            
              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                New user?{' '}
                <Link
                  href="/register"
                  underline="none"
                  sx={{ color: 'primary.main', fontWeight: '600', '&:hover': { underline: 'hover' } }}
                >
                  Register an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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