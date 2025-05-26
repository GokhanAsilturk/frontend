import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 },
          pb: 2,
          px: { xs: 1, sm: 2, md: 3 },
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;