import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
  fullWidth?: boolean;
  showRetryButton?: boolean;
}

/**
 * Hata mesajı bileşeni - kullanıcıya hata durumlarını göstermek için kullanılır
 */
const ErrorMessage: React.FC<Readonly<ErrorMessageProps>> = ({
  title = 'Bir Hata Oluştu',
  message,
  onRetry,
  severity = 'error',
  fullWidth = false,
  showRetryButton = true
}) => {
  /**
   * Tekrar dene butonuna tıklandığında çalışır
   */
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        maxWidth: fullWidth ? 'none' : 600,
        mx: fullWidth ? 0 : 'auto',
        p: 2,
      }}
    >
      <Alert
        severity={severity}
        sx={{
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        <Typography variant="body2" sx={{ mb: showRetryButton && onRetry ? 2 : 0 }}>
          {message}
        </Typography>
        
        {showRetryButton && onRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{
              mt: 1,
              borderColor: severity === 'error' ? 'error.main' : 'primary.main',
              color: severity === 'error' ? 'error.main' : 'primary.main',
              '&:hover': {
                borderColor: severity === 'error' ? 'error.dark' : 'primary.dark',
                backgroundColor: severity === 'error' ? 'error.light' : 'primary.light',
              },
            }}
          >
            Tekrar Dene
          </Button>
        )}
      </Alert>
    </Box>
  );
}

export default ErrorMessage;