import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  TrendingUp,
  PersonAdd,
  SchoolOutlined,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DashboardStats, RecentActivity } from '../../types';

// Örnek veri - Bu veriler gerçek API'den gelecek
const mockStats: DashboardStats = {
  totalStudents: 150,
  totalCourses: 25,
  totalEnrollments: 320,
  activeCourses: 22,
};

const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'student_created',
    description: 'Yeni öğrenci eklendi: Ahmet Yılmaz',
    createdAt: new Date().toISOString(),
    user: 'Admin',
  },
  {
    id: '2',
    type: 'course_created',
    description: 'Yeni ders oluşturuldu: React Programlama',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: 'Admin',
  },
  {
    id: '3',
    type: 'enrollment_created',
    description: 'Öğrenci kaydı yapıldı: Matematik 101',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: 'Admin',
  },
  {
    id: '4',
    type: 'student_created',
    description: 'Yeni öğrenci eklendi: Fatma Demir',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: 'Admin',
  },
  {
    id: '5',
    type: 'enrollment_deleted',
    description: 'Öğrenci kaydı silindi: Fizik 201',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user: 'Admin',
  },
];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
      borderRadius: 3,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${color}20`,
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: color }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ 
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          width: 56, 
          height: 56,
          boxShadow: `0 4px 20px ${color}40`,
        }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'student_created':
      return <PersonAdd />;
    case 'course_created':
      return <SchoolOutlined />;
    case 'enrollment_created':
      return <AssignmentTurnedIn />;
    case 'enrollment_deleted':
      return <Assignment />;
    default:
      return <TrendingUp />;
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'student_created':
      return 'success';
    case 'course_created':
      return 'primary';
    case 'enrollment_created':
      return 'info';
    case 'enrollment_deleted':
      return 'warning';
    default:
      return 'default';
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours === 0) {
    return 'Az önce';
  } else if (diffInHours === 1) {
    return '1 saat önce';
  } else if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-student':
        navigate('/students/add');
        break;
      case 'add-course':
        navigate('/courses/add');
        break;
      case 'add-enrollment':
        navigate('/enrollments/add');
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Öğrenci"
            value={mockStats.totalStudents}
            icon={<People />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Ders"
            value={mockStats.totalCourses}
            icon={<School />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kayıt"
            value={mockStats.totalEnrollments}
            icon={<Assignment />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktif Ders"
            value={mockStats.activeCourses}
            icon={<TrendingUp />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Son Aktiviteler */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Son Aktiviteler
            </Typography>
            <List>
              {mockRecentActivities.map((activity, index) => (
                <ListItem key={activity.id} divider={index < mockRecentActivities.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: `${getActivityColor(activity.type)}.main` }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          {formatRelativeTime(activity.createdAt)}
                        </Typography>
                        {activity.user && (
                          <Chip 
                            label={activity.user} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Hızlı İşlemler */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hızlı İşlemler
            </Typography>            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card 
                variant="outlined" 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => handleQuickAction('add-student')}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonAdd color="primary" />
                  <Typography variant="body1">Yeni Öğrenci Ekle</Typography>
                </CardContent>
              </Card>
              
              <Card 
                variant="outlined" 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => handleQuickAction('add-course')}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SchoolOutlined color="primary" />
                  <Typography variant="body1">Yeni Ders Ekle</Typography>
                </CardContent>
              </Card>
              
              <Card 
                variant="outlined" 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => handleQuickAction('add-enrollment')}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentTurnedIn color="primary" />
                  <Typography variant="body1">Yeni Kayıt Oluştur</Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
