import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Checkbox,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Badge,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Fullscreen as FullscreenIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  Warning as WarningIcon,
  HelpOutline as HelpOutlineIcon,
  EventNote as EventNoteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Calculate as CalculateIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  RemoveCircle as RemoveCircleIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionAnswerIcon,
  NotificationsNone as NotificationsNoneIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Styled components
const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
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
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const InfoCard = styled(Card)(({ theme, type = 'default' }) => {
  let backgroundColor = theme.palette.background.paper;
  let borderColor = theme.palette.divider;
  let iconColor = theme.palette.primary.main;
  
  switch (type) {
    case 'warning':
      backgroundColor = alpha(theme.palette.warning.main, 0.05);
      borderColor = alpha(theme.palette.warning.main, 0.3);
      iconColor = theme.palette.warning.main;
      break;
    case 'error':
      backgroundColor = alpha(theme.palette.error.main, 0.05);
      borderColor = alpha(theme.palette.error.main, 0.3);
      iconColor = theme.palette.error.main;
      break;
    case 'success':
      backgroundColor = alpha(theme.palette.success.main, 0.05);
      borderColor = alpha(theme.palette.success.main, 0.3);
      iconColor = theme.palette.success.main;
      break;
    case 'info':
      backgroundColor = alpha(theme.palette.info.main, 0.05);
      borderColor = alpha(theme.palette.info.main, 0.3);
      iconColor = theme.palette.info.main;
      break;
    default:
      break;
  }
  
  return {
    backgroundColor,
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'none',
    height: '100%',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
    },
    '& .MuiListItemIcon-root': {
      color: iconColor,
      minWidth: '40px',
    },
  };
});

const WaitingCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(5, 3),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.primary.light, 0.04),
  border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  borderRadius: theme.shape.borderRadius * 5,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5, 4),
  transition: 'all 0.3s',
  fontWeight: 600,
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: theme.palette.action.disabledBackground,
  },
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  backdropFilter: 'blur(10px)',
  color: theme.palette.common.white,
  marginTop: theme.spacing(2),
}));

const ExampleIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginRight: theme.spacing(1),
  fontSize: '1.25rem',
  fontWeight: 'bold',
}));

const StudentInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [startingExam, setStartingExam] = useState(false);
  const [waitingForExam, setWaitingForExam] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [exampleVisible, setExampleVisible] = useState(false);
  
  useEffect(() => {
    const fetchExam = async () => {
      try {
        console.log('Fetching exam details...');
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/v1/exam/${examId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Exam fetched successfully:', response.data);
        setExam(response.data.exam);
      } catch (error) {
        console.error('Error fetching exam:', error.response?.data || error);
        
        if (error.response?.status === 403 && error.response?.data?.startTime) {
          // Exam hasn't started yet
          console.log('Exam not started yet, showing waiting page');
          setWaitingForExam(true);
          setExamStartTime(new Date(error.response.data.startTime));
          setError('Exam has not started yet. Please wait until the scheduled time.');
        } else if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(error.response?.data?.msg || 'Failed to load exam details');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExam();
    
    // Set up timer for exam waiting
    if (waitingForExam && examStartTime) {
      const timer = setInterval(() => {
        const now = new Date();
        if (now >= examStartTime) {
          window.location.reload();
        } else {
          const remainingMs = examStartTime - now;
          const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
          setTimeRemaining(remainingMinutes);
          
          // Update every second for last minute countdown
          if (remainingMinutes <= 1) {
            const seconds = Math.floor(remainingMs / 1000);
            setTimeRemaining(`${seconds} seconds`);
          }
        }
      }, remainingMinutes <= 1 ? 1000 : 30000); // Check every 30 seconds, or every second for last minute
      
      return () => clearInterval(timer);
    }
  }, [examId, waitingForExam, examStartTime, timeRemaining]);
  
  const handleStartExam = async () => {
    if (!agreementChecked) return;
    
    setStartingExam(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/v1/exam/${examId}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      navigate(`/student/exam/${examId}`);
    } catch (error) {
      console.error('Error starting exam:', error.response?.data || error);
      setError(error.response?.data?.msg || 'Failed to start exam');
    } finally {
      setStartingExam(false);
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const steps = [
    'Exam Information',
    'Rules & Instructions',
    'Start Exam',
  ];
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading exam details...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Show waiting page if exam hasn't started yet
  if (waitingForExam && examStartTime) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <StyledPaper sx={{ textAlign: 'center', p: 5 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3, 
            bgcolor: theme.palette.warning.main,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <TimerIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Exam Will Start Soon
          </Typography>
          
          <Alert severity="info" sx={{ mb: 4 }}>
            {error}
          </Alert>
          
          <WaitingCard>
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Scheduled Start Time:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {examStartTime ? examStartTime.toLocaleString() : 'Unknown'}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 3,
              width: '100%'
            }}>
              <TimerIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary" fontWeight={600}>
                {timeRemaining ? `${timeRemaining} remaining` : 'Calculating time...'}
              </Typography>
            </Box>
          </WaitingCard>
          
          <Box sx={{ mt: 4, color: 'text.secondary' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This page will automatically refresh when the exam starts.
            </Typography>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 6 }}
            >
              Refresh Now
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    );
  }
  
  if (error && !waitingForExam) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <StyledPaper sx={{ textAlign: 'center', p: 5 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3, 
            bgcolor: theme.palette.error.main,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <ErrorIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Error
          </Typography>
          
          <Typography variant="h6" color="error" sx={{ mb: 4 }}>
            {error}
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1, borderRadius: 6 }}
          >
            Return to Dashboard
          </Button>
        </StyledPaper>
      </Container>
    );
  }
  
  if (!exam) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <StyledPaper sx={{ textAlign: 'center', p: 5 }}>
          <ErrorIcon fontSize="large" color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" color="error" sx={{ mb: 3 }}>
            Exam not found
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            The exam you are looking for is either unavailable or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1, borderRadius: 6 }}
          >
            Return to Dashboard
          </Button>
        </StyledPaper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <HeaderBox>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          {exam.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
          Welcome, {user?.name || 'Student'}
        </Typography>
        
        <TimeDisplay>
          <NotificationsNoneIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Duration: {exam.duration} minutes
          </Typography>
        </TimeDisplay>
      </HeaderBox>
      
      <StyledPaper>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ p: 1 }}>
          {activeStep === 0 && (
            <>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 4 }}>
                Exam Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventNoteIcon sx={{ mr: 1 }} color="primary" />
                        Basic Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <List disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Description</Typography>} 
                            secondary={exam.description} 
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <TimerIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Duration</Typography>} 
                            secondary={`${exam.duration} minutes`}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <QuestionAnswerIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Total Questions</Typography>} 
                            secondary={exam.questions.length}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <AssignmentTurnedInIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Total Marks</Typography>} 
                            secondary={exam.totalMarks}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </InfoCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <InfoCard type="warning">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: theme.palette.warning.main }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        Marking Scheme
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Negative Marking: 50% of question marks
                        </Typography>
                        <Typography variant="body2" paragraph>
                          For each incorrect answer, 50% of the question's marks will be deducted from your score.
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => setExampleVisible(!exampleVisible)}
                        endIcon={exampleVisible ? <RemoveCircleIcon /> : <CalculateIcon />}
                        sx={{ mb: 2 }}
                      >
                        {exampleVisible ? 'Hide Example' : 'View Example'}
                      </Button>
                      
                      {exampleVisible && (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          borderRadius: 2,
                          border: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`
                        }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Example:
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ExampleIcon>1</ExampleIcon>
                            <Typography variant="body2">
                              4 questions, 1 mark each
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ExampleIcon>2</ExampleIcon>
                            <Typography variant="body2">
                              2 correct answers: +2 marks
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ExampleIcon>3</ExampleIcon>
                            <Typography variant="body2">
                              2 wrong answers: -1 mark (50% of 2 marks)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <ExampleIcon>4</ExampleIcon>
                            <Typography variant="body1" fontWeight={600}>
                              Final Score: 1 mark (2 - 1)
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      <List disablePadding sx={{ mt: 2 }}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">For Correct Answer</Typography>}
                            secondary={`Full marks assigned to the question`}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <RemoveCircleIcon color="error" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">For Incorrect Answer</Typography>}
                            secondary={`Deduction of 50% of the question marks`}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <InfoIcon color="info" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">For Unattempted Questions</Typography>}
                            secondary={`No marks awarded or deducted`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </InfoCard>
                </Grid>
              </Grid>
            </>
          )}
          
          {activeStep === 1 && (
            <>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 4 }}>
                Exam Rules & Instructions
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoCard type="info">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.info.main, display: 'flex', alignItems: 'center' }}>
                        <InfoIcon sx={{ mr: 1 }} />
                        Exam Instructions
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body1" paragraph>
                        {exam.instructions || "Please read all questions carefully before answering. Once you submit the exam, you cannot change your answers."}
                      </Typography>
                      
                      <List disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <TimerIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Time Management"
                            secondary="The timer starts as soon as you begin the exam. Manage your time wisely to answer all questions."
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CalculateIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Negative Marking"
                            secondary="Be careful with your answers as incorrect answers will result in negative marks."
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <AssignmentTurnedInIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Final Submission"
                            secondary="Review your answers before final submission. Once submitted, you cannot modify your answers."
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </InfoCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <InfoCard type="error">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.error.main, display: 'flex', alignItems: 'center' }}>
                        <SecurityIcon sx={{ mr: 1 }} />
                        Important Rules
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <List disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <BlockIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="No Tab Switching"
                            secondary="Switching tabs or opening new windows is not allowed and may result in disqualification."
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <FullscreenIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Full Screen Mode"
                            secondary="The exam will run in full screen mode. Exiting this mode may be flagged as suspicious activity."
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <BlockIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Keyboard Restrictions"
                            secondary="Some keyboard shortcuts will be disabled during the exam to prevent cheating."
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <ReceiptIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="One Attempt Only"
                            secondary="You can only attempt this exam once. Make sure you are ready before starting."
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        textAlign: 'center'
                      }}>
                        <Typography variant="subtitle2" color="error">
                          Any violation of these rules may lead to disqualification
                        </Typography>
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>
              </Grid>
            </>
          )}
          
          {activeStep === 2 && (
            <>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Ready to Begin
              </Typography>
              
              <Box sx={{ 
                px: 3,
                py: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 3,
                mb: 3
              }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  <LaunchIcon sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  {exam.title}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                  <Chip 
                    icon={<TimerIcon />} 
                    label={`${exam.duration} minutes`} 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<QuestionAnswerIcon />} 
                    label={`${exam.questions.length} Questions`} 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<CalculateIcon />} 
                    label="Negative Marking: 50%" 
                    color="warning" 
                    variant="outlined"
                  />
                </Box>
                
                <Alert severity="warning" sx={{ mx: 'auto', mb: 3, maxWidth: 600 }}>
                  Once you start the exam, the timer will begin and cannot be paused.
                </Alert>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                  <Checkbox
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    color="primary"
                    id="agreement-checkbox"
                  />
                  <Typography 
                    component="label" 
                    htmlFor="agreement-checkbox" 
                    variant="body1" 
                    sx={{ fontWeight: 500 }}
                  >
                    I have read and agree to follow the exam rules
                  </Typography>
                </Box>
                
                <GradientButton
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!agreementChecked || startingExam}
                  onClick={handleStartExam}
                  endIcon={!startingExam && <LaunchIcon />}
                  sx={{ px: 5, py: 1.5 }}
                >
                  {startingExam ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Starting Exam...
                    </>
                  ) : (
                    'Start Exam Now'
                  )}
                </GradientButton>
              </Box>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  color="primary"
                  startIcon={<HelpOutlineIcon />}
                  onClick={() => setHelpDialogOpen(true)}
                >
                  Need Help?
                </Button>
              </Box>
            </>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 6 }}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleStartExam : handleNext}
            endIcon={activeStep === steps.length - 1 ? null : <ArrowForwardIcon />}
            disabled={(activeStep === steps.length - 1 && !agreementChecked) || startingExam}
            sx={{ borderRadius: 6 }}
          >
            {activeStep === steps.length - 1 ? (
              startingExam ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Start Exam'
              )
            ) : (
              'Continue'
            )}
          </Button>
        </Box>
      </StyledPaper>
      
      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            If you have any questions or encounter issues during the exam, please contact your instructor or the support team.
          </Typography>
          <Typography variant="body1" paragraph>
            Technical support: support@skillvedaa.com
          </Typography>
          <Typography variant="body1" paragraph>
            Emergency contact: +1 (555) 123-4567
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentInstructions;