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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Switch,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Zoom,
  alpha,
  useTheme,
  LinearProgress,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Save,
  ArrowBack,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  EventAvailable as EventAvailableIcon,
  Description as DescriptionIcon,
  LibraryBooks as LibraryBooksIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  FileCopy as FileCopyIcon,
  ContentPaste as ContentPasteIcon,
  Upload as UploadIcon,
  Restore as RestoreIcon,
  Settings as SettingsIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Preview as PreviewIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
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

const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  overflow: 'visible',
  '&:hover': {
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  }
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
  },
}));

const StyledAccordion = styled(Accordion)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: active ? '0 2px 12px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  '&:before': {
    display: 'none', // Remove the default line
  },
  ...(active && {
    borderColor: theme.palette.primary.main,
    '& .MuiAccordionSummary-root': {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
  }),
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(1, 2),
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(2, 3, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
  }
}));

const StepperSummary = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
  }
}));

const CreateExam = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Initialize with default values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 1 day from now
    duration: 60, // Minutes for taking the exam
    activeDuration: 24, // Hours the exam is available after start time
    passingScore: 60, // Default passing percentage
    shuffleQuestions: true, // Option to randomize question order
    showResults: true, // Show results to students after completion
    allowReattempt: false, // Allow students to retake the exam
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1,
      },
    ],
    instructions: 'Please read all questions carefully before answering. Once you submit the exam, you cannot change your answers.',
  });

  // AutoSave effect
  useEffect(() => {
    // Simulate auto-saving after user input
    const autoSaveTimer = setTimeout(() => {
      if (formData.title || formData.description || formData.questions[0].questionText) {
        setAutoSaving(true);
        // Simulate saving to localStorage
        localStorage.setItem('examDraft', JSON.stringify(formData));

        // Show autosave indicator briefly
        setTimeout(() => {
          setAutoSaving(false);
        }, 1500);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  // Update progress percentage based on form completion
  useEffect(() => {
    let percent = 0;

    // Basic info (25%)
    if (formData.title) percent += 10;
    if (formData.description) percent += 5;
    if (formData.instructions) percent += 5;
    if (formData.startTime) percent += 5;

    // Questions (65%)
    const questionPercent = 65 / formData.questions.length;
    formData.questions.forEach(q => {
      let qPercent = 0;
      if (q.questionText) qPercent += 0.4;

      // Check options
      const filledOptions = q.options.filter(o => o.trim() !== '').length;
      qPercent += (filledOptions / q.options.length) * 0.6;

      percent += qPercent * questionPercent;
    });

    // Time and date settings (10%)
    if (formData.duration > 0) percent += 5;
    if (formData.activeDuration > 0) percent += 5;

    setProgressPercent(Math.round(percent));
  }, [formData]);

  // Check for saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('examDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        // Convert date strings back to Date objects
        parsedDraft.startTime = new Date(parsedDraft.startTime);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleStartTimeChange = (newValue) => {
    setFormData({
      ...formData,
      startTime: newValue,
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleCorrectOptionChange = (questionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctOption: parseInt(value),
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOption: 0,
          marks: 1,
        },
      ],
    });
    // Auto-expand the newly added question
    setExpandedQuestion(formData.questions.length);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      setError('Exam must have at least one question');
      return;
    }

    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });

    // If we removed the expanded question, collapse all
    if (expandedQuestion === index) {
      setExpandedQuestion(-1);
    } else if (expandedQuestion > index) {
      // If we removed a question before the expanded one, adjust the index
      setExpandedQuestion(expandedQuestion - 1);
    }
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = { ...formData.questions[index] };
    const updatedQuestions = [...formData.questions];
    // Insert the duplicate right after the original
    updatedQuestions.splice(index + 1, 0, questionToDuplicate);

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });

    // Auto-expand the duplicated question
    setExpandedQuestion(index + 1);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.title.trim()) {
      setError('Exam title is required');
      setActiveStep(0);
      return false;
    }

    if (!formData.description.trim()) {
      setError('Exam description is required');
      setActiveStep(0);
      return false;
    }

    if (!formData.startTime) {
      setError('Start time is required');
      setActiveStep(0);
      return false;
    }

    if (new Date(formData.startTime) <= new Date()) {
      setError('Start time must be in the future');
      setActiveStep(0);
      return false;
    }

    if (formData.duration <= 0) {
      setError('Duration must be greater than 0 minutes');
      setActiveStep(0);
      return false;
    }

    if (formData.activeDuration <= 0) {
      setError('Active duration must be greater than 0 hours');
      setActiveStep(0);
      return false;
    }

    if (formData.passingScore < 0 || formData.passingScore > 100) {
      setError('Passing score must be between 0 and 100');
      setActiveStep(0);
      return false;
    }

    // Validate questions
    if (formData.questions.length === 0) {
      setError('At least one question is required');
      setActiveStep(1);
      return false;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        setActiveStep(1);
        setExpandedQuestion(i);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          setError(`Option ${j + 1} for Question ${i + 1} is required`);
          setActiveStep(1);
          setExpandedQuestion(i);
          return false;
        }
      }

      if (question.marks <= 0) {
        setError(`Marks for Question ${i + 1} must be greater than 0`);
        setActiveStep(1);
        setExpandedQuestion(i);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Ensure token is included in request
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('/api/v1/exam', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Exam created successfully!');

      // Clear the saved draft
      localStorage.removeItem('examDraft');

      // Redirect after a delay
      setTimeout(() => {
        navigate('/admin/exams');
      }, 2000);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.msg || 'Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setDiscardDialogOpen(true);
  };

  const confirmDiscard = () => {
    // Clear localStorage and reset form
    localStorage.removeItem('examDraft');
    setFormData({
      title: '',
      description: '',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 60,
      activeDuration: 24,
      passingScore: 60,
      shuffleQuestions: true,
      showResults: true,
      allowReattempt: false,
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOption: 0,
          marks: 1,
        },
      ],
      instructions: 'Please read all questions carefully before answering. Once you submit the exam, you cannot change your answers.',
    });
    setActiveStep(0);
    setExpandedQuestion(0);
    setDiscardDialogOpen(false);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  // Calculate total marks
  const totalMarks = formData.questions.reduce((sum, q) => sum + q.marks, 0);

  // Calculate and display the time when the exam will become unavailable
  const examEndTime = new Date(formData.startTime);
  examEndTime.setHours(examEndTime.getHours() + Number(formData.activeDuration));
  const formattedEndTime = examEndTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format the start time
  const formattedStartTime = formData.startTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const steps = [
    {
      label: 'Basic Information',
      icon: <DescriptionIcon />,
    },
    {
      label: 'Questions & Answers',
      icon: <QuestionAnswerIcon />,
    },
    {
      label: 'Review & Create',
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <AdminLayout title="Create Exam">
      <Box sx={{ position: 'relative' }}>
        {/* Fixed notification for autosaving */}
        <Fade in={autoSaving}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              color: 'text.secondary',
              py: 1,
              px: 2,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2">Auto-saving draft...</Typography>
          </Box>
        </Fade>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          {/* Header section */}
          <Fade in={true} timeout={800}>
            <HeaderBox>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      Create New Exam
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: '600px' }}>
                      Design your exam by adding questions, setting a time limit, and configuring other options.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Box sx={{ mr: 1.5 }}>
                        <CircularProgress
                          variant="determinate"
                          value={progressPercent}
                          size={40}
                          thickness={5}
                          sx={{
                            color: progressPercent > 75 ? theme.palette.success.main : theme.palette.info.main,
                            bgcolor: alpha(theme.palette.common.white, 0.2),
                            borderRadius: '50%',
                            p: 0.5,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="white">
                          {progressPercent}% Complete
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {formData.questions.length} Question{formData.questions.length !== 1 ? 's' : ''} | {totalMarks} Marks
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </HeaderBox>
          </Fade>

          <Grid container spacing={3}>
            {/* Left sidebar */}
            <Grid item xs={12} md={3}>
              <StepperSummary>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center">
                  Exam Creation Progress
                </Typography>

                <Box sx={{ width: '100%', my: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                    }}
                  />

                  <Typography variant="body2" color="text.secondary" align="center">
                    {progressPercent}% Complete
                  </Typography>
                </Box>

                <Divider sx={{ width: '100%', my: 2 }} />

                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Current Statistics:
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Questions:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formData.questions.length}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Total Marks:</Typography>
                    <Typography variant="body2" fontWeight={500}>{totalMarks}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Time Limit:</Typography>
                    <Typography variant="body2" fontWeight={500}>{formData.duration} min</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Passing Score:</Typography>
                    <Typography variant="body2" fontWeight={500}>{formData.passingScore}%</Typography>
                  </Box>
                </Box>

                <Divider sx={{ width: '100%', my: 2 }} />

                <Stack direction="column" spacing={1} sx={{ width: '100%', mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handlePreview}
                    startIcon={<PreviewIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Preview Exam
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleDiscard}
                    startIcon={<DeleteIcon />}
                    color="error"
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Discard Draft
                  </Button>
                </Stack>
              </StepperSummary>
            </Grid>

            {/* Main content */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/exams')}
                    variant="outlined"
                  >
                    Back to Exams
                  </Button>

                  {/* Only show if we have a saved draft */}
                  {localStorage.getItem('examDraft') && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        icon={<RestoreIcon fontSize="small" />}
                        label="Draft saved"
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    </Box>
                  )}
                </Box>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSuccess('')}
                    icon={<CheckCircleIcon fontSize="inherit" />}
                  >
                    {success}
                  </Alert>
                )}

                {/* Stepper */}
                <Box sx={{ mb: 4 }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          StepIconProps={{
                            icon: step.icon,
                          }}
                          optional={
                            <Typography variant="caption">
                              {index === 0 ? 'Exam details' :
                                index === 1 ? `${formData.questions.length} questions` :
                                  'Final review'}
                            </Typography>
                          }
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                  {/* Step 1: Basic Information */}
                  {activeStep === 0 && (
                    <Fade in={activeStep === 0} timeout={500}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Basic Exam Information
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Exam Title"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              required
                              disabled={isSubmitting}
                              variant="outlined"
                              placeholder="E.g. Midterm Mathematics Assessment"
                              helperText="A descriptive title for your exam"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              multiline
                              rows={3}
                              required
                              disabled={isSubmitting}
                              placeholder="E.g. This exam covers topics from Units 1-5 including algebra, geometry, and statistics"
                              helperText="Briefly describe the purpose and content of the exam"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Student Instructions"
                              name="instructions"
                              value={formData.instructions}
                              onChange={handleChange}
                              multiline
                              rows={3}
                              disabled={isSubmitting}
                              placeholder="Instructions for students to follow during the exam"
                              helperText="These instructions will be shown to students before they begin the exam"
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <MobileDateTimePicker
                                label="Start Time"
                                value={formData.startTime}
                                onChange={handleStartTimeChange}
                                minDateTime={new Date()}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    variant: "outlined",
                                    helperText: "When the exam becomes available to students"
                                  }
                                }}
                                disabled={isSubmitting}
                              />
                            </LocalizationProvider>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Duration (minutes)"
                              name="duration"
                              type="number"
                              value={formData.duration}
                              onChange={handleChange}
                              required
                              inputProps={{ min: 1 }}
                              disabled={isSubmitting}
                              helperText="Time allowed for students to complete the exam"
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Active Duration (hours)"
                              name="activeDuration"
                              type="number"
                              value={formData.activeDuration}
                              onChange={handleChange}
                              required
                              inputProps={{ min: 1 }}
                              disabled={isSubmitting}
                              helperText="Time window during which the exam can be started"
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Passing Score (%)"
                              name="passingScore"
                              type="number"
                              value={formData.passingScore}
                              onChange={handleChange}
                              required
                              inputProps={{ min: 0, max: 100 }}
                              disabled={isSubmitting}
                              helperText="Minimum percentage required to pass the exam"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Card sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                              <CardHeader
                                avatar={
                                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                                    <AccessTimeIcon />
                                  </Avatar>
                                }
                                title="Exam Availability Period"
                                subheader="This is when students can access and take the exam"
                              />
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                      Available from:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {formattedStartTime}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                      Available until:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {formattedEndTime}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Additional exam settings */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                              Additional Settings
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={formData.shuffleQuestions}
                                      onChange={handleSwitchChange}
                                      name="shuffleQuestions"
                                      color="primary"
                                    />
                                  }
                                  label="Shuffle Questions"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                  Randomize question order for each student
                                </Typography>
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={formData.showResults}
                                      onChange={handleSwitchChange}
                                      name="showResults"
                                      color="primary"
                                    />
                                  }
                                  label="Show Results"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                  Show scores to students after completion
                                </Typography>
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={formData.allowReattempt}
                                      onChange={handleSwitchChange}
                                      name="allowReattempt"
                                      color="primary"
                                    />
                                  }
                                  label="Allow Reattempt"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                  Let students retake the exam if needed
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            endIcon={<NavigateNextIcon />}
                            disabled={!formData.title || !formData.description}
                          >
                            Continue to Questions
                          </Button>
                        </Box>
                      </Box>
                    </Fade>
                  )}

                  {/* Step 2: Questions */}
                  {activeStep === 1 && (
                    <Fade in={activeStep === 1} timeout={500}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h6">
                            Questions & Answers
                          </Typography>
                          <Badge
                            badgeContent={formData.questions.length}
                            color="primary"
                            max={99}
                            sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 22, minWidth: 22 } }}
                          >
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={addQuestion}
                              disabled={isSubmitting}
                            >
                              Add Question
                            </Button>
                          </Badge>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Alert severity="info" icon={<InfoIcon />}>
                            Click on a question to expand and edit it. All questions are required to have a question text and all options filled.
                          </Alert>
                        </Box>

                        {formData.questions.map((question, questionIndex) => (
                          <StyledAccordion
                            key={questionIndex}
                            expanded={expandedQuestion === questionIndex}
                            onChange={() => setExpandedQuestion(expandedQuestion === questionIndex ? -1 : questionIndex)}
                            active={expandedQuestion === questionIndex ? 1 : 0}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 1 }} />
                                <Typography sx={{ flexGrow: 1 }}>
                                  <strong>Question {questionIndex + 1}</strong>
                                  {question.questionText ?
                                    `: ${question.questionText.substring(0, 60)}${question.questionText.length > 60 ? '...' : ''}` :
                                    ' (Empty)'}
                                </Typography>
                                <Chip
                                  label={`${question.marks} mark${question.marks !== 1 ? 's' : ''}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ position: 'relative' }}>
                                <TextField
                                  fullWidth
                                  label={`Question ${questionIndex + 1}`}
                                  value={question.questionText}
                                  onChange={(e) =>
                                    handleQuestionChange(questionIndex, 'questionText', e.target.value)
                                  }
                                  multiline
                                  rows={2}
                                  required
                                  disabled={isSubmitting}
                                  sx={{ mb: 2 }}
                                  placeholder="Enter your question text here"
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <TextField
                                    label="Marks"
                                    type="number"
                                    value={question.marks}
                                    onChange={(e) =>
                                      handleQuestionChange(questionIndex, 'marks', parseInt(e.target.value) || 1)
                                    }
                                    inputProps={{ min: 1 }}
                                    disabled={isSubmitting}
                                    sx={{ width: '100px', mr: 2 }}
                                  />

                                  <Tooltip title="The number of marks awarded for this question">
                                    <InfoIcon fontSize="small" color="action" />
                                  </Tooltip>
                                </Box>

                                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                  Answer Options
                                  <Tooltip title="Select the correct answer using the radio buttons">
                                    <InfoIcon fontSize="small" sx={{ ml: 1, color: 'action.active' }} />
                                  </Tooltip>
                                </Typography>

                                <RadioGroup
                                  value={question.correctOption}
                                  onChange={(e) =>
                                    handleCorrectOptionChange(questionIndex, e.target.value)
                                  }
                                >
                                  {question.options.map((option, optionIndex) => (
                                    <Box
                                      key={optionIndex}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 1.5,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: parseInt(question.correctOption) === optionIndex ?
                                          alpha(theme.palette.success.main, 0.08) : 'transparent',
                                        border: '1px solid',
                                        borderColor: parseInt(question.correctOption) === optionIndex ?
                                          theme.palette.success.main : theme.palette.divider,
                                      }}
                                    >
                                      <FormControlLabel
                                        value={optionIndex}
                                        control={
                                          <Radio
                                            disabled={isSubmitting}
                                            color={parseInt(question.correctOption) === optionIndex ? "success" : "primary"}
                                          />
                                        }
                                        label=""
                                      />
                                      <TextField
                                        fullWidth
                                        label={`Option ${optionIndex + 1}`}
                                        value={option}
                                        onChange={(e) =>
                                          handleOptionChange(questionIndex, optionIndex, e.target.value)
                                        }
                                        required
                                        disabled={isSubmitting}
                                        size="small"
                                        placeholder={`Enter option ${optionIndex + 1}`}
                                        variant="outlined"
                                      />
                                    </Box>
                                  ))}
                                </RadioGroup>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    startIcon={<FileCopyIcon />}
                                    onClick={() => duplicateQuestion(questionIndex)}
                                    disabled={isSubmitting}
                                  >
                                    Duplicate
                                  </Button>

                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => removeQuestion(questionIndex)}
                                    disabled={isSubmitting || formData.questions.length <= 1}
                                  >
                                    Remove
                                  </Button>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </StyledAccordion>
                        ))}

                        <Box sx={{ mb: 3, mt: 3, textAlign: 'center' }}>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addQuestion}
                            disabled={isSubmitting}
                            sx={{ px: 3 }}
                          >
                            Add Another Question
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={handleBack}
                            startIcon={<NavigateBeforeIcon />}
                          >
                            Back to Basic Info
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            endIcon={<NavigateNextIcon />}
                            disabled={formData.questions.some(q => !q.questionText)}
                          >
                            Review & Create
                          </Button>
                        </Box>
                      </Box>
                    </Fade>
                  )}

                  {/* Step 3: Review */}
                  {activeStep === 2 && (
                    <Fade in={activeStep === 2} timeout={500}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Review & Create Exam
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3 }}>
                          Please review all exam details before creating. The exam will be available to students according to the schedule you've set.
                        </Alert>

                        <StyledCard>
                          <CardHeader
                            title="Exam Information"
                            avatar={
                              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                <LibraryBooksIcon />
                              </Avatar>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">Title</Typography>
                                <Typography variant="body1" fontWeight={500}>{formData.title}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">Total Marks</Typography>
                                <Typography variant="body1" fontWeight={500}>{totalMarks} marks</Typography>
                              </Grid>

                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">Description</Typography>
                                <Typography variant="body1">{formData.description}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">Start Time</Typography>
                                <Typography variant="body1">{formattedStartTime}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">End Time</Typography>
                                <Typography variant="body1">{formattedEndTime}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Duration</Typography>
                                <Typography variant="body1">{formData.duration} minutes</Typography>
                              </Grid>

                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Questions</Typography>
                                <Typography variant="body1">{formData.questions.length} questions</Typography>
                              </Grid>

                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Passing Score</Typography>
                                <Typography variant="body1">{formData.passingScore}%</Typography>
                              </Grid>

                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600}>Settings</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  <Chip
                                    icon={formData.shuffleQuestions ? <CheckIcon /> : "*"}
                                    label="Shuffle Questions"
                                    variant={formData.shuffleQuestions ? "filled" : "outlined"}
                                    color={formData.shuffleQuestions ? "primary" : "default"}
                                    size="small"
                                  />
                                  <Chip
                                    icon={formData.showResults ? <CheckIcon /> : "*"}
                                    label="Show Results"
                                    variant={formData.showResults ? "filled" : "outlined"}
                                    color={formData.showResults ? "primary" : "default"}
                                    size="small"
                                  />
                                  <Chip
                                    icon={formData.allowReattempt ? <CheckIcon /> : "*"}
                                    label="Allow Reattempt"
                                    variant={formData.allowReattempt ? "filled" : "outlined"}
                                    color={formData.allowReattempt ? "primary" : "default"}
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </StyledCard>

                        <Box sx={{ mt: 3 }}>
                          <StyledCard>
                            <CardHeader
                              title="Question Summary"
                              subheader={`${formData.questions.length} Questions | ${totalMarks} Total Marks`}
                              avatar={
                                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                                  <FormatListNumberedIcon />
                                </Avatar>
                              }
                            />
                            <Divider />
                            <CardContent>
                              {formData.questions.slice(0, 3).map((question, index) => (
                                <Box key={index} sx={{ mb: index < 2 ? 2 : 0 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Question {index + 1} ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {question.questionText}
                                  </Typography>

                                  <Box sx={{ ml: 2, mb: 1 }}>
                                    {question.options.map((option, optIndex) => (
                                      <Typography
                                        key={optIndex}
                                        variant="body2"
                                        color={optIndex === question.correctOption ? "success.main" : "text.secondary"}
                                        sx={{
                                          fontWeight: optIndex === question.correctOption ? 600 : 400,
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        {optIndex === question.correctOption &&
                                          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />}
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                      </Typography>
                                    ))}
                                  </Box>

                                  {index < 2 && <Divider sx={{ my: 2 }} />}
                                </Box>
                              ))}

                              {formData.questions.length > 3 && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                  <Button
                                    variant="text"
                                    onClick={handlePreview}
                                    startIcon={<VisibilityIcon />}
                                  >
                                    View All {formData.questions.length} Questions
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </StyledCard>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={handleBack}
                            startIcon={<NavigateBeforeIcon />}
                          >
                            Back to Questions
                          </Button>
                          <GradientButton
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            size="large"
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                          >
                            {isSubmitting ? 'Creating...' : 'Create Exam'}
                          </GradientButton>
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Discard Dialog */}
        <Dialog
          open={discardDialogOpen}
          onClose={() => setDiscardDialogOpen(false)}
        >
          <DialogTitle>
            Discard Exam Draft?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to discard this exam draft? All your progress will be lost and cannot be recovered.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiscardDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDiscard}
              color="error"
              variant="contained"
            >
              Discard Draft
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PreviewIcon sx={{ mr: 1 }} />
              Exam Preview: {formData.title}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {formData.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {formData.description}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Duration:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.duration} minutes
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Total Marks:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {totalMarks}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Passing Score:</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.passingScore}%
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Instructions:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', mb: 3 }}>
                <Typography variant="body2">
                  {formData.instructions}
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Questions:
            </Typography>

            {formData.questions.map((question, qIndex) => (
              <QuestionCard key={qIndex} elevation={0}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Question {qIndex + 1}: ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                </Typography>
                <Typography variant="body1" paragraph>
                  {question.questionText}
                </Typography>

                <Box sx={{ ml: 2 }}>
                  {question.options.map((option, oIndex) => (
                    <Box
                      key={oIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: oIndex === question.correctOption ?
                          alpha(theme.palette.success.light, 0.1) : 'transparent'
                      }}
                    >
                      <Radio
                        checked={oIndex === question.correctOption}
                        readOnly
                        size="small"
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: oIndex === question.correctOption ? 600 : 400,
                          color: oIndex === question.correctOption ? 'success.main' : 'text.primary'
                        }}
                      >
                        {option}
                      </Typography>
                      {oIndex === question.correctOption && (
                        <Chip
                          label="Correct Answer"
                          size="small"
                          color="success"
                          sx={{ ml: 2 }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </QuestionCard>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default CreateExam;