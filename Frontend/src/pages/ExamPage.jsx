import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Check,
  Error,
  Warning,
  Close,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [warning, setWarning] = useState('');

  const timerRef = useRef(null);
  const warningTimeout = useRef(null);
  const fullscreenWarningCount = useRef(0);
  const securityViolationCount = useRef(0);

  // Enhanced security measures
  const initSecurity = useCallback(() => {
    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Error attempting to enable full-screen mode:', err);
      });
    }

    // Block all keyboard shortcuts and special keys
    const handleKeyDown = (e) => {
      // Always allowed keys for navigation
      const allowedKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Enter', 'Space', 'Home', 'End'
      ];

      // Capture and prevent all key combinations
      if (
        // Block all modifier key combinations
        (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) ||

        // Block function keys
        (e.key.startsWith('F') && e.key !== 'F5') ||

        // Block special keys
        ['Tab', 'Escape', 'Insert', 'Delete', 'PrintScreen', 'ScrollLock', 'Pause'].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordSecurityViolation('Unauthorized keyboard shortcut detected');
        return false;
      }
    };

    // Enhanced right-click blocking
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      recordSecurityViolation('Right-click is not allowed during the exam');
      return false;
    };

    // Enhanced visibility change detection
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        recordSecurityViolation('Tab switching detected! Return immediately.');

        // Auto-submit after 3 violations
        if (securityViolationCount.current >= 3) {
          showWarning('Multiple tab switches detected. Submitting exam...');
          handleSubmitWithViolation('Multiple tab switches');
        }
      }
    };

    // Enhanced fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fullscreenWarningCount.current += 1;
        recordSecurityViolation('Exiting fullscreen mode is not allowed');

        // After 3 warnings, submit the exam
        if (fullscreenWarningCount.current >= 3) {
          showWarning('Multiple fullscreen exits detected. Submitting exam...');
          handleSubmitWithViolation('Multiple fullscreen exits');
        } else {
          // Try to re-enter fullscreen
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
              console.warn('Error attempting to re-enable full-screen mode:', err);
            });
          }
        }
      }
    };

    // Enhanced copy/paste prevention
    const handleCopy = (e) => {
      e.preventDefault();
      recordSecurityViolation('Copying content is not allowed');
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordSecurityViolation('Pasting content is not allowed');
      return false;
    };

    // Detect browser DevTools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        recordSecurityViolation('Developer tools detected');
        if (securityViolationCount.current >= 3) {
          showWarning('Developer tools detected. Submitting exam...');
          handleSubmitWithViolation('Developer tools detected');
        }
      }
    };

    // Detect if window loses focus
    const handleBlur = () => {
      recordSecurityViolation('Window lost focus');
    };

    // Add all event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    window.addEventListener('blur', handleBlur);

    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('blur', handleBlur);
      clearInterval(devToolsInterval);

      // Exit fullscreen when leaving the page
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.warn('Error attempting to exit full-screen mode:', err);
        });
      }
    };
  }, []);

  const recordSecurityViolation = (message) => {
    securityViolationCount.current += 1;
    showWarning(`${message} (Warning ${securityViolationCount.current}/3)`);

    // Log the violation
    console.warn(`Security violation: ${message}`);

    // Send violation to server in background (optional)
    try {
      axios.post(`/api/v1/exam/${examId}/violation`, {
        type: message,
        timestamp: new Date().toISOString(),
        count: securityViolationCount.current
      }).catch(err => console.error('Failed to log violation:', err));
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  const handleSubmitWithViolation = async (reason) => {
    // If already submitting, avoid duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Send the answers with violation flag
      const response = await axios.post(`/api/v1/exam/${examId}/submit`, {
        answers,
        forcedSubmission: true,
        reason
      });

      // Redirect to completion page
      navigate(`/student/exam/${examId}/complete`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError(error.response?.data?.msg || 'Failed to submit exam');
      setIsSubmitting(false);
    }
  };

  const showWarning = (message) => {
    setWarning(message);

    // Clear previous timeout
    if (warningTimeout.current) {
      clearTimeout(warningTimeout.current);
    }

    // Hide warning after 5 seconds
    warningTimeout.current = setTimeout(() => {
      setWarning('');
    }, 5000);
  };

  const startTimer = useCallback((endTime) => {
    // Calculate remaining time in seconds
    const remainingSeconds = Math.max(0, Math.floor((new Date(endTime) - new Date()) / 1000));
    setRemainingTime(remainingSeconds);

    // Update timer every second
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchExam = useCallback(async () => {
    try {
      // Get exam details
      const examResponse = await axios.get(`/api/v1/exam/${examId}`);
      setExam(examResponse.data.exam);

      // Start the exam (which also checks if user can take it)
      const startResponse = await axios.post(`/api/v1/exam/${examId}/start`);

      // Initialize answers array
      const initialAnswers = examResponse.data.exam.questions.map((q) => ({
        questionId: q._id,
        selectedOption: null,
      }));

      setAnswers(initialAnswers);
      setExamResult(startResponse.data.result);

      // Start the timer
      const endTime = new Date(startResponse.data.result.endTime);
      startTimer(endTime);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.result) {
        // Exam already completed, show result
        navigate(`/student/exam/${examId}/complete`);
        return;
      }

      setError(error.response?.data?.msg || 'Failed to load exam');
      console.error('Error fetching exam:', error);
    } finally {
      setIsLoading(false);
    }
  }, [examId, navigate, startTimer]);

  // Initialize exam and security measures
  useEffect(() => {
    fetchExam();
    const cleanupSecurity = initSecurity();

    // Confirm before leaving the page
    const handleBeforeUnload = (e) => {
      const message = 'Are you sure you want to leave? Your exam progress will be lost!';
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      cleanupSecurity();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchExam, initSecurity]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleAnswerChange = (e) => {
    const selectedOption = parseInt(e.target.value);

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      selectedOption,
    };

    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleConfirmSubmit = () => {
    // Check if all questions are answered
    const unansweredCount = answers.filter(a => a.selectedOption === null).length;
    if (unansweredCount > 0) {
      setConfirmSubmit(true);
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = async () => {
    // Close confirm dialog if open
    setConfirmSubmit(false);
    setIsSubmitting(true);

    try {
      const response = await axios.post(`/api/v1/exam/${examId}/submit`, { answers });
      navigate(`/student/exam/${examId}/complete`);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to submit exam');
      console.error('Error submitting exam:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Error fontSize="large" color="error" />
          <Typography variant="h5" color="error" sx={{ mt: 2, mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!exam) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Error fontSize="large" color="error" />
          <Typography variant="h5" color="error" sx={{ mt: 2, mb: 3 }}>
            Exam not found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = answers.filter(a => a.selectedOption !== null).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Warning Snackbar */}
      <Snackbar
        open={!!warning}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 6 }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          {warning}
        </Alert>
      </Snackbar>

      {/* Security Status Indicator */}
      <Box
        sx={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: securityViolationCount.current > 0 ? 'error.light' : 'success.light',
          color: 'white',
          px: 2,
          py: 0.5,
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        {securityViolationCount.current > 0 ? (
          <>
            <Warning fontSize="small" />
            <Typography variant="caption" fontWeight="bold">
              Security Violations: {securityViolationCount.current}/3
            </Typography>
          </>
        ) : (
          <>
            <Check fontSize="small" />
            <Typography variant="caption" fontWeight="bold">
              Secure Mode Active
            </Typography>
          </>
        )}
      </Box>

      {/* Exam Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h6" noWrap>
              {exam.title}
            </Typography>
          </Grid>
          <Grid item>
            <Box
              sx={{
                p: 1,
                border: '1px solid',
                borderColor: remainingTime && remainingTime < 300 ? 'error.main' : 'primary.main',
                borderRadius: 1,
                bgcolor: remainingTime && remainingTime < 300 ? 'error.light' : 'primary.light',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box component="span" sx={{ mr: 1 }}>
                Time Remaining:
              </Box>
              <Box component="span">{formatTime(remainingTime)}</Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">
            Student: {user?.name} ({user?.studentId})
          </Typography>
          <Typography variant="body2">
            Progress: {answeredCount}/{exam.questions.length} questions answered
          </Typography>
        </Box>
      </Paper>

      {/* Question */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.questionText}
          </Typography>
        </Box>

        <FormControl component="fieldset">
          <RadioGroup
            name="question-options"
            value={currentAnswer.selectedOption === null ? '' : currentAnswer.selectedOption}
            onChange={handleAnswerChange}
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                sx={{
                  mb: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit Exam'}
        </Button>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === exam.questions.length - 1 || isSubmitting}
        >
          Next
        </Button>
      </Box>

      {/* Question Navigation */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Question Navigator
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {answers.map((answer, index) => (
            <Button
              key={index}
              variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
              color={answer.selectedOption !== null ? 'success' : 'primary'}
              size="small"
              onClick={() => setCurrentQuestionIndex(index)}
              sx={{ minWidth: 40, maxWidth: 40 }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Confirm Submit Dialog */}
      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
      >
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have {answers.filter(a => a.selectedOption === null).length} unanswered questions.
            Are you sure you want to submit the exam?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>
            Go Back
          </Button>
          <Button onClick={handleSubmitExam} color="primary" variant="contained">
            Submit Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamPage;