import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ButtonGroup,
  Skeleton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  styled,
  alpha,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Assessment,
  Timer,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  FileCopy as FileCopyIcon,
  MailOutline as MailOutlineIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { utils, writeFile } from 'xlsx';
import { useReactToPrint } from 'react-to-print';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Styled components for enhanced UI
const StyledQuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const OptionBox = styled(Box)(({ theme, isSelected, isCorrect }) => {
  let backgroundColor = 'transparent';
  let borderColor = theme.palette.divider;
  
  if (isSelected && isCorrect) {
    backgroundColor = alpha(theme.palette.success.main, 0.12);
    borderColor = theme.palette.success.main;
  } else if (isSelected && !isCorrect) {
    backgroundColor = alpha(theme.palette.error.main, 0.12);
    borderColor = theme.palette.error.main;
  } else if (isCorrect) {
    backgroundColor = alpha(theme.palette.success.main, 0.05);
    borderColor = theme.palette.success.main;
  }
  
  return {
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    borderColor,
    backgroundColor,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  };
});

const StatusIndicator = styled(Box)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: type === 'correct' 
    ? alpha(theme.palette.success.main, 0.1) 
    : alpha(theme.palette.error.main, 0.1),
  color: type === 'correct' ? theme.palette.success.main : theme.palette.error.main,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const StatChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  '& .MuiChip-icon': {
    marginLeft: theme.spacing(0.5),
  },
}));

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const theme = useTheme();

  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  
  // New states for student answer details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState(null);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);

  useEffect(() => {
    const fetchExamAndResults = async () => {
      try {
        const [examRes, resultsRes] = await Promise.all([
          axios.get(`/api/v1/exam/${examId}`),
          axios.get(`/api/v1/admin/exams/${examId}/results`),
        ]);

        setExam(examRes.data.exam);
        setResults(resultsRes.data.results);
        setFilteredResults(resultsRes.data.results);
      } catch (error) {
        setError('Failed to load exam results');
        console.error('Error fetching exam results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamAndResults();
  }, [examId]);

  // Filter results when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults(results);
      return;
    }

    const filtered = results.filter((result) =>
      result.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchTerm, results]);

  // New function to handle student row click and fetch detailed answers
  const handleStudentClick = async (student) => {
    if (!student || student.status !== 'completed') return;
    
    setSelectedStudent(student);
    setIsLoadingAnswers(true);
    setAnswerDialogOpen(true);
    
    try {
      // Fetch detailed answers for this student
      const response = await axios.get(`/api/v1/admin/exams/${examId}/students/${student.student._id}/answers`);
      
      setStudentAnswers(response.data);
    } catch (error) {
      console.error('Error fetching student answers:', error);
      // If API doesn't exist, we'll use the answers from the result object itself
      setStudentAnswers({
        answers: student.answers || [],
        questions: exam.questions || [],
      });
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  // Close the student answers dialog
  const handleCloseAnswerDialog = () => {
    setAnswerDialogOpen(false);
    setSelectedStudent(null);
    setStudentAnswers(null);
  };

  // Calculate student answer statistics
  const calculateAnswerStats = () => {
    if (!studentAnswers || !studentAnswers.answers) return { correct: 0, incorrect: 0, total: 0 };
    
    const correct = studentAnswers.answers.filter(answer => answer.isCorrect).length;
    const total = studentAnswers.answers.length;
    const incorrect = total - correct;
    
    return { correct, incorrect, total };
  };

  // Prepare chart data
  const prepareScoreDistributionData = () => {
    const scoreRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    results.forEach((result) => {
      const percentage = result.percentage;

      if (percentage <= 20) scoreRanges['0-20%']++;
      else if (percentage <= 40) scoreRanges['21-40%']++;
      else if (percentage <= 60) scoreRanges['41-60%']++;
      else if (percentage <= 80) scoreRanges['61-80%']++;
      else scoreRanges['81-100%']++;
    });

    return {
      labels: Object.keys(scoreRanges),
      datasets: [
        {
          label: 'Number of Students',
          data: Object.values(scoreRanges),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareStatusData = () => {
    const statusCount = {
      Completed: results.filter((r) => r.status === 'completed').length,
      'In Progress': results.filter((r) => r.status === 'inprogress').length,
      'Not Started': results.filter((r) => r.status === 'notstarted').length,
    };

    return {
      labels: Object.keys(statusCount),
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(255, 99, 132)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const calculateStats = () => {
    if (!results.length) return { avg: 0, highest: 0, lowest: 0, pass: 0, fail: 0 };

    const completedResults = results.filter((r) => r.status === 'completed');
    if (!completedResults.length) return { avg: 0, highest: 0, lowest: 0, pass: 0, fail: 0 };

    const scores = completedResults.map((r) => r.percentage);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const pass = scores.filter((s) => s >= 40).length; // Assuming 40% is pass mark
    const fail = scores.filter((s) => s < 40).length;

    return { avg, highest, lowest, pass, fail };
  };

  const stats = calculateStats();

  // Export functions
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(results.map(result => ({
      'Student ID': result.student?.studentId || 'N/A',
      'Name': result.student?.name || 'N/A',
      'Status': result.status === 'completed' ? 'Completed' :
        result.status === 'inprogress' ? 'In Progress' : 'Not Started',
      'Score': result.status === 'completed' ? result.totalScore : 'N/A',
      'Total Marks': exam.totalMarks,
      'Percentage': result.status === 'completed' ? `${result.percentage.toFixed(1)}%` : 'N/A',
      'Submitted At': result.status === 'completed' ? new Date(result.submittedAt).toLocaleString() : 'N/A',
    })));

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Results');

    writeFile(workbook, `${exam?.title || 'Exam'}_Results.xlsx`);
    handleExportMenuClose();
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${exam?.title || 'Exam'}_Results`,
    onAfterPrint: handleExportMenuClose,
  });

  // Loading UI
  if (isLoading) {
    return (
      <AdminLayout title="Exam Results">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="rectangular" height={40} width={150} />
          </Box>

          <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={350} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={350} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid item xs={12} sm={6} md={2.4} key={item}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>

          <Skeleton variant="rectangular" height={400} />
        </Container>
      </AdminLayout>
    );
  }

  // Error UI
  if (error) {
    return (
      <AdminLayout title="Exam Results">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/exams')}
              variant="outlined"
            >
              Back to Exams
            </Button>
          </Box>
        </Container>
      </AdminLayout>
    );
  }

  // Exam not found UI
  if (!exam) {
    return (
      <AdminLayout title="Exam Results">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">Exam not found</Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/exams')}
              variant="outlined"
            >
              Back to Exams
            </Button>
          </Box>
        </Container>
      </AdminLayout>
    );
  }
  
  // Get answer stats for selected student
  const answerStats = calculateAnswerStats();

  return (
    <AdminLayout title={`Results: ${exam.title}`}>
      <div ref={printRef}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/exams')}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Back to Exams
            </Button>

            <ButtonGroup variant="contained">
              <Button
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportMenuOpen}
              >
                Export
              </Button>
            </ButtonGroup>

            <Menu
              id="export-menu"
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={exportToExcel}>
                <FileCopyIcon fontSize="small" sx={{ mr: 1 }} />
                Export to Excel
              </MenuItem>
              <MenuItem onClick={handlePrint}>
                <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                Print / Save PDF
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleExportMenuClose}>
                <MailOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                Email Results
              </MenuItem>
            </Menu>
          </Box>

          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Exam Details
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {exam.title}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {new Date(exam.startTime).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timer fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Duration
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {exam.duration} minutes
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {exam.description}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Score Distribution
                  </Typography>
                  <Chip
                    label={`${results.filter(r => r.status === 'completed').length} students completed`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ height: 300 }}>
                  {results.length > 0 ? (
                    <Bar
                      data={prepareScoreDistributionData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                            text: 'Score Distribution',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                            },
                            title: {
                              display: true,
                              text: 'Number of Students'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Score Ranges'
                            }
                          }
                        },
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="textSecondary">
                        No results available yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" gutterBottom>
                  Completion Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  {results.length > 0 ? (
                    <Pie
                      data={prepareStatusData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="textSecondary">
                        No results available yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }} variant="outlined">
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="textSecondary" gutterBottom variant="subtitle2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'medium' }}>{results.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }} variant="outlined">
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="textSecondary" gutterBottom variant="subtitle2">
                    Average Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'medium', color: stats.avg < 40 ? 'error.main' : 'success.main' }}>
                    {stats.avg.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }} variant="outlined">
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="textSecondary" gutterBottom variant="subtitle2">
                    Highest Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                    {stats.highest.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }} variant="outlined">
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="textSecondary" gutterBottom variant="subtitle2">
                    Lowest Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'medium', color: stats.lowest < 40 ? 'error.main' : 'success.main' }}>
                    {stats.lowest.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }} variant="outlined">
                <CardContent sx={{ pb: '16px !important', position: 'relative' }}>
                  <Typography color="textSecondary" gutterBottom variant="subtitle2">
                    Pass/Fail
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'success.main', mr: 1 }}>
                      {stats.pass}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                      /
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'error.main', ml: 1 }}>
                      {stats.fail}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">
                Student Results
              </Typography>

              <Box sx={{ display: 'flex' }}>
                <TextField
                  size="small"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 4 }
                  }}
                  sx={{ mr: 1 }}
                />

                <Tooltip title="Filter results">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell align="center">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {results.length === 0 ? 'No results available yet' : 'No matching results found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow
                        key={result._id}
                        hover
                        onClick={() => handleStudentClick(result)}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: result.status === 'completed' && result.percentage < 40 ? 'rgba(255, 99, 132, 0.08)' : 'inherit',
                          cursor: result.status === 'completed' ? 'pointer' : 'default'
                        }}
                      >
                        <TableCell>{result.student?.studentId || 'N/A'}</TableCell>
                        <TableCell>{result.student?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              result.status === 'completed'
                                ? 'Completed'
                                : result.status === 'inprogress'
                                  ? 'In Progress'
                                  : 'Not Started'
                            }
                            color={
                              result.status === 'completed'
                                ? 'success'
                                : result.status === 'inprogress'
                                  ? 'warning'
                                  : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed'
                            ? `${result.totalScore}/${exam.totalMarks}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? (
                            <Typography
                              sx={{
                                fontWeight: 'medium',
                                color: result.percentage < 40 ? 'error.main' : 'success.main'
                              }}
                            >
                              {result.percentage.toFixed(1)}%
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed'
                            ? new Date(result.submittedAt).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {result.status === 'completed' && (
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentClick(result);
                                }}
                              >
                                <QuestionAnswerIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </div>

      {/* Student Answer Details Dialog */}
      <Dialog
        open={answerDialogOpen}
        onClose={handleCloseAnswerDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {selectedStudent?.student?.name || 'Student'}'s Answers
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {selectedStudent?.student?.studentId || 'Student ID'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StatChip
              icon={<CheckCircleOutlineIcon />}
              label={`${answerStats.correct} Correct`}
              color="success"
              variant="outlined"
              size="small"
            />
            <StatChip
              icon={<ErrorOutlineIcon />}
              label={`${answerStats.incorrect} Incorrect`}
              color="error"
              variant="outlined"
              size="small"
            />
            <IconButton onClick={handleCloseAnswerDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {isLoadingAnswers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !studentAnswers ? (
            <Alert severity="error">
              Failed to load student answers. Please try again.
            </Alert>
          ) : studentAnswers.answers.length === 0 ? (
            <Alert severity="info">
              No answers found for this student.
            </Alert>
          ) : (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Total Score
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'medium', color: selectedStudent?.percentage < 40 ? 'error.main' : 'success.main' }}>
                        {selectedStudent?.totalScore}/{exam.totalMarks}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Percentage
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'medium', color: selectedStudent?.percentage < 40 ? 'error.main' : 'success.main' }}>
                        {selectedStudent?.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Correct/Incorrect
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                        <span style={{ color: theme.palette.success.main }}>{answerStats.correct}</span>
                        {' / '}
                        <span style={{ color: theme.palette.error.main }}>{answerStats.incorrect}</span>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 3 }}>
                Question Answers
              </Typography>
              
              {studentAnswers.answers.map((answer, index) => {
                // Find the matching question from the exam questions
                const question = exam.questions.find(q => q._id === answer.questionId);
                if (!question) return null;
                
                return (
                  <Accordion key={index} defaultExpanded={false} sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: answer.isCorrect 
                          ? alpha(theme.palette.success.main, 0.05)
                          : alpha(theme.palette.error.main, 0.05),
                        borderLeft: '4px solid',
                        borderColor: answer.isCorrect 
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StatusIndicator 
                            type={answer.isCorrect ? 'correct' : 'incorrect'} 
                            sx={{ mr: 2 }}
                          >
                            {answer.isCorrect ? (
                              <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                            ) : (
                              <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />
                            )}
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </StatusIndicator>
                          
                          <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                            Question {index + 1}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Marks: {answer.isCorrect ? question.marks : 0}/{question.marks}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ pt: 3 }}>
                      <Typography variant="body1" fontWeight={500} gutterBottom>
                        {question.questionText}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {question.options.map((option, optIndex) => (
                          <OptionBox
                            key={optIndex}
                            isSelected={answer.selectedOption === optIndex}
                            isCorrect={question.correctOption === optIndex}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </Typography>
                            
                            {answer.selectedOption === optIndex && question.correctOption !== optIndex && (
                              <CancelIcon color="error" fontSize="small" />
                            )}
                            
                            {question.correctOption === optIndex && (
                              <CheckCircleIcon color="success" fontSize="small" />
                            )}
                          </OptionBox>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnswerDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ExamResults;