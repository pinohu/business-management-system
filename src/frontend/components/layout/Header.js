import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(2),
  width: '300px',
}));

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 0, mr: 2 }}>
          ABMS
        </Typography>

        <SearchBox>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Search...
          </Typography>
        </SearchBox>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              sx={{ mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                alt="User Name"
                src="/static/images/avatar/1.jpg"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <SettingsIcon sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            maxHeight: 400,
            width: 360,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Typography variant="body2">New document processed</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">System update available</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">Task completed</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">New message received</Typography>
        </MenuItem>
      </Menu>
    </StyledAppBar>
  );
};

export default Header; 