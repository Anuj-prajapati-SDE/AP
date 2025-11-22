import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Divider,
  Fade,
  Avatar,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  TablePagination,
  LinearProgress,
  useTheme,
  alpha,
  InputBase,
  Skeleton,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon, 
  HelpOutline as HelpOutlineIcon,
  PeopleAlt as PeopleAltIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  FilterAlt as FilterAltIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  "& .MuiTableCell-head": {
    backgroundColor: theme.palette.background.default,
    fontWeight: 600,
    fontSize: '0.875rem',
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  fontWeight: 700,
  whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  transition: 'background-color 0.2s',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  padding: theme.spacing(3, 4),
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
  '&::before': {
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

const StyledStatusChip = styled(Chip)(({ theme, statuscolor }) => {
  const getColor = () => {
    switch (statuscolor) {
      case 'active': return theme.palette.success;
      case 'scheduled': return theme.palette.info;
      case 'completed': return theme.palette.secondary;
      case 'expired': return theme.palette.error;
      default: return theme.palette.grey;
    }
  };
  
  const color = getColor();
  
  return {
    backgroundColor: alpha(color.main, 0.1),
    color: color.main,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: 'inherit',
    },
    '& .MuiChip-label': {
      padding: '0px 8px',
    },
  };
});

// Component for displaying question count in exam details
const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderRadius: theme.shape.borderRadius,
  flex: 1,
  minWidth: '90px',
}));

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [actionExam, setActionExam] = useState(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // New state for exam details dialog
  const [examDetailsOpen, setExamDetailsOpen] = useState(false);
  const [examDetails, setExamDetails] = useState(null);
  const [loadingExamDetails, setLoadingExamDetails] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  const theme = useTheme();
  
  // Status counts for tabs
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    scheduled: 0,
    active: 0,
    completed: 0
  });

  const fetchExams = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get('/api/v1/exam');
      const examData = response.data.exams;
      
      // Sort exams: Active first, then Scheduled, then Completed
      examData.sort((a, b) => {
        const statusA = getExamStatus(a).status;
        const statusB = getExamStatus(b).status;
        
        // Custom sort order
        const order = { 'active': 0, 'scheduled': 1, 'completed': 2, 'expired': 3 };
        return order[statusA] - order[statusB] || new Date(a.startTime) - new Date(b.startTime);
      });
      
      setExams(examData);
      
      // Count exams by status
      const counts = { all: examData.length, scheduled: 0, active: 0, completed: 0 };
      examData.forEach(exam => {
        const status = getExamStatus(exam).status;
        if (status === 'scheduled') counts.scheduled++;
        else if (status === 'active') counts.active++;
        else if (status === 'completed' || status === 'expired') counts.completed++;
      });
      
      setStatusCounts(counts);
      filterExams(examData, tabValue, searchTerm);
      setError('');
    } catch (error) {
      setError('Failed to load exams. Please try again.');
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/v1/admin/students');
      setStudents(response.data.students.filter(student => !student.isBlocked));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);
  
  // Filter exams when tab or search term changes
  useEffect(() => {
    filterExams(exams, tabValue, searchTerm);
  }, [tabValue, searchTerm, exams]);
  
  const filterExams = (examList, tab, term) => {
    let filtered = [...examList];
    
    // First filter by tab/status
    if (tab !== 0) { // Not "All" tab
      const statusFilter = tab === 1 ? 'scheduled' : tab === 2 ? 'active' : 'completed';
      filtered = filtered.filter(exam => {
        const status = getExamStatus(exam).status;
        return statusFilter === 'completed' 
          ? (status === 'completed' || status === 'expired')
          : status === statusFilter;
      });
    }
    
    // Then filter by search term
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(lowerTerm) || 
        exam.description?.toLowerCase().includes(lowerTerm)
      );
    }
    
    setFilteredExams(filtered);
    setPage(0); // Reset pagination when filter changes
  };

  const handleOpenSendEmail = (exam) => {
    setSelectedExam(exam);
    setSelectedStudents([]);
    setSendEmailOpen(true);
  };

  const handleCloseSendEmail = () => {
    setSendEmailOpen(false);
    setSelectedExam(null);
    setEmailSuccess('');
  };

  const handleStudentSelectionChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((student) => student._id));
      setSelectedAll(true);
    } else {
      setSelectedStudents([]);
      setSelectedAll(false);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedExam) return;

    setIsSending(true);
    setEmailSuccess('');
    setError('');

    try {
      const response = await axios.post('/api/v1/admin/send-exam-link', {
        examId: selectedExam._id,
        studentIds: selectedStudents.length ? selectedStudents : undefined, // If empty, send to all
      });

      setEmailSuccess(`Success! Exam link sent to ${response.data.sentTo} students.`);
      setTimeout(() => {
        handleCloseSendEmail();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to send exam links');
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle filter tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle table pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle menu open/close
  const handleMenuOpen = (event, exam) => {
    event.stopPropagation();
    setActionExam(exam);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle copy exam ID
  const handleCopyExamId = () => {
    if (!actionExam) return;
    
    navigator.clipboard.writeText(actionExam._id);
    handleMenuClose();
  };
  
  // Delete exam confirmation
  const handleOpenDeleteDialog = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setDeleteSuccess(false);
  };
  
  // New function for deleting an exam
  const handleDeleteExam = async () => {
    if (!actionExam) return;
    
    setDeleteLoading(true);
    
    try {
      await axios.delete(`/api/v1/exam/${actionExam._id}/delete`);
      setDeleteSuccess(true);
      
      // Refresh the exam list after successful deletion
      setTimeout(() => {
        handleCloseDeleteDialog();
        fetchExams(); // Refresh exam list
      }, 1500);
    } catch (error) {
      setError('Failed to delete exam. Please try again.');
      console.error('Error deleting exam:', error);
      setDeleteLoading(false);
    }
  };

  // New function to open exam details dialog
  const handleViewExamDetails = async (exam) => {
    setExamDetails(null);
    setLoadingExamDetails(true);
    setExamDetailsOpen(true);
    
    try {
      // Fetch detailed exam information including questions
      const response = await axios.get(`/api/v1/exam/${exam._id}`);
      setExamDetails(response.data.exam);
    } catch (error) {
      console.error('Error fetching exam details:', error);
      setError('Failed to load exam details');
    } finally {
      setLoadingExamDetails(false);
    }
  };
  
  // Close exam details dialog
  const handleCloseExamDetails = () => {
    setExamDetailsOpen(false);
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + exam.duration);

    if (now < startTime) {
      return { 
        status: 'scheduled', 
        label: 'Scheduled',
        color: 'scheduled',
        icon: <EventAvailableIcon fontSize="small" />
      };
    } else if (now >= startTime && now <= endTime) {
      return { 
        status: 'active', 
        label: 'In Progress',
        color: 'active',
        icon: <AccessTimeIcon fontSize="small" />
      };
    } else {
      return { 
        status: 'completed', 
        label: 'Completed',
        color: 'completed',
        icon: <CheckCircleIcon fontSize="small" />
      };
    }
  };
  
  // Get formatted date with relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday or Tomorrow
      return date > now 
        ? `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Within a week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[date.getDay()]} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // More than a week ago
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <AdminLayout title="Exam Management">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Header section */}
        <Fade in={true} timeout={800}>
          <HeaderBox>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    Exam Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: '600px' }}>
                    Create, edit and manage exams. Send exam links to students and view results.
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    component={RouterLink}
                    to="/admin/exams/create"
                    startIcon={<AddIcon />}
                    disableElevation
                    sx={{ 
                      fontWeight: 600, 
                      px: 3, 
                      py: 1, 
                      borderRadius: 2,
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.9),
                      }
                    }}
                  >
                    Create New Exam
                  </Button>
                  {/* <Button
                    variant="contained"
                    color="secondary"
                    component={RouterLink}
                    to="/admin/exams/create-ai"
                    startIcon={<AddIcon />}
                    disableElevation
                    sx={{ 
                      fontWeight: 600, 
                      px: 3, 
                      py: 1, 
                      borderRadius: 2,
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.9),
                      }
                    }}
                  >
                    Create Exam by AI
                  </Button> */}
                </Box>
              </Box>
              
              {/* Status summary chips */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <StyledStatusChip 
                  icon={<EventAvailableIcon />} 
                  label={`${statusCounts.scheduled} Scheduled`}
                  statuscolor="scheduled"
                  size="small"
                  style={{backgroundColor: "white"}}
                />
                
                <StyledStatusChip 
                  icon={<AccessTimeIcon />} 
                  label={`${statusCounts.active} In Progress`}
                  statuscolor="active"
                  size="small"
                  style={{backgroundColor: "white"}}
                />
                
                <StyledStatusChip 
                  icon={<CheckCircleIcon />} 
                  label={`${statusCounts.completed} Completed`}
                  statuscolor="completed"
                  size="small"
                  style={{backgroundColor: "white"}}
                />
              </Box>
            </Box>
          </HeaderBox>
        </Fade>

        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
          {/* Search bar */}
          <SearchBar 
            sx={{ 
              maxWidth: { xs: '100%', sm: '320px' },
              backgroundColor: searchFocus ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search exams…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </SearchBar>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Refresh exam list">
              <IconButton color="primary" onClick={fetchExams} disabled={isRefreshing}>
                {isRefreshing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Filter tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="exam filter tabs"
          sx={{ 
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }
          }}
        >
          <Tab 
            label={`All Exams (${statusCounts.all})`} 
            icon={<Badge color="primary"  max={99} />}
            iconPosition="end"
          />
          <Tab 
            label={`Scheduled (${statusCounts.scheduled})`} 
            icon={<Badge color="info"  max={99} />}
            iconPosition="end"
          />
          <Tab 
            label={`In Progress (${statusCounts.active})`} 
            icon={<Badge color="error"  max={99} />}
            iconPosition="end"
          />
          <Tab 
            label={`Completed (${statusCounts.completed})`} 
            icon={<Badge color="success"  max={99} />}
            iconPosition="end"
          />
        </Tabs>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchExams}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Exams table with shadow and rounded corners */}
        <StyledTableContainer component={Paper}>
          {isRefreshing && <LinearProgress />}
          
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Exam Title</TableHeaderCell>
                <TableHeaderCell>Start Time</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Questions</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="30%" /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={90} height={24} /></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="circular" width={40} height={40} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                      {searchTerm ? (
                        <>
                          <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No exams match your search
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Try adjusting your search or filter to find what you're looking for.
                          </Typography>
                          <Button startIcon={<FilterAltIcon />} onClick={() => setSearchTerm('')} sx={{ mt: 2 }}>
                            Clear Filters
                          </Button>
                        </>
                      ) : tabValue !== 0 ? (
                        <>
                          <Box sx={{ mb: 2, opacity: 0.3 }}>
                            {tabValue === 1 ? <EventAvailableIcon sx={{ fontSize: 60 }} /> : 
                             tabValue === 2 ? <AccessTimeIcon sx={{ fontSize: 60 }} /> :
                             <CheckCircleIcon sx={{ fontSize: 60 }} />}
                          </Box>
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No {tabValue === 1 ? 'scheduled' : tabValue === 2 ? 'in-progress' : 'completed'} exams
                          </Typography>
                          <Button startIcon={<AddIcon />} component={RouterLink} to="/admin/exams/create" sx={{ mt: 2 }}>
                            Create New Exam
                          </Button>
                        </>
                      ) : (
                        <>
                          <Box sx={{ opacity: 0.3, mb: 2 }}>
                            <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
                              <path d="M56 8H8C5.8 8 4 9.8 4 12V52C4 54.2 5.8 56 8 56H56C58.2 56 60 54.2 60 52V12C60 9.8 58.2 8 56 8Z" fill="#e0e0e0"/>
                              <path d="M18 24H46M18 32H38M18 40H42" stroke="#bdbdbd" strokeWidth="2"/>
                            </svg>
                          </Box>
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No exams created yet
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Create your first exam to get started.
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />} 
                            component={RouterLink} 
                            to="/admin/exams/create"
                          >
                            Create New Exam
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // Paginated table data
                filteredExams
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((exam) => {
                    const examStatusInfo = getExamStatus(exam);
                    return (
                      <StyledTableRow key={exam._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{exam.title}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">{formatDate(exam.startTime)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.duration} min`} 
                            size="small" 
                            variant="outlined"
                            icon={<AccessTimeIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge 
                            badgeContent={exam.questions.length} 
                            color="primary" 
                            max={99}
                            sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                          >
                            <Typography>Questions</Typography>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StyledStatusChip 
                            label={examStatusInfo.label} 
                            size="small" 
                            icon={examStatusInfo.icon}
                            statuscolor={examStatusInfo.color} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="View Results">
                              <IconButton
                                component={RouterLink}
                                to={`/admin/exams/${exam._id}/results`}
                                color="primary"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <BarChartIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Send Exam Link">
                              <IconButton
                                onClick={() => handleOpenSendEmail(exam)}
                                color="info"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.info.main, 0.2),
                                  }
                                }}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Exam Details">
                              <IconButton
                                onClick={() => handleViewExamDetails(exam)}
                                color="secondary"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="More Actions">
                              <IconButton
                                color="default"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, exam)}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.grey[500], 0.2),
                                  }
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {!isLoading && filteredExams.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredExams.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </StyledTableContainer>
      

        {/* Send Email Dialog */}
        <Dialog open={sendEmailOpen} onClose={handleCloseSendEmail} maxWidth="md" fullWidth PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            pl: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" component="div">
                Send Exam Link
                {selectedExam && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {selectedExam.title}
                  </Typography>
                )}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {emailSuccess ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{ mx: 'auto', mb: 2, bgcolor: theme.palette.success.main, width: 64, height: 64 }}
                >
                  <CheckCircleIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {emailSuccess}
                </Typography>
                <CircularProgress size={24} sx={{ mt: 2 }} />
              </Box>
            ) : (
              <>
                <DialogContentText sx={{ mb: 3 }}>
                  Select students to send the exam link to. If no students are selected,
                  the link will be sent to all active students.
                </DialogContentText>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleAltIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Typography variant="subtitle1" fontWeight={600}>Student Selection</Typography>
                  </Box>
                  
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAll}
                          indeterminate={
                            selectedStudents.length > 0 &&
                            selectedStudents.length < students.length
                          }
                          onChange={handleSelectAllStudents}
                          disabled={isSending}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight={500}>
                          Select All Students ({students.length})
                        </Typography>
                      }
                    />
                  </FormGroup>
                </Box>

                <Paper variant="outlined" sx={{ maxHeight: '300px', overflow: 'auto', mb: 2, borderRadius: 2 }}>
                  {students.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No students available</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 1 }}>
                      {students.map((student) => (
                        <FormControlLabel
                          key={student._id}
                          control={
                            <Checkbox
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => handleStudentSelectionChange(student._id)}
                              disabled={isSending}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{student.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {student.studentId} • {student.email}
                              </Typography>
                            </Box>
                          }
                          sx={{ 
                            display: 'flex', 
                            py: 1,
                            px: 1,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                            width: '100%',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    {selectedStudents.length > 0 
                      ? `${selectedStudents.length} students selected` 
                      : "No students selected. Email will be sent to all active students."}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleCloseSendEmail} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmails}
              variant="contained"
              disabled={isSending || emailSuccess}
              startIcon={isSending ? <CircularProgress size={18} /> : <EmailIcon />}
              color="primary"
              sx={{ px: 3 }}
            >
              {isSending ? 'Sending...' : 'Send Exam Link'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          PaperProps={{
            elevation: 3,
            sx: { width: 200, borderRadius: 2, mt: 0.5 }
          }}
        >
          {/* <MenuItem 
            component={RouterLink}
            to={actionExam ? `/admin/exams/${actionExam._id}/edit` : '#'} 
            onClick={handleMenuClose}
            dense
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Exam</ListItemText>
          </MenuItem> */}
          
          <MenuItem onClick={handleCopyExamId} dense>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Exam ID</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleOpenDeleteDialog} dense sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Exam</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmDeleteOpen}
          onClose={handleCloseDeleteDialog}
          PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}
        >
          {deleteSuccess ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Exam deleted successfully
              </Typography>
              <Typography color="textSecondary">
                Redirecting to the exam list...
              </Typography>
              <CircularProgress size={24} sx={{ mt: 3 }} />
            </Box>
          ) : (
            <>
              <DialogTitle sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                Delete Exam?
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the exam <strong>{actionExam?.title}</strong>? 
                  This action cannot be undone, and all results will be lost.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading} autoFocus>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteExam} 
                  color="error" 
                  variant="contained"
                  startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Exam Details Dialog */}
        <Dialog 
          open={examDetailsOpen}
          onClose={handleCloseExamDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            pl: 3,
            pr: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">
                Exam Details
              </Typography>
            </Box>
            <IconButton onClick={handleCloseExamDetails} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {loadingExamDetails ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body1">Loading exam details...</Typography>
              </Box>
            ) : !examDetails ? (
              <Alert severity="error">Failed to load exam details.</Alert>
            ) : (
              <Box>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>{examDetails.title}</Typography>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    {examDetails.description}
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Exam metadata */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Exam Information
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Start Time
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {new Date(examDetails.startTime).toLocaleString()}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Duration
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {examDetails.duration} minutes
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Status
                            </Typography>
                            <StyledStatusChip 
                              label={getExamStatus(examDetails).label}
                              statuscolor={getExamStatus(examDetails).color}
                              size="small"
                              icon={getExamStatus(examDetails).icon}
                              sx={{ mt: 0.5 }}
                            />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Active Duration
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {examDetails.activeDuration} hours
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2, height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Statistics
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                          <StatItem>
                            <Typography variant="h4" fontWeight={600} color="primary">
                              {examDetails.questions.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Questions
                            </Typography>
                          </StatItem>
                          
                          <StatItem>
                            <Typography variant="h4" fontWeight={600} color="primary">
                              {examDetails.totalMarks}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total Marks
                            </Typography>
                          </StatItem>
                          
                          <StatItem>
                            <Typography variant="h4" fontWeight={600} color="primary">
                              {examDetails.studentsAttempted?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Attempts
                            </Typography>
                          </StatItem>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Questions section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuestionAnswerIcon sx={{ mr: 1 }} />
                    Questions ({examDetails.questions.length})
                  </Typography>
                  
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                    {examDetails.questions.map((question, index) => (
                      <React.Fragment key={question._id || index}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Avatar sx={{ 
                                bgcolor: theme.palette.primary.main, 
                                color: '#fff',
                                width: 32,
                                height: 32,
                                mr: 2,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {index + 1}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                                  {question.questionText}
                                </Typography>
                                
                                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                  {question.options.map((option, optIndex) => (
                                    <Grid item xs={12} sm={6} key={optIndex}>
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          p: 1.5,
                                          borderColor: question.correctOption === optIndex 
                                            ? theme.palette.success.main 
                                            : theme.palette.divider,
                                          bgcolor: question.correctOption === optIndex
                                            ? alpha(theme.palette.success.main, 0.1)
                                            : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Typography variant="body2">
                                          {String.fromCharCode(65 + optIndex)}. {option}
                                        </Typography>
                                        
                                        {question.correctOption === optIndex && (
                                          <CheckCircleIcon 
                                            sx={{ ml: 'auto', color: theme.palette.success.main, fontSize: 18 }}
                                          />
                                        )}
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Chip 
                                    label={`${question.marks} mark${question.marks !== 1 ? 's' : ''}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < examDetails.questions.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleCloseExamDetails} color="primary">
              Close
            </Button>
            {/* <Button
              component={RouterLink}
              to={examDetails ? `/admin/exams/${examDetails._id}` : '#'}
              variant="contained"
              color="primary"
              disabled={!examDetails}
              startIcon={<VisibilityIcon />}
              onClick={handleCloseExamDetails}
            >
              View Full Details
            </Button> */}
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default ExamList;