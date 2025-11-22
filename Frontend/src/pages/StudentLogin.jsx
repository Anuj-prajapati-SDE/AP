import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  AssignmentOutlined as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  ContactSupport as ContactSupportIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Styled components for enhanced UI
const LoginContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/patterns/topography.svg")',
    backgroundSize: 'cover',
    opacity: 0.025,
    zIndex: 0,
  }
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1,
  border: `1px solid ${theme.palette.divider}`,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.secondary.contrastText,
  transition: 'all 0.3s ease',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

const Logo = styled('img')({
  height: 50,
  marginRight: 10,
});

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
    borderColor: theme.palette.primary.main,
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  width: 56,
  height: 56,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderWidth: '2px',
    },
  },
}));

const StyledFooter = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  textAlign: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: 0,
}));

const StudentLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [examId, setExamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { loginStudent, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlExamId = searchParams.get('examId');

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('sm'));

  // Initialize exam ID from URL if available
  useEffect(() => {
    if (urlExamId) {
      setExamId(urlExamId);
    }
  }, [urlExamId]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'student') {
      console.log('Student already logged in, redirecting...');
      if (urlExamId || examId) {
        navigate(`/student/exam/${urlExamId || examId}/instructions`);
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate, urlExamId, examId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentId || !password) {
      setError('Please provide both student ID and password');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Attempting student login with ID:', studentId);

      // Login API call
      const response = await axios.post('/api/v1/auth/login/student', {
        studentId,
        password,
      });

      console.log('Login API response:', response.data);

      // Show success animation briefly
      setLoginSuccess(true);

      // Store data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);

      // Set authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Delay navigation slightly to show the success state
      setTimeout(() => {
        // Direct to exam page if exam ID is provided
        if (examId) {
          window.location.href = `/student/exam/${examId}/instructions`;
        } else {
          window.location.href = '/student/dashboard';
        }
      }, 800);

    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Current Date and Time for footer
  const [currentDateTime, setCurrentDateTime] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date().toISOString().slice(0, 19).replace('T', ' '));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <LoginContainer>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Left side info panel (visible on medium+ screens) */}
          {isLargeScreen && (
            <Grid item xs={12} md={6} lg={5}>
              <Slide direction="right" in timeout={800}>
                <Box sx={{ pr: 4 }}>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 3,
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Welcome Back!
                  </Typography>

                  <Typography variant="h6" color="textSecondary" gutterBottom sx={{ mb: 4, fontWeight: 400 }}>
                    Sign in to access your assessments, track progress, and view your performance analytics.
                  </Typography>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                                mr: 2
                              }}
                            >
                              <AssignmentIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              Take Exams
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Access your scheduled assessments securely with real-time monitoring.
                          </Typography>
                        </CardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'secondary.main',
                                width: 40,
                                height: 40,
                                mr: 2
                              }}
                            >
                              <CheckCircleIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              Track Progress
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            View your scores, improvement areas, and performance analytics.
                          </Typography>
                        </CardContent>
                      </InfoCard>
                    </Grid>
                  </Grid>
                </Box>
              </Slide>
            </Grid>
          )}

          {/* Login form card */}
          <Grid item xs={12} sm={10} md={6} lg={5}>
            <Fade in timeout={800}>
              <LoginCard elevation={isMediumScreen ? 24 : 3} sx={{ p: { xs: 3, sm: 4 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Logo and Title */}
                  <LogoContainer>
                    {/* <Logo src="/logo.png" alt="Skillvedaa Logo" /> */}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #1976d2, #5e35b1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      Skillvedaa
                    </Typography>
                  </LogoContainer>

                  <StyledAvatar>
                    <SchoolIcon fontSize="large" />
                  </StyledAvatar>

                  <Typography component="h1" variant="h5" sx={{
                    fontWeight: 700,
                    mb: 1,
                    letterSpacing: '-0.5px'
                  }}>
                    Student Login
                  </Typography>

                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ mb: 3 }}>
                    Enter your credentials to access your account
                  </Typography>

                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        width: '100%',
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                      }}
                      variant="filled"
                    >
                      {error}
                    </Alert>
                  )}

                  {loginSuccess && (
                    <Fade in>
                      <Alert
                        severity="success"
                        sx={{
                          width: '100%',
                          mb: 3,
                          borderRadius: 2,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                        }}
                        variant="filled"
                      >
                        Login successful! Redirecting...
                      </Alert>
                    </Fade>
                  )}

                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <StyledTextField
                      margin="normal"
                      required
                      fullWidth
                      id="studentId"
                      label="Student ID"
                      name="studentId"
                      autoComplete="username"
                      autoFocus
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FingerprintIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <StyledTextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Divider sx={{ my: 3 }}>
                      {/* <Chip
                        label="Exam Access"
                        variant="outlined"
                        size="small"
                        color="primary"
                      /> */}
                    </Divider>

                    <StyledTextField
                      margin="normal"
                      fullWidth
                      id="examId"
                      label="Exam ID (Optional)"
                      name="examId"
                      value={examId}
                      onChange={(e) => setExamId(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      helperText="Enter the Exam ID from your email for direct access"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssignmentIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Tooltip title={isSubmitting ? "Please wait..." : "Sign in to your account"}>
                        <span style={{ width: '100%' }}>
                          <GradientButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            disabled={isSubmitting || loginSuccess}
                            size="large"
                            sx={{
                              py: 1.5,
                              fontSize: '1rem',
                              borderRadius: 2
                            }}
                            endIcon={
                              !isSubmitting && !loginSuccess && <ArrowForwardIcon />
                            }
                          >
                            {isSubmitting ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : loginSuccess ? (
                              <>
                                <CheckCircleIcon sx={{ mr: 1 }} />
                                Success!
                              </>
                            ) : (
                              'Sign In'
                            )}
                          </GradientButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </LoginCard>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </LoginContainer>
  );
};

export default StudentLogin;