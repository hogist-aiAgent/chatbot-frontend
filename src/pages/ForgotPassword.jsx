import React, { useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/auth/forgot-password', { username });
      setMessage('If an account exists, a reset link has been sent to the system logs.');
    } catch (error) {
      setMessage('Error processing request.');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F7FAFC' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Forgot Password</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your username. We will generate a reset link.
        </Typography>

        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth label="Username" variant="outlined" 
            value={username} onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, bgcolor: '#B11226' }}>
            Send Reset Link
          </Button>
        </form>
        <Button onClick={() => navigate('/login')} size="small">Back to Login</Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;