import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Button,
  TextField,
  InputAdornment,
  Alert,
  Box,
  Snackbar
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import AccountCircle from '@mui/icons-material/AccountCircle';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';


function CustomOTPField({ value, onChange }) {
  return (
    <TextField
      id="input-with-icon-otp"
      label="OTP"
      name="otp"
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


function CustomOTPButton({name,task,visible=false}) {
  return (
    <Button type="submit" onClick={task} variant="contained" color="primary" fullWidth sx={{ my: 2 }} disabled={visible}>
      {name}
    </Button>
  );

}

export default function Verify() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const location = useLocation();
  const [disabled, setDisabled] = useState(false);

  const disableButton = () => {
    setDisabled(true);
    setTimeout(() => setDisabled(false), 30000); 
  }

   const handleVerifyOTP= async(e)=>{
    e.preventDefault();
    try {
      const response = await api.post("/auth/verify", { verificationCode: otp });
      setAlertMessage(response.data.msg);
      setAlertSeverity("success");
      setOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setAlertMessage(err.response?.data?.msg || "Verification failed. Please try again.");
        setAlertSeverity("error");
      setOpen(true);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
  const email = location.state?.email;
    if (!email) {
      setAlertMessage("Email not found. Please register again.");
      setAlertSeverity("error");
      setOpen(true);
      return;
    }
    try {
      await api.post("/auth/send-verification-code", { email });
      setAlertMessage("OTP sent successfully.");
      setAlertSeverity("success");
      setOpen(true);
      disableButton();
    } catch (err) {
      setAlertMessage(err.response?.data?.msg || "Resending OTP failed. Please try again.");
      setAlertSeverity("error");
      setOpen(true);
    }
  };

  return(
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
          <form noValidate onSubmit={handleVerifyOTP}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>  
            <CustomOTPField value={otp} onChange={(e) => setOtp(e.target.value)} />
            <CustomOTPButton name="Verify" task={handleVerifyOTP} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CustomOTPButton name="Resend OTP" task={handleResendOTP} visible={disabled} />
            </Box>
           
          </form>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </AppProvider>
  )


}