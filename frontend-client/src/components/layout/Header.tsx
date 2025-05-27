import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  School,
  Dashboard,
  ExitToApp,
  Book
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };
  
  const navigationItems = [
    { label: 'Ana Sayfa', path: '/', icon: <Dashboard /> },
    { label: 'Tüm Dersler', path: '/courses', icon: <School /> },
    { label: 'Derslerim', path: '/enrolled-courses', icon: <Book /> },
    { label: 'Profilim', path: '/profile', icon: <Person /> }
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const displayName = user?.firstName ?? user?.username ?? 'Öğrenci';
  const avatarLetter = user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? 'Ö';

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={() => navigate('/')}
          >
            Öğrenci Yönetim Sistemi
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Hoş geldiniz, {displayName}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {avatarLetter}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); handleProfileMenuClose(); }}>
          <Person sx={{ mr: 1 }} />
          Profilim
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Çıkış Yap
        </MenuItem>
      </Menu>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 8 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem 
                component="div"
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;