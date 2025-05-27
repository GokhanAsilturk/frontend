import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Backdrop,
  BoxProps 
} from '@mui/material';

interface LoadingSpinnerProps extends Omit<BoxProps, 'size'> {
  size?: number;
  message?: string;
  overlay?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  overlay = false,
  color = 'primary',
  ...boxProps
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      {...boxProps}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Backdrop
        open={true}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};
