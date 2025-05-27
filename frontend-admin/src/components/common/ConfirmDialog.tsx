import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ConfirmDialogState } from '../../hooks';

interface ConfirmDialogProps {
  dialogState: ConfirmDialogState;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  dialogState,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const theme = useTheme();

  const getSeverityIcon = () => {
    switch (dialogState.severity) {
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 48 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 48 }} />;
      case 'info':
        return <InfoIcon sx={{ color: theme.palette.info.main, fontSize: 48 }} />;
      default:
        return <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 48 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (dialogState.severity) {
      case 'error':
        return 'error' as const;
      case 'warning':
        return 'warning' as const;
      case 'info':
        return 'primary' as const;
      default:
        return 'warning' as const;
    }
  };

  return (
    <Dialog
      open={dialogState.isOpen}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {getSeverityIcon()}
          <Typography variant="h6" component="div">
            {dialogState.title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {dialogState.message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
        >
          {dialogState.cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
          disabled={loading}
          autoFocus
        >
          {dialogState.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
