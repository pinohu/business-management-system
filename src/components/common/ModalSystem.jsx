import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice';
import { useTranslation } from 'react-i18next';

const ModalSystem = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const modals = useSelector((state) => state.ui.modals);

  const handleClose = (id) => {
    dispatch(closeModal({ id }));
  };

  return (
    <>
      {Object.entries(modals).map(([id, modal]) => (
        <Dialog
          key={id}
          open={modal.open}
          onClose={() => handleClose(id)}
          maxWidth={modal.props?.maxWidth || 'sm'}
          fullWidth={modal.props?.fullWidth || true}
          PaperProps={{
            sx: {
              minHeight: modal.props?.minHeight || 'auto',
              maxHeight: modal.props?.maxHeight || '90vh',
            },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6">
                {t(modal.props?.title || '')}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => handleClose(id)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers={modal.props?.dividers}>
            {modal.props?.content}
          </DialogContent>
          {modal.props?.actions && (
            <DialogActions>
              {modal.props.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    action.onClick?.();
                    if (action.closeOnClick) {
                      handleClose(id);
                    }
                  }}
                  color={action.color || 'primary'}
                  variant={action.variant || 'text'}
                  disabled={action.disabled}
                >
                  {t(action.label)}
                </Button>
              ))}
            </DialogActions>
          )}
        </Dialog>
      ))}
    </>
  );
};

export default ModalSystem; 