import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Collapse,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  Assignment,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  GroupAdd,
  AssignmentTurnedIn,
  BugReport,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'students',
    label: 'Öğrenci Yönetimi',
    icon: <People />,
    children: [
      {
        id: 'students-list',
        label: 'Öğrenci Listesi',
        icon: <People />,
        path: '/students',
      },
      {
        id: 'students-add',
        label: 'Öğrenci Ekle',
        icon: <PersonAdd />,
        path: '/students/add',
      },
    ],
  },
  {
    id: 'courses',
    label: 'Ders Yönetimi',
    icon: <School />,
    children: [
      {
        id: 'courses-list',
        label: 'Ders Listesi',
        icon: <School />,
        path: '/courses',
      },
      {
        id: 'courses-add',
        label: 'Ders Ekle',
        icon: <GroupAdd />,
        path: '/courses/add',
      },
    ],
  },
  {
    id: 'enrollments',
    label: 'Kayıt Yönetimi',
    icon: <Assignment />,
    children: [
      {
        id: 'enrollments-list',
        label: 'Kayıt Listesi',
        icon: <Assignment />,
        path: '/enrollments',
      },
      {
        id: 'enrollments-add',
        label: 'Kayıt Ekle',
        icon: <AssignmentTurnedIn />,
        path: '/enrollments/add',      },
    ],  },
  {
    id: 'admins',
    label: 'Admin Yönetimi',
    icon: <AdminPanelSettings />,
    children: [
      {
        id: 'admins-list',
        label: 'Admin Listesi',
        icon: <AdminPanelSettings />,
        path: '/admins',
      },
      {
        id: 'admins-add',
        label: 'Admin Ekle',
        icon: <PersonAdd />,
        path: '/admins/create',
      },
    ],
  },
  {
    id: 'error-logs',
    label: 'Hata Logları',
    icon: <BugReport />,
    path: '/error-logs',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['students']);

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const isItemActive = (path: string | undefined) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => (
    <React.Fragment key={item.id}>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleItemClick(item)}
          selected={isItemActive(item.path)}
          sx={{
            pl: 2 + level * 2,
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: isItemActive(item.path) ? 'primary.main' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} />
          {item.children && (
            expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>
      </ListItem>
      
      {item.children && (
        <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Mobil cihazlarda daha iyi açılma performansı.
      }}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar sx={{ backgroundColor: '#0f172a', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <AdminPanelSettings />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.400' }}>
              Yönetim Sistemi
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'grey.700' }} />
      <List sx={{ pt: 2 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
