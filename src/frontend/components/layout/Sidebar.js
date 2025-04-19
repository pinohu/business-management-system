import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  People as ClientIcon,
  Assignment as ProjectIcon,
  Receipt as InvoiceIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedDrawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedDrawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    title: 'Documents',
    icon: <DocumentIcon />,
    path: '/documents',
    subItems: [
      { title: 'All Documents', path: '/documents/all' },
      { title: 'Processed', path: '/documents/processed' },
      { title: 'Pending', path: '/documents/pending' },
    ],
  },
  {
    title: 'Clients',
    icon: <ClientIcon />,
    path: '/clients',
  },
  {
    title: 'Projects',
    icon: <ProjectIcon />,
    path: '/projects',
  },
  {
    title: 'Invoices',
    icon: <InvoiceIcon />,
    path: '/invoices',
  },
  {
    title: 'Reports',
    icon: <ReportIcon />,
    path: '/reports',
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItems((prev) =>
        prev.includes(item.title)
          ? prev.filter((title) => title !== item.title)
          : [...prev, item.title]
      );
    } else {
      navigate(item.path);
    }
  };

  const isItemActive = (path) => {
    return location.pathname === path;
  };

  const isSubItemActive = (item) => {
    return item.subItems?.some((subItem) => isItemActive(subItem.path));
  };

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      anchor="left"
    >
      <DrawerHeader>
        {open && (
          <Typography variant="h6" noWrap component="div">
            ABMS
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                selected={isItemActive(item.path) || isSubItemActive(item)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary={item.title} />
                    {item.subItems && (
                      expandedItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse in={open && expandedItems.includes(item.title)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.title}
                      onClick={() => navigate(subItem.path)}
                      selected={isItemActive(subItem.path)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={subItem.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar; 