import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  Fade,
  Zoom,
  Chip,
  useTheme,
  alpha,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save,
  ArrowBack,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  ContentPaste as ContentPasteIcon,
  Help as HelpIcon,
  AccountCircle,
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

// Styled components for enhanced UI
const HeaderBox = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  padding: theme.spacing(3, 4),
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/patterns/circuit-board.svg")',
    backgroundSize: 'cover',
    opacity: 0.05,
    pointerEvents: 'none',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    borderTopLeftRadius: theme.shape.borderRadius * 1.5,
    borderBottomLeftRadius: theme.shape.borderRadius * 1.5,
  }
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    fontWeight: 600,
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: alpha(theme.palette.info.main, 0.05),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  boxShadow: 'none',
  height: '100%',
}));

const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  position: 'relative',
}));

const FormAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 80,
  height: 80,
  margin: '0 auto 24px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  border: `4px solid ${theme.palette.background.paper}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s',
  fontWeight: 600,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transform: 'translateY(0)',
  },
}));

const CreateStudent = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [generatedId, setGeneratedId] = useState('');
  const [showSuccessBackdrop, setShowSuccessBackdrop] = useState(false);
  
  const navigate = useNavigate();

  // Generate a student ID automatically when component mounts
  useEffect(() => {
    generateStudentId();
  }, []);
  
  const generateStudentId = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(2); // Last two digits of year
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 random digits
    const newId = `ST${year}${randomDigits}`;
    setGeneratedId(newId);
    setFormData(prevState => ({
      ...prevState,
      studentId: newId
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear the specific field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Reset the general error message
    if (error) setError('');
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please provide a valid email address';
      }
    }
    
    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must include at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      errors.password = 'Password must include at least one number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/v1/admin/students', formData);
      setSuccess('Student created successfully!');
      setShowSuccessBackdrop(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        studentId: '',
        password: '',
      });
      
      // Generate new student ID for next entry
      generateStudentId();
      
      // Redirect after a delay
      setTimeout(() => {
        setShowSuccessBackdrop(false);
        navigate('/admin/students');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.response?.data?.msg === 'Duplicate student ID') {
        setFormErrors({
          ...formErrors,
          studentId: 'This Student ID already exists'
        });
        setError('Student ID already in use. Please use a different ID or generate a new one.');
      } else if (error.response?.data?.msg === 'Duplicate email') {
        setFormErrors({
          ...formErrors,
          email: 'This email is already registered'
        });
        setError('Email address already in use. Please use a different email.');
      } else {
        setError(error.response?.data?.msg || 'Failed to create student. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(formData.studentId);
  };
  
  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return theme.palette.error.main;
    if (passwordStrength <= 3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Moderate';
    return 'Strong';
  };
  
  const passwordStrengthBars = () => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 1 }}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Box
            key={index}
            sx={{
              height: 4,
              width: 30,
              bgcolor: index < passwordStrength ? getPasswordStrengthColor() : alpha(theme.palette.text.disabled, 0.2),
              borderRadius: 2,
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 1, color: getPasswordStrengthColor(), fontWeight: 600 }}>
          {getPasswordStrengthLabel()}
        </Typography>
      </Box>
    );
  };

  return (
    <AdminLayout title="Create Student">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Header section */}
        <Fade in={true} timeout={800}>
          <HeaderBox>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonAdd sx={{ mr: 1.5 }} /> Create New Student
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: '600px' }}>
                    Add a new student to the system. The student will be able to log in using their student ID and password.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </HeaderBox>
        </Fade>
      
        <Grid container spacing={3}>
          {/* Left content - Form */}
          <Grid item xs={12} md={8}>
            <StyledPaper elevation={2}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/admin/students')}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Back to Students
                </Button>
                
                <Chip
                  icon={<PersonAdd fontSize="small" />}
                  label="New Student"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setSuccess('')}
                >
                  {success}
                </Alert>
              )}
              
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <FormAvatar>
                  <PersonIcon fontSize="large" />
                </FormAvatar>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <FormSection>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledInput
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        placeholder="Enter student's full name"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledInput
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        placeholder="Enter student's email address"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </FormSection>
                
                <Divider sx={{ my: 3 }} />
                
                <FormSection>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    Login Credentials
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledInput
                        fullWidth
                        label="Student ID"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        error={!!formErrors.studentId}
                        helperText={formErrors.studentId || "This ID will be used for student login"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Generate new ID">
                                <IconButton onClick={generateStudentId} edge="end" size="small">
                                  <ContentPasteIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy ID">
                                <IconButton onClick={handleCopyId} edge="end" size="small">
                                  <ContentPasteIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledInput
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        error={!!formErrors.password}
                        helperText={formErrors.password || "Password must be at least 6 characters"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handlePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {formData.password && !formErrors.password && passwordStrengthBars()}
                    </Grid>
                  </Grid>
                </FormSection>
                
                <Box sx={{ mt: 4, textAlign: 'right' }}>
                  <Button
                    variant="outlined"
                    sx={{ mr: 2, borderRadius: 2 }}
                    onClick={() => navigate('/admin/students')}
                  >
                    Cancel
                  </Button>
                  
                  <GradientButton
                    type="submit"
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                    disabled={isSubmitting}
                    size="large"
                    sx={{ borderRadius: 2, py: 1.5, px: 3 }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Student'}
                  </GradientButton>
                </Box>
              </Box>
            </StyledPaper>
          </Grid>
          
          {/* Right content - Information card */}
          <Grid item xs={12} md={4}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                  Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Creating a Student Account
                </Typography>
                <Typography variant="body2" paragraph>
                  Fill in all the required details to create a new student account. Students will use their Student ID and password to log in to the system.
                </Typography>
                
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Password Requirements
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2">At least 6 characters</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2">At least one uppercase letter</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2">At least one number</Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Student ID
                </Typography>
                <Typography variant="body2" paragraph>
                  A unique Student ID is automatically generated, but you can modify it if needed. This ID must be unique across all students.
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  After Creation
                </Typography>
                <Typography variant="body2">
                  Once created, students can immediately use their credentials to log in. You can view and manage all students from the Student Management page.
                </Typography>
              </CardContent>
            </InfoCard>
            
            {/* Preview card */}
            <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Student Account Preview
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.name || 'Student Name'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formData.email || 'student@example.com'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), p: 1.5, borderRadius: 1 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Student ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formData.studentId || 'ST000000'}
                  </Typography>
                </Box>
                <Chip
                  label="Active"
                  size="small"
                  color="success"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Success backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            gap: 2,
          }}
          open={showSuccessBackdrop}
        >
          <Zoom in={showSuccessBackdrop}>
            <Avatar sx={{ bgcolor: 'success.main', width: 100, height: 100 }}>
              <CheckIcon sx={{ fontSize: 60 }} />
            </Avatar>
          </Zoom>
          <Typography variant="h5" fontWeight={600}>
            Student Created Successfully!
          </Typography>
          <Typography variant="body1">
            Redirecting to student list...
          </Typography>
        </Backdrop>
        
        {/* Current Time & User Footer */}
        {/* <Box sx={{ 
          position: 'fixed', 
          bottom: 15, 
          right: 25, 
          textAlign: 'right',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.7
        }}>
          <Typography variant="caption" color="textSecondary">
            Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): <strong>2025-04-21 15:25:39</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Current User's Login: <strong>VanshSharmaSDEimport</strong>
          </Typography>
        </Box> */}
      </Container>
    </AdminLayout>
  );
};

export default CreateStudent;