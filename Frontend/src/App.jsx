import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Button, Paper } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';

// Pages
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import CreateStudent from './pages/CreateStudent';
import CreateExam from './pages/CreateExam';
import ExamList from './pages/ExamList';
import StudentList from './pages/StudentList';
import ExamResults from './pages/ExamResults';
import StudentInstructions from './pages/StudentInstructions';
import ExamPage from './pages/ExamPage';
import ExamComplete from './pages/ExamComplete';
import StudentDashboard from './pages/StudentDashboard';
import ScrollToTop from './utils/ScrollToTop';

// Set axios default baseURL
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Create theme with improved UI elements
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          boxShadow: '0px 2px 4px rgba(25, 118, 210, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
          '@media (min-width: 600px)': {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f9fafb',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 28,
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect students to student login and admins to admin login
    if (allowedRoles.includes('student')) {
      return <Navigate to="/login/student" />;
    } else {
      return <Navigate to="/login/admin" />;
    }
  }

  return children;
};

// Admin Routes
const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

// Student Routes
const StudentRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student']}>
    {children}
  </ProtectedRoute>
);

// Check if exam is expired or student is blocked
const ExamGuard = ({ children }) => {
  const { user } = useAuth();
  const [canAccessExam, setCanAccessExam] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { examId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkExamAccess = async () => {
      try {
        const response = await axios.post(`/api/v1/exam/${examId}/check-access`);
        if (!response.data.accessible) {
          setCanAccessExam(false);
          setError(response.data.message || 'This exam is no longer accessible');
        }
      } catch (err) {
        setCanAccessExam(false);
        setError(err.response?.data?.msg || 'Cannot access this exam');
      } finally {
        setLoading(false);
      }
    };

    if (user && examId) {
      checkExamAccess();
    }
  }, [user, examId]);

  if (loading) {
    return <div>Checking exam access...</div>;
  }

  if (!canAccessExam) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Exam Access Denied'}
          </Typography>
          <Typography variant="body1" paragraph>
            You cannot access this exam. It may have expired or your account may be blocked.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/student/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
        <ScrollToTop/>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login/student" replace />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/student" element={<StudentLogin />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/students" element={<AdminRoute><StudentList /></AdminRoute>} />
            <Route path="/admin/students/create" element={<AdminRoute><CreateStudent /></AdminRoute>} />
            <Route path="/admin/exams" element={<AdminRoute><ExamList /></AdminRoute>} />
            <Route path="/admin/exams/create" element={<AdminRoute><CreateExam /></AdminRoute>} />
            <Route path="/admin/exams/:examId/results" element={<AdminRoute><ExamResults /></AdminRoute>} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/student/exam/:examId/instructions" element={<StudentRoute><StudentInstructions /></StudentRoute>} />

            {/* Secure Exam Route with ExamGuard */}
            <Route
              path="/student/exam/:examId"
              element={
                <StudentRoute>
                  <ExamGuard>
                    <ExamPage />
                  </ExamGuard>
                </StudentRoute>
              }
            />
            <Route path="/student/exam/:examId/complete" element={<StudentRoute><ExamComplete /></StudentRoute>} />

            {/* Fallback route for any unmatched paths */}
            <Route path="*" element={<Navigate to="/login/student" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;