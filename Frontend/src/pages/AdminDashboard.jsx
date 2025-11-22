import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  IconButton,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person,
  School,
  Assignment,
  Add,
  BarChart,
  ExitToApp,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  EventNote as EventNoteIcon,
  Security as SecurityIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden',
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 25px 0 rgba(0,0,0,0.09)',
    transform: 'translateY(-4px)',
  }
}));

const GradientBox = styled(Box)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(45deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  color: theme.palette[color].contrastText,
  borderRadius: 16,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 6px 20px 0 ${alpha(theme.palette[color].main, 0.25)}`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at top right, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 60%)`,
    pointerEvents: 'none',
  }
}));

const StyledChip = styled(Chip)(({ theme, statuscolor = 'default' }) => {
  const getColor = () => {
    switch (statuscolor) {
      case 'active': return theme.palette.success;
      case 'scheduled': return theme.palette.info;
      case 'completed': return theme.palette.secondary;
      case 'upcoming': return theme.palette.primary;
      default: return theme.palette.grey;
    }
  };

  const color = getColor();

  return {
    backgroundColor: alpha(color.main, 0.1),
    color: color.main,
    fontWeight: 600,
    borderRadius: 8,
    '& .MuiChip-label': {
      padding: '0 8px',
    }
  };
});

const QuickLinkButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(3),
}));

