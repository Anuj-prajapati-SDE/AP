import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  ArrowBack,
  Home,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExamComplete = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate] = useState(new Date().toISOString().replace('T', ' ').slice(0, 19));

  useEffect(() => {
    const fetchExamTitle = async () => {
      try {
        // Just fetch minimal info - just the exam title
        const response = await axios.get(`/api/v1/exam/${examId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data && response.data.exam) {
          console.log('Exam title fetched:', response.data.exam.title);
          setExamTitle(response.data.exam.title);
        } else {
          setExamTitle('Your Exam');
        }
      } catch (error) {
        console.error('Error fetching exam details:', error);
        setExamTitle('Your Exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExamTitle();

    // Exit fullscreen if still active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.warn('Error exiting fullscreen:', err);
      });
    }

    // Add metadata to document title
    document.title = `Exam Completed - ${new Date().toLocaleDateString()}`;

    // Clean up
    return () => {
      document.title = 'Assessment System';
    };
  }, [examId]);

  const handleReturnToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Finalizing your exam...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <CheckCircle
            color="primary"
            sx={{
              fontSize: 80,
              color: 'primary.main',
              mb: 2,
              animation: 'pulseAnimation 2s infinite'
            }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Exam Completed
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {/* {examTitle} */}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Thank you for completing this exam.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your responses have been recorded successfully.
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth={true}
            startIcon={<ArrowBack />}
            onClick={handleReturnToDashboard}
            sx={{
              py: 1.5,
              fontWeight: 'medium',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Back to Dashboard
          </Button>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth={true}
            startIcon={<Home />}
            component={Link}
            to="/"
            sx={{
              py: 1.5,
              fontWeight: 'medium',
              borderRadius: 2
            }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Footer with metadata */}
        <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Current Date and Time (UTC): {currentDate}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            User: {user?.name || 'VanshSharmaSDE'}
          </Typography>
        </Box>
      </Paper>

      {/* Add pulse animation */}
      <style jsx="true">{`
        @keyframes pulseAnimation {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
};

export default ExamComplete;