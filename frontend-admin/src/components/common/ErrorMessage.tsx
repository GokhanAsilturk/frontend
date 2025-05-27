import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  AlertProps,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps extends Omit<AlertProps, 'severity'> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Hata',
  message,
  onRetry,
  retryText = 'Tekrar Dene',
  showRetry = true,
  ...alertProps
}) => {
  return (
    <Alert 
      severity="error" 
      {...alertProps}
      sx={{
        '& .MuiAlert-message': {
          width: '100%',
        },
        ...alertProps.sx,
      }}
    >
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2" sx={{ mb: showRetry && onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      
      {showRetry && onRetry && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            variant="outlined"
            color="error"
          >
            {retryText}
          </Button>
        </Box>
      )}
    </Alert>
  );
};
