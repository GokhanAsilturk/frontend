import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { NotificationSnackbar, ConfirmDialog } from '../common';
import { useNotification, useConfirmDialog } from '../../hooks';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { notifications, removeNotification } = useNotification();
  const { dialogState, handleConfirm, handleCancel } = useConfirmDialog();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        {children}
      </Box>

      {/* Global Dialogs and Notifications */}
      <NotificationSnackbar
        notifications={notifications}
        onClose={removeNotification}
      />
      
      <ConfirmDialog
        dialogState={dialogState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default MainLayout;