const WelcomeHeader = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4, 4, 5),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/patterns/circuit-board.svg")',
    backgroundSize: 'cover',
    opacity: 0.1,
    pointerEvents: 'none',
  },
}));

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
    recentExams: [],
    upcomingExam: null,
    studentsOnline: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const theme = useTheme();

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const [studentsRes, examsRes] = await Promise.all([
        axios.get('/api/v1/admin/students'),
        axios.get('/api/v1/exam'),
      ]);

      // Sort exams by date (newest first)
      const sortedExams = examsRes.data.exams.sort((a, b) =>
        new Date(b.startTime) - new Date(a.startTime)
      );

      // Find upcoming exam (future date closest to now)
      const now = new Date();
      const upcomingExam = sortedExams.find(exam => new Date(exam.startTime) > now);

      // Calculate active and completed exams
      const activeExams = sortedExams.filter(exam => {
        const startTime = new Date(exam.startTime);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + exam.duration);
        return startTime <= now && endTime >= now;
      }).length;

      const completedExams = sortedExams.filter(exam => {
        const startTime = new Date(exam.startTime);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + exam.duration);
        return endTime < now;
      }).length;

      // Simulate online students for demo purposes
      const studentsOnline = Math.floor(Math.random() * 5);

      setStats({
        totalStudents: studentsRes.data.count || 0,
        totalExams: examsRes.data.count || 0,
        activeExams,
        completedExams,
        recentExams: sortedExams.slice(0, 6) || [],
        upcomingExam,
        studentsOnline,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Get exam status
  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + exam.duration);

    if (now < startTime) {
      return { status: 'Upcoming', color: 'upcoming', icon: <EventAvailableIcon fontSize="small" /> };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'active', icon: <EventNoteIcon fontSize="small" /> };
    } else {
      return { status: 'Completed', color: 'completed', icon: <EventBusyIcon fontSize="small" /> };
    }
  };

  // Format date with relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return date > now
        ? `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Current date in formal format
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Load skeleton
  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 4, mb: 4 }} />

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <Fade in timeout={800}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6, position: 'relative' }}>
          {/* Welcome Header */}
          <WelcomeHeader>
            <Grid container alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DashboardIcon sx={{ fontSize: 36, mr: 2, opacity: 0.9 }} />
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Admin Dashboard
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 400, opacity: 0.9 }}>
                  Welcome back, {user?.name || 'Admin'}!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.8, maxWidth: 600 }}>
                  Manage your exams, monitor student progress, and view analytics from your central admin dashboard.
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ mt: { xs: 3, md: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Current Date</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                      {currentDate}
                    </Typography>
                  </Box>

                  <Tooltip title="Refresh dashboard data">
                    <IconButton
                      onClick={refreshDashboard}
                      disabled={isRefreshing}
                      sx={{
                        ml: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.25)',
                        },
                        width: 48,
                        height: 48
                      }}
                    >
                      {isRefreshing ?
                        <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> :
                        <RefreshIcon />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            {/* Quick Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <QuickLinkButton
                component={RouterLink}
                to="/admin/exams/create"
                variant="contained"
                color="warning"
                startIcon={<Add />}
                disableElevation
              >
                Create New Exam
              </QuickLinkButton>

              <QuickLinkButton
                component={RouterLink}
                to="/admin/students/create"
                variant="contained"
                color="info"
                startIcon={<Person />}
                disableElevation
              >
                Add Student
              </QuickLinkButton>

              {/* <QuickLinkButton
                component={RouterLink}
                to="/admin/reports"
                variant="contained"
                color="secondary"
                startIcon={<BarChart />}
                disableElevation
              >
                View Reports
              </QuickLinkButton> */}
            </Box>
          </WelcomeHeader>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <GradientBox color="primary">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Total Students
                  </Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.totalStudents}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="body2" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 500,
                  }}>
                    <Badge color="success" variant="dot" sx={{ mr: 1 }} />
                    {stats.studentsOnline} online now
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/admin/students"
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                      }
                    }}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    View
                  </Button>
                </Box>
              </GradientBox>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GradientBox color="secondary">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Total Exams
                  </Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <LibraryBooksIcon />
                  </Avatar>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.totalExams}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {stats.activeExams} active now
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/admin/exams"
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                      }
                    }}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    View
                  </Button>
                </Box>
              </GradientBox>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GradientBox color="success">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Active Exams
                  </Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <EventNoteIcon />
                  </Avatar>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.activeExams}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      In progress
                    </Typography>
                  </Box>

                  <Button
                    component={RouterLink}
                    to="/admin/exams/active"
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                      }
                    }}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Monitor
                  </Button>
                </Box>
              </GradientBox>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <GradientBox color="info">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Completed Exams
                  </Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <BarChart />
                  </Avatar>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.completedExams}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    View analytics
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/admin/reports"
                    size="small"
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                      }
                    }}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Reports
                  </Button>
                </Box>
              </GradientBox>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Recent Exams */}
            <Grid item xs={12} md={8}>
              <StyledPaper elevation={0} sx={{ p: 0 }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                    <LibraryBooksIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    Recent Exams
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/admin/exams"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                  >
                    View All
                  </Button>
                </Box>

                <List sx={{ p: 0 }}>
                  {stats.recentExams.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Assignment sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No exams created yet
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/admin/exams/create"
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        sx={{ mt: 1 }}
                      >
                        Create First Exam
                      </Button>
                    </Box>
                  ) : (
                    stats.recentExams.map((exam) => {
                      const examStatusInfo = getExamStatus(exam);
                      return (
                        <React.Fragment key={exam._id}>
                          <ListItem
                            sx={{
                              py: 2.5,
                              px: 3,
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                }}
                              >
                                <Assignment />
                              </Avatar>
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight={600} sx={{ mr: 1 }}>
                                    {exam.title}
                                  </Typography>
                                  <StyledChip
                                    label={examStatusInfo.status}
                                    statuscolor={examStatusInfo.color}
                                    size="small"
                                    icon={examStatusInfo.icon}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                    <CalendarIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" color="textSecondary">
                                      {formatDate(exam.startTime)}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Duration: {exam.duration} mins
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Results">
                                <IconButton
                                  component={RouterLink}
                                  to={`/admin/exams/${exam._id}/results`}
                                  color="primary"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <BarChart fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="View Exam Details">
                                <IconButton
                                  component={RouterLink}
                                  to={`/admin/exams/${exam._id}`}
                                  color="info"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.info.main, 0.2),
                                    }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit Exam">
                                <IconButton
                                  component={RouterLink}
                                  to={`/admin/exams/${exam._id}/edit`}
                                  color="secondary"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      );
                    })
                  )}
                </List>
              </StyledPaper>
            </Grid>

            {/* Upcoming Exam & Quick Links */}
            <Grid item xs={12} md={4}>
              {/* Upcoming Exam Card */}
              <StyledPaper elevation={0} sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{
                  p: 3,
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventAvailableIcon sx={{ mr: 1.5, color: theme.palette.info.main }} />
                    Next Scheduled Exam
                  </Typography>
                </Box>

                {stats.upcomingExam ? (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {stats.upcomingExam.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Starting {formatDate(stats.upcomingExam.startTime)}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      mb: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>Duration:</Typography>
                        <Typography variant="body2">{stats.upcomingExam.duration} minutes</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={500}>Questions:</Typography>
                        <Typography variant="body2">{stats.upcomingExam.questions?.length || 0}</Typography>
                      </Box>
                    </Box>

                    <Button
                      component={RouterLink}
                      to={`/admin/exams/${stats.upcomingExam._id}`}
                      variant="outlined"
                      color="info"
                      fullWidth
                      sx={{ mt: 1 }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      View Exam Details
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      No upcoming exams scheduled
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/admin/exams/create"
                      variant="contained"
                      color="info"
                      startIcon={<Add />}
                      sx={{ mt: 2 }}
                    >
                      Schedule an Exam
                    </Button>
                  </Box>
                )}
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
      </Fade>
    </AdminLayout>
  );
};

export default AdminDashboard;