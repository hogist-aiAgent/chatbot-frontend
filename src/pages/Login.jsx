import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, credentials);
      
      // Store Token
      localStorage.setItem('hogist_token', res.data.access_token);
      localStorage.setItem('hogist_user', credentials.username);
      
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#F7FAFC',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(177, 18, 38, 0.05) 0%, rgba(255, 255, 255, 0) 90%)'
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          p: 5, 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: 4, 
          textAlign: 'center' 
        }}
      >
        <Box mb={3} display="flex" flexDirection="column" alignItems="center">
           <img src="/logo.png" alt="Hogist" style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 15 }} />
           <Typography variant="h5" fontWeight="800" color="#2C3E50">Admin Login</Typography>
           <Typography variant="body2" color="text.secondary">Secure access to Hogist CRM</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField 
            fullWidth label="Username" name="username" 
            variant="outlined" margin="normal"
            value={credentials.username} onChange={handleChange}
            InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action" /></InputAdornment>) }}
          />
          
          <TextField 
            fullWidth label="Password" name="password" type={showPassword ? "text" : "password"}
            variant="outlined" margin="normal"
            value={credentials.password} onChange={handleChange}
            InputProps={{ 
              startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button 
            type="submit" fullWidth variant="contained" size="large" 
            disabled={loading}
            sx={{ 
              mt: 3, mb: 2, py: 1.5, borderRadius: 2, 
              bgcolor: '#B11226', fontWeight: 'bold', fontSize: '1rem',
              '&:hover': { bgcolor: '#8B0E1A' } 
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
          <Box textAlign="right" mt={1}>
            <Typography 
                variant="caption" 
                color="primary" 
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => navigate('/forgot-password')}
            >
                Forgot Password?
            </Typography>
        </Box>
        </form>
        
        <Button onClick={() => navigate('/')} sx={{ textTransform: 'none', color: '#718096' }}>
            Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;