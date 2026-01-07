import React, { useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', msg: "Passwords don't match" });
      return;
    }

    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { token, new_password: password });
      setStatus({ type: 'success', msg: 'Password reset successfully!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'Invalid or expired token.' });
    }
  };

  if (!token) return <Typography p={5}>Invalid Link</Typography>;

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F7FAFC' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Reset Password</Typography>
        
        {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth type="password" label="New Password" margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />
          <TextField 
            fullWidth type="password" label="Confirm Password" margin="normal"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, bgcolor: '#B11226' }}>
            Set New Password
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;