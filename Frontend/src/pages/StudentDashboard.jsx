import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  InputAdornment,
  Badge,
  Snackbar,
  Grow,
  LinearProgress,
  Fade,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExitToApp as LogoutIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  AccountCircle,
  KeyboardArrowRight,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Cancel,
  Schedule,
  Assignment,
  AssignmentTurnedIn,
  AssignmentLate,
  Menu as MenuIcon,
  Close as CloseIcon,
  ErrorOutline,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  AccessTimeFilledOutlined as AccessTimeFilledOutlinedIcon,
  ContentCopy as ContentCopyIcon,
  PersonOutline as PersonOutlineIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Styled components for enhanced UI
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  boxShadow: 'none',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 3),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.15)',
  transition: 'all 0.3s',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(25, 118, 210, 0.25)',
    transform: 'translateY(-2px)',
  },
}));

const DashboardCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const DirectAccessBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(245,247,250,1) 100%)',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
  borderLeft: `5px solid ${theme.palette.primary.main}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/patterns/circuit-board.svg")',
    backgroundSize: 'cover',
    opacity: 0.03,
    zIndex: 0,
  },
}));

const StyledTabList = styled(Tabs)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  '.MuiTabs-flexContainer': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '.MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    minHeight: 56,
    '&.Mui-selected': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
}));

// Exam Status Badge component
const StatusBadge = ({ status, timeRemaining }) => {
  let color, icon, variant;

  switch (status) {
    case 'Upcoming':
      color = 'info';
      icon = <Schedule fontSize="small" />;
      variant = 'outlined';
      break;
    case 'Available':
      color = 'success';
      icon = <CheckCircle fontSize="small" />;
      variant = 'filled';
      break;
    case 'In Progress':
      color = 'warning';
      icon = <AccessTimeFilledOutlinedIcon fontSize="small" />;
      variant = 'filled';
      break;
    case 'Expired':
      color = 'error';
      icon = <Cancel fontSize="small" />;
      variant = 'outlined';
      break;
    case 'Completed':
      color = 'secondary';
      icon = <AssignmentTurnedIn fontSize="small" />;
      variant = 'filled';
      break;
    default:
      color = 'default';
      icon = <Assignment fontSize="small" />;
      variant = 'outlined';
  }

  const label = timeRemaining && status === 'Upcoming'
    ? `${status} (in ${timeRemaining})`
    : timeRemaining && (status === 'Available' || status === 'In Progress')
      ? `${timeRemaining} left`
      : status;

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      variant={variant}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 'auto',
        py: 0.5,
        '& .MuiChip-label': {
          px: 1.2,
        },
        '& .MuiChip-icon': {
          fontSize: '1rem',
          ml: 0.7,
        },
      }}
    />
  );
};

// Exam Card Component
const ExamCard = ({ exam, onClick, disabledMessage }) => {
  const theme = useTheme();
  const [elevation, setElevation] = useState(1);

  const formatDate = (dateString) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const isDisabled = !!disabledMessage;

  let timeDisplay = '';
  let timeIcon = <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />;

  if (exam.status === 'Upcoming' && exam.timeUntilStart) {
    timeDisplay = `Starts in ${exam.timeUntilStart.formatted}`;
  } else if (exam.status === 'Available' && exam.timeRemaining) {
    timeDisplay = `Available for ${exam.timeRemaining.formatted}`;
  } else if (exam.status === 'Completed') {
    timeIcon = <AssignmentTurnedIn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />;
    timeDisplay = exam.submittedAt
      ? `Completed on ${formatDate(exam.submittedAt)}`
      : 'Completed';
  } else if (exam.status === 'Expired') {
    timeDisplay = 'No longer available';
  }

  // Calculate progress if completed
  let progressValue = 0;
  let progressColor = 'error';

  if (exam.status === 'Completed' && exam.score !== undefined) {
    progressValue = Math.round((exam.score / exam.totalQuestions) * 100);
    if (progressValue >= 80) progressColor = 'success';
    else if (progressValue >= 60) progressColor = 'primary';
    else if (progressValue >= 40) progressColor = 'warning';
  }

  return (
    <Card
      variant="outlined"
      elevation={elevation}
      onMouseOver={() => setElevation(3)}
      onMouseOut={() => setElevation(1)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: elevation > 1 ? `0px ${elevation}px ${elevation * 3}px rgba(0,0,0,0.1)` : '0px 1px 3px rgba(0,0,0,0.05)',
        ...(isDisabled
          ? { opacity: 0.7, bgcolor: 'action.disabledBackground' }
          : {
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: theme.palette.primary.main,
            }
          }),
        ...(exam.status === 'Available' && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '100%',
            backgroundColor: theme.palette.success.main,
          },
        }),
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            mb: 1,
            color: exam.status === 'Available' ? theme.palette.primary.main : undefined,
          }}>
            {exam.title}
          </Typography>
          <StatusBadge
            status={exam.status}
            timeRemaining={
              exam.status === 'Upcoming'
                ? exam.timeUntilStart?.formatted
                : exam.status === 'Available'
                  ? exam.timeRemaining?.formatted
                  : null
            }
          />
        </Box>

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            mb: 2.5,
            minHeight: '60px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            lineHeight: 1.6,
            color: 'text.secondary',
          }}
        >
          {exam.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <EventIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            {formatDate(exam.startTime)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {timeIcon}
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            {timeDisplay}
          </Typography>
        </Box>

        {exam.status === 'Completed' && exam.score !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                Score:
              </Typography>
              <Typography
                variant="body2"
                color={progressColor + '.main'}
                fontWeight={700}
              >
                {progressValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              color={progressColor}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
              }}
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
        <Button
          variant={exam.status === 'Available' ? "contained" : "outlined"}
          color={
            exam.status === 'Completed' ? "secondary" :
              exam.status === 'Upcoming' ? "info" : "primary"
          }
          fullWidth
          onClick={() => !isDisabled && onClick(exam._id, exam.status)}
          disabled={isDisabled}
          endIcon={<KeyboardArrowRight />}
          sx={{
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            boxShadow: exam.status === 'Available' ? 3 : 0,
            '&:hover': {
              boxShadow: exam.status === 'Available' ? 5 : 0,
            }
          }}
          title={disabledMessage || ''}
        >
          {exam.status === 'Available'
            ? 'Take Exam'
            : exam.status === 'Completed'
              ? 'View Result'
              : exam.status === 'Upcoming'
                ? 'View Details'
                : 'View'
          }
        </Button>
      </CardActions>

      {isDisabled && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Alert
            severity="info"
            icon={<InfoIcon fontSize="inherit" />}
            sx={{
              py: 0.75,
              borderRadius: 2,
              fontSize: '0.8rem',
            }}
          >
            {disabledMessage}
          </Alert>
        </Box>
      )}
    </Card>
  );
};

// Empty state component
const EmptyState = ({ icon, title, description }) => {
  return (
    <Fade in timeout={800}>
      <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box sx={{
          p: 2.5,
          borderRadius: '50%',
          bgcolor: 'rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}>
          {React.cloneElement(icon, {
            style: {
              fontSize: 64,
              color: 'text.secondary',
              opacity: 0.3
            }
          })}
        </Box>
        <Typography variant="h6" gutterBottom color="textSecondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          {description}
        </Typography>
      </Box>
    </Fade>
  );
};

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [examCategories, setExamCategories] = useState({
    upcoming: [],
    available: [],
    ended: [],
    completed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [directExamId, setDirectExamId] = useState('');
  const [accessingExam, setAccessingExam] = useState(false);
  const [tabValue, setTabValue] = useState(1); // Default to Available tab
  const [refreshing, setRefreshing] = useState(false);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Copy exam ID to clipboard
  const copyExamId = () => {
    navigator.clipboard.writeText(directExamId)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const fetchExams = async () => {
    try {
      setRefreshing(true);
      // Simulate progress loading
      const progressInterval = setInterval(() => {
        setLoadingPercentage(prev => {
          const newValue = prev + Math.random() * 15;
          return newValue >= 100 ? 100 : newValue;
        });
      }, 200);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        clearInterval(progressInterval);
        return;
      }

      const response = await axios.get('/api/v1/student/exams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      clearInterval(progressInterval);
      setLoadingPercentage(100);

      // Set the exams in state after a small delay to ensure smooth transition
      setTimeout(() => {
        if (response.data && response.data.exams) {
          setExamCategories(response.data.exams);

          // Automatically switch to the Available tab if there are available exams
          if (response.data.exams.available && response.data.exams.available.length > 0 && tabValue !== 1) {
            setTabValue(1);
            showSnackbar('You have exams available now!', 'success');
          }

          // Clear any previous errors
          if (error) setError('');
        } else {
          throw new Error('Invalid response format');
        }

        setIsLoading(false);
        setRefreshing(false);
      }, 300);

    } catch (error) {
      console.error('Error fetching exams:', error.response?.data || error);
      setError('Failed to load exams: ' + (error.response?.data?.msg || error.message || 'Unknown error'));
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExams();

    // Set up automatic refresh every 3 minutes
    const refreshInterval = setInterval(() => {
      fetchExams();
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = () => {
    setLoadingPercentage(0);
    fetchExams();
  };

  const handleLogout = () => {
    handleMenuClose();
    handleProfileMenuClose();
    logout();
    navigate('/login/student');
  };

  const handleExamClick = (examId, status) => {
    if (!examId) {
      showSnackbar('Invalid exam ID', 'error');
      return;
    }

    if (status === 'Completed') {
      navigate(`/student/exam/${examId}/complete`);
    } else {
      navigate(`/student/exam/${examId}/instructions`);
    }
  };

  const handleDirectAccess = () => {
    if (directExamId.trim()) {
      setAccessingExam(true);
      navigate(`/student/exam/${directExamId.trim()}/instructions`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getCategoryLabel = (category, count) => {
    switch (category) {
      case 0: return `Upcoming ${count ? `(${count})` : ''}`;
      case 1: return `Available ${count ? `(${count})` : ''}`;
      case 2: return `Completed ${count ? `(${count})` : ''}`;
      case 3: return `Expired ${count ? `(${count})` : ''}`;
      default: return category;
    }
  };

  // Get current date/time for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create skeletons for loading state
  const examCardSkeletons = Array(6).fill(0).map((_, index) => (
    <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={24} />
          </Box>
        </CardContent>
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
        </CardActions>
      </Card>
    </Grid>
  ));

  const helpDialogContent = (
    <Dialog
      open={openHelpDialog}
      onClose={() => setOpenHelpDialog(false)}
      aria-labelledby="help-dialog-title"
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 3 }
      }}
      maxWidth="md"
    >
      <DialogTitle id="help-dialog-title" sx={{
        pb: 1,
        background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.1))'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <HelpIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={600}>Help & Information</Typography>
          </Box>
          <IconButton
            edge="end"
            onClick={() => setOpenHelpDialog(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Exam Status Guide
            </Typography>

            <Box sx={{
              backgroundColor: 'background.default',
              borderRadius: 3,
              p: 2.5,
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={<Schedule fontSize="small" />}
                  label="Upcoming"
                  color="info"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1.5 }}
                />
                <Typography variant="body2">
                  Exams scheduled for future. You cannot take them yet.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={<CheckCircle fontSize="small" />}
                  label="Available"
                  color="success"
                  variant="filled"
                  size="small"
                  sx={{ mr: 1.5 }}
                />
                <Typography variant="body2">
                  <strong>Exams you can take now.</strong> Click "Take Exam" to begin.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={<AssignmentTurnedIn fontSize="small" />}
                  label="Completed"
                  color="secondary"
                  variant="filled"
                  size="small"
                  sx={{ mr: 1.5 }}
                />
                <Typography variant="body2">
                  Exams you've already completed. View your results.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  icon={<Cancel fontSize="small" />}
                  label="Expired"
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1.5 }}
                />
                <Typography variant="body2">
                  Exams that are no longer available for taking.
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom fontWeight={600}>
              Direct Exam Access
            </Typography>
            <Typography variant="body2" paragraph>
              If you received an <strong>Exam ID</strong> by email or from your instructor, enter it in the "Direct Exam Access" box to quickly access your exam.
            </Typography>

            <Box sx={{ bgcolor: 'info.light', color: 'info.dark', p: 2, borderRadius: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <InfoIcon sx={{ mr: 1, mt: 0.3 }} fontSize="small" />
                <Typography variant="body2">
                  <strong>Pro Tip:</strong> Bookmark important exams to find them quickly in case you get disconnected.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Need Help?
            </Typography>
            <Typography variant="body2" paragraph>
              If you're having technical issues or cannot find your exam, please contact your system administrator.
            </Typography>

            <Box sx={{
              bgcolor: 'background.default',
              borderRadius: 3,
              overflow: 'hidden',
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Contact Support</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" paragraph>
                  <strong>Email:</strong> <Link href="mailto:support@skillvedaa.com">Hr@smartbrains.org.in</Link>
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Help Desk:</strong> +91 9891915598
                </Typography>
                <Typography variant="body2">
                  <strong>Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM IST
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom fontWeight={600}>
              Exam Tips
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Ensure you have a stable internet connection before starting an exam.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Your answers are saved automatically, but always click "Submit" when finished.
              </Typography>
              <Typography component="li" variant="body2">
                Don't refresh or navigate away during an exam unless instructed to do so.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => setOpenHelpDialog(false)}
          variant="outlined"
          size="large"
          color="primary"
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Loading state with percentage indicator
  if (isLoading && !refreshing) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(45deg, rgba(250, 252, 254, 1) 0%, rgba(245, 247, 250, 1) 100%)',
      }}>
        <Box sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          mb: 3,
        }}>
          <CircularProgress
            variant="determinate"
            value={loadingPercentage}
            size={120}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              position: 'absolute',
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolIcon sx={{ fontSize: 50, color: theme.palette.primary.main, opacity: 0.7 }} />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Loading your exams...
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Preparing your dashboard
        </Typography>
        <Box sx={{ width: '80%', maxWidth: 400 }}>
          <LinearProgress
            variant="determinate"
            value={loadingPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {Math.round(loadingPercentage)}% complete
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}>
        <StyledAppBar elevation={0}>
          <StyledToolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile ? (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuClick}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                // <Avatar
                //   src="/Studentlogo.png"
                //   alt="Logo"
                //   variant="rounded"
                //   sx={{
                //     width: 36,
                //     height: 36,
                //     mr: 1.5,
                //     boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                //   }}
                // />
                <div></div>
              )}

              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {!isMobile && <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />}
                Student Dashboard
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {!isMobile && (
                <Tooltip title="Refresh Dashboard">
                  <IconButton
                    onClick={handleRefresh}
                    color="primary"
                    disabled={refreshing}
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.12)',
                      }
                    }}
                  >
                    {refreshing ?
                      <CircularProgress size={20} thickness={5} /> :
                      <RefreshIcon />
                    }
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Help Center">
                <IconButton
                  onClick={() => setOpenHelpDialog(true)}
                  color="primary"
                  sx={{
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                    }
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                edge="end"
                sx={{
                  ml: 0.5,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <PersonOutlineIcon />
              </IconButton>

              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 5,
                  sx: {
                    borderRadius: 2,
                    minWidth: 200,
                    mt: 1.5,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.name || 'Student'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {user?.studentId || 'N/A'}
                  </Typography>
                </Box>

                <Divider />

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon as="span" sx={{ mr: 1.5 }} />
                  Logout
                </MenuItem>
              </Menu>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { borderRadius: 2 }
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">Hello, {user?.name || 'Student'}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>Home</MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setOpenHelpDialog(true); }}>Help</MenuItem>
                <MenuItem onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </StyledToolbar>

          {/* Progress indicator during refresh */}
          {refreshing && (
            <LinearProgress sx={{ height: 3 }} />
          )}
        </StyledAppBar>

        <Container maxWidth="lg" sx={{ mt: 5, mb: 8, flexGrow: 1 }}>
          <DashboardCard sx={{ mb: 4 }}>
            <Box sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: 'background.default',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}>
                  Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {currentDate}
                </Typography>
              </Box>

              <Button
                onClick={handleRefresh}
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                disabled={refreshing}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mx: 3, mt: 3, borderRadius: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRefresh}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <DirectAccessBox>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main'
                    }}
                  >
                    <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                    Direct Exam Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Have an Exam ID? Enter it below for quick access to your assigned exam.
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8} md={9}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Example: 6450a8c12ab76f8d3e9c4d12"
                        value={directExamId}
                        onChange={(e) => setDirectExamId(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyboardArrowRight sx={{ color: 'primary.main' }} />
                            </InputAdornment>
                          ),
                          endAdornment: directExamId && (
                            <InputAdornment position="end">
                              <Tooltip title={copySuccess ? "Copied!" : "Copy Exam ID"}>
                                <IconButton
                                  edge="end"
                                  onClick={copyExamId}
                                  color={copySuccess ? "success" : "default"}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: 2,
                            backgroundColor: 'white',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <GradientButton
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleDirectAccess}
                        disabled={!directExamId.trim() || accessingExam}
                        sx={{
                          py: 1.25,
                          borderRadius: 2,
                          fontWeight: 600,
                        }}
                      >
                        {accessingExam ? <CircularProgress size={24} color="inherit" /> : 'Access Exam'}
                      </GradientButton>
                    </Grid>
                  </Grid>
                </Box>
              </DirectAccessBox>

              <Box sx={{ mt: 4 }}>
                <StyledTabList
                  value={tabValue}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : false}
                  TabIndicatorProps={{
                    style: {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    }
                  }}
                >
                  <Tab
                    label={getCategoryLabel(0, examCategories.upcoming?.length)}
                    icon={<Schedule fontSize="small" />}
                    iconPosition="start"
                  />
                  <Tab
                    label={getCategoryLabel(1, examCategories.available?.length)}
                    icon={<Assignment fontSize="small" />}
                    iconPosition="start"
                    sx={{
                      color: examCategories.available?.length ? 'success.main' : 'inherit',
                      '&.Mui-selected': {
                        color: examCategories.available?.length ? 'success.main' : undefined,
                      }
                    }}
                  />
                  <Tab
                    label={getCategoryLabel(2, examCategories.completed?.length)}
                    icon={<AssignmentTurnedIn fontSize="small" />}
                    iconPosition="start"
                  />
                  <Tab
                    label={getCategoryLabel(3, examCategories.ended?.length)}
                    icon={<AssignmentLate fontSize="small" />}
                    iconPosition="start"
                  />
                </StyledTabList>

                <Box sx={{ minHeight: 400 }}>
                  {/* Tab 0: Upcoming */}
                  {tabValue === 0 && (
                    <TabPanel>
                      {refreshing ? (
                        <Grid container spacing={3}>
                          {examCardSkeletons.slice(0, 3)}
                        </Grid>
                      ) : examCategories.upcoming?.length === 0 ? (
                        <EmptyState
                          icon={<Schedule />}
                          title="No upcoming exams"
                          description="You don't have any exams scheduled for the future at this time."
                        />
                      ) : (
                        <Grid container spacing={3}>
                          {examCategories.upcoming.map((exam) => (
                            <Grow in key={exam._id} timeout={500} style={{ transformOrigin: '0 0 0' }}>
                              <Grid item xs={12} sm={6} md={4}>
                                <ExamCard
                                  exam={exam}
                                  onClick={handleExamClick}
                                  disabledMessage={exam.status === 'Upcoming' ? "This exam is not available yet. Check back when it's time." : null}
                                />
                              </Grid>
                            </Grow>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  )}

                  {/* Tab 1: Available */}
                  {tabValue === 1 && (
                    <TabPanel>
                      {refreshing ? (
                        <Grid container spacing={3}>
                          {examCardSkeletons.slice(0, 3)}
                        </Grid>
                      ) : examCategories.available?.length === 0 ? (
                        <EmptyState
                          icon={<Assignment />}
                          title="No available exams"
                          description="There are no exams currently available for you to take."
                        />
                      ) : (
                        <Grid container spacing={3}>
                          {examCategories.available.map((exam, index) => (
                            <Grow
                              in
                              key={exam._id}
                              timeout={400 + (index * 100)}
                              style={{ transformOrigin: '0 0 0' }}
                            >
                              <Grid item xs={12} sm={6} md={4}>
                                <ExamCard exam={exam} onClick={handleExamClick} />
                              </Grid>
                            </Grow>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  )}

                  {/* Tab 2: Completed */}
                  {tabValue === 2 && (
                    <TabPanel>
                      {refreshing ? (
                        <Grid container spacing={3}>
                          {examCardSkeletons.slice(0, 3)}
                        </Grid>
                      ) : !examCategories.completed || examCategories.completed.length === 0 ? (
                        <EmptyState
                          icon={<AssignmentTurnedIn />}
                          title="No completed exams"
                          description="You haven't completed any exams yet."
                        />
                      ) : (
                        <Grid container spacing={3}>
                          {examCategories.completed.map((exam, index) => (
                            <Grow
                              in
                              key={exam._id}
                              timeout={400 + (index * 100)}
                              style={{ transformOrigin: '0 0 0' }}
                            >
                              <Grid item xs={12} sm={6} md={4}>
                                <ExamCard exam={exam} onClick={handleExamClick} />
                              </Grid>
                            </Grow>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  )}

                  {/* Tab 3: Expired */}
                  {tabValue === 3 && (
                    <TabPanel>
                      {refreshing ? (
                        <Grid container spacing={3}>
                          {examCardSkeletons.slice(0, 3)}
                        </Grid>
                      ) : !examCategories.ended || examCategories.ended.length === 0 ? (
                        <EmptyState
                          icon={<AssignmentLate />}
                          title="No expired exams"
                          description="You don't have any expired exams."
                        />
                      ) : (
                        <Grid container spacing={3}>
                          {examCategories.ended.map((exam, index) => (
                            <Grow
                              in
                              key={exam._id}
                              timeout={400 + (index * 100)}
                              style={{ transformOrigin: '0 0 0' }}
                            >
                              <Grid item xs={12} sm={6} md={4}>
                                <ExamCard
                                  exam={exam}
                                  onClick={handleExamClick}
                                  disabledMessage="This exam is no longer available for taking."
                                />
                              </Grid>
                            </Grow>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  )}
                </Box>
              </Box>
            </Box>
          </DashboardCard>
        </Container>

        <Box
          component="footer"
          sx={{
            py: 3,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' },
              gap: 1,
            }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Skillvedaa Assessment System. All rights reserved.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Designed & Developed By Vansh Vyas (SDE)
              </Typography>

              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: { xs: 0.5, sm: 3 },
              }}>
                <Typography variant="caption" color="text.secondary">
                  Current Date and Time (UTC): <strong> {new Date().toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}</strong>
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {helpDialogContent}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={Grow}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentDashboard;