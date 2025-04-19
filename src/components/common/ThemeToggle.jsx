import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { setThemeMode } from '../../store/slices/uiSlice';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { themeMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleThemeToggle = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newMode));
    toggleTheme();
  };

  return (
    <Tooltip title={t(`settings.theme.${themeMode}Mode`)}>
      <IconButton
        color="inherit"
        onClick={handleThemeToggle}
        aria-label={t(`settings.theme.${themeMode}Mode`)}
      >
        {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 