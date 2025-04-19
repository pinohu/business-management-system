import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotification } from '../../store/slices/uiSlice';
import { useTranslation } from 'react-i18next';

const NotificationSystem = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const notifications = useSelector((state) => state.ui.notifications);

  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 6000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{
            vertical: notification.position?.vertical || 'top',
            horizontal: notification.position?.horizontal || 'right',
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type || 'info'}
            variant={notification.variant || 'filled'}
            sx={{ width: '100%' }}
          >
            {notification.title && (
              <AlertTitle>{t(notification.title)}</AlertTitle>
            )}
            {t(notification.message)}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationSystem; 