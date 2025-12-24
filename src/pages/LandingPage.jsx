import React from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Button, Box, Grid, Paper, Chip, useMediaQuery, Avatar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Groups, Bolt } from '@mui/icons-material';
import ChatWidget from '../components/ChatWidget';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <AppBar position="fixed" sx={{ bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 36, height: 36, bgcolor: 'primary.main', borderRadius: 2, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 
              }}>H</Box>
              <Typography variant="h5" color="text.primary" fontWeight={800}>Hogist</Typography>
            </Box>
            <Button 
              variant="contained" color="primary" 
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 50, px: 3 }}
            >
              Access Dashboard
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ mt: 15, mb: 10, position: 'relative' }}>
        
        {/* Background Gradients */}
        <Box sx={{
          position: 'absolute', top: -100, right: -100, width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(156,74,74,0.08) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%', zIndex: -1
        }} />

        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Chip 
              icon={<Bolt fontSize="small" />} 
              label="The Future of Bulk Catering" 
              sx={{ bgcolor: '#FFF5F5', color: 'primary.main', fontWeight: 700, mb: 3 }} 
            />
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '3rem', md: '4.5rem' }, 
              fontWeight: 800, lineHeight: 1.1, mb: 3,
              letterSpacing: '-2px'
            }}>
              Feed your team, <br/>
              <span style={{ color: '#9c4a4a' }}>not the stress.</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
              Hogist connects companies and events with top-tier cloud kitchens. 
              AI-driven coordination, zero hassle.
            </Typography>
            
            <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
              <Button variant="contained" size="large" sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}>
                Start Ordering
              </Button>
              <Button variant="outlined" size="large" sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderColor: '#ccc', color: '#555' }}>
                View Demo
              </Button>
            </Box>

            <Box mt={6} display="flex" gap={4}>
              <Box>
                <Typography variant="h4" fontWeight={800}>2.5k+</Typography>
                <Typography variant="body2" color="text.secondary">Events</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>98%</Typography>
                <Typography variant="body2" color="text.secondary">Satisfaction</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Paper 
                elevation={24}
                sx={{ 
                  borderRadius: '40px', overflow: 'hidden', 
                  border: '8px solid rgba(255,255,255,0.5)',
                  transform: 'rotate(-2deg)', transition: 'transform 0.3s',
                  '&:hover': { transform: 'rotate(0deg) scale(1.02)' }
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" 
                  style={{ width: '100%', display: 'block' }} 
                  alt="Food"
                />
              </Paper>
              
              {/* Floating Element */}
              <Paper 
                elevation={10}
                sx={{ 
                  position: 'absolute', bottom: 40, left: -40, p: 2, 
                  borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 
                }}
              >
                <Avatar sx={{ bgcolor: '#48BB78' }}><Groups /></Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Corporate Lunch</Typography>
                  <Typography variant="caption">Processing for 50 Pax...</Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      <ChatWidget />
    </Box>
  );
};

export default LandingPage;