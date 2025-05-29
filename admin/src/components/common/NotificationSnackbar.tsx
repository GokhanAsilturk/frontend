import React from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  SlideProps,
} from '@mui/material';
import { Notification } from '../../hooks';

interface NotificationSnackbarProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="up" />;
};

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  notifications,
  onClose,
}) => {
  // Show only the most recent notification
  const currentNotification = notifications[notifications.length - 1];

  if (!currentNotification) return null;

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose(currentNotification.id);
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={currentNotification.duration ?? 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: 300,
        }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};
