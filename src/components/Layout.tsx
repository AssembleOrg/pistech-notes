import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Note as NoteIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Notas', icon: <NoteIcon />, path: '/notes' },
  { text: 'Proyectos', icon: <BusinessIcon />, path: '/projects' },
  { text: 'Cobros a Clientes', icon: <PaymentIcon />, path: '/client-charges' },
  { text: 'Pagos a Socios', icon: <PaymentIcon />, path: '/partner-payments' },
  { text: 'Socios', icon: <PeopleIcon />, path: '/partners' },
  { text: 'Logs', icon: <AssessmentIcon />, path: '/logs' },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuthStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          P
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Pistech Notes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestión de Proyectos
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.50' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.100' : 'action.hover',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'primary.main' : 'text.secondary',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'medium' : 'regular',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Section */}
      {isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 40, height: 40 }}>
                <AccountIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {user?.email || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role || 'Usuario'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Pistech Notes'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
            </IconButton>

            {/* Logout Button */}
            {isAuthenticated && (
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
} 