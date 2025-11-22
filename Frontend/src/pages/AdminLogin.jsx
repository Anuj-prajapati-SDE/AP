import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LockOutlined, 
  Visibility, 
  VisibilityOff, 
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  DashboardCustomize as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Styled components for enhanced UI
const LoginContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.paper} 100%)`,
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
    backgroundImage: 'url("/patterns/graph-paper.svg")',
    backgroundSize: 'cover',
    opacity: 0.02,
    zIndex: 0,
  }
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1,
  border: `1px solid ${theme.palette.divider}`,
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
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
  backgroundColor: theme.palette.primary.main,
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

const GlowBar = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  backgroundSize: '200% 100%',
  animation: 'glow 4s infinite linear',
  '@keyframes glow': {
    '0%': { backgroundPosition: '0% 50%' },
    '100%': { backgroundPosition: '200% 50%' }
  },
}));

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { loginAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('sm'));
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await loginAdmin(email, password);
      if (success) {
        // Show success animation briefly
        setLoginSuccess(true);
        
        // Delay navigation slightly to show the success state
        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
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
                      fontWeight: 800, 
                      color: 'primary.dark',
                      mb: 3,
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Admin Dashboard
                  </Typography>
                  
                  <Typography variant="h6" color="textSecondary" gutterBottom sx={{ mb: 4, fontWeight: 400 }}>
                    Access your administrative controls to manage exams, students, and view comprehensive analytics.
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
                              <DashboardIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              Manage Exams
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Create, schedule, and monitor assessments with advanced proctoring tools.
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
                                bgcolor: 'primary.dark', 
                                width: 40, 
                                height: 40,
                                mr: 2
                              }}
                            >
                              <SettingsIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              System Controls
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Adjust system settings, manage user access, and view detailed reports.
                          </Typography>
                        </CardContent>
                      </InfoCard>
                    </Grid>
                  </Grid>
                  
                  <Alert 
                    severity="info" 
                    variant="filled"
                    icon={<SecurityIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography fontWeight={600}>Admin Access Only</Typography>
                    <Typography variant="body2">
                      This portal is restricted to authorized administrators. Unauthorized access attempts are monitored and logged.
                    </Typography>
                  </Alert>
                </Box>
              </Slide>
            </Grid>
          )}
          
          {/* Login form card */}
          <Grid item xs={12} sm={10} md={6} lg={5}>
            <Fade in timeout={800}>
              <LoginCard elevation={isMediumScreen ? 24 : 3} sx={{ p: { xs: 3, sm: 4 } }}>
                <GlowBar />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    mt: 1,
                  }}
                >
                  {/* Logo and Title */}
                  <LogoContainer>
                    {/* <Logo src="/logo.png" alt="Skillvedaa Logo" /> */}
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        background: 'linear-gradient(45deg, #1976d2, #304ffe)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      Skillvedaa
                    </Typography>
                  </LogoContainer>
                  
                  <StyledAvatar>
                    <AdminIcon fontSize="large" />
                  </StyledAvatar>
                  
                  <Typography component="h1" variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 1, 
                    letterSpacing: '-0.5px'
                  }}>
                    Admin Portal
                  </Typography>
                  
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ mb: 3 }}>
                    Enter your credentials to access the admin dashboard
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
                        Login successful! Redirecting to admin dashboard...
                      </Alert>
                    </Fade>
                  )}
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <StyledTextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
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
                    
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Tooltip title={isSubmitting ? "Please wait..." : "Sign in to admin dashboard"}>
                        <span style={{ width: '100%' }}>
                          <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
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
                              'Admin Login'
                            )}
                          </StyledButton>
                        </span>
                      </Tooltip>
                    </Box>
                    
                    <Divider sx={{ my: 2 }}>
                      <Chip 
                        label="Access Options" 
                        variant="outlined" 
                        size="small"
                      />
                    </Divider>
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button 
                        component={Link} 
                        to="/login/student" 
                        variant="text" 
                        color="primary"
                        startIcon={<VerifiedUserIcon />}
                        sx={{ fontWeight: 500, textTransform: 'none' }}
                      >
                        Student Login Portal
                      </Button>
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

export default AdminLogin;