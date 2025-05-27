import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  severity?: 'warning' | 'error' | 'info';
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Onayla',
    cancelText: 'İptal',
    severity: 'warning',
  });

  const openConfirmDialog = useCallback((options: Omit<ConfirmDialogState, 'isOpen'>) => {
    setDialogState({
      ...options,
      isOpen: true,
      confirmText: options.confirmText || 'Onayla',
      cancelText: options.cancelText || 'İptal',
      severity: options.severity || 'warning',
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);  const handleConfirm = useCallback(async () => {
    if (dialogState.onConfirm) {
      await dialogState.onConfirm();
    }
    closeConfirmDialog();
  }, [dialogState, closeConfirmDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    closeConfirmDialog();
  }, [dialogState, closeConfirmDialog]);

  const confirmDelete = useCallback((
    itemName: string,
    onConfirm: () => void | Promise<void>
  ) => {
    openConfirmDialog({
      title: 'Silme Onayı',
      message: `"${itemName}" öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      severity: 'error',
      onConfirm,
    });
  }, [openConfirmDialog]);

  const confirmBulkDelete = useCallback((
    count: number,
    onConfirm: () => void | Promise<void>
  ) => {
    openConfirmDialog({
      title: 'Toplu Silme Onayı',
      message: `Seçilen ${count} öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Hepsini Sil',
      cancelText: 'İptal',
      severity: 'error',
      onConfirm,
    });
  }, [openConfirmDialog]);

  const confirmStatusChange = useCallback((
    itemName: string,
    newStatus: string,
    onConfirm: () => void | Promise<void>
  ) => {
    openConfirmDialog({
      title: 'Durum Değişikliği Onayı',
      message: `"${itemName}" öğesinin durumunu "${newStatus}" olarak değiştirmek istediğinizden emin misiniz?`,
      confirmText: 'Değiştir',
      cancelText: 'İptal',
      severity: 'warning',
      onConfirm,
    });
  }, [openConfirmDialog]);

  return {
    dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
    handleCancel,
    confirmDelete,
    confirmBulkDelete,
    confirmStatusChange,
  };
};
