import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Tooltip,
  InputBase,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Badge,
  InputAdornment,
  Pagination,
  TablePagination,
  TableSortLabel,
  useTheme,
  alpha,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Fade,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  MailOutline as MailOutlineIcon,
  Visibility as VisibilityIcon,
  LockOpen as LockOpenIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import StudentImportExample from "../utils/StudentImportExample";

// Styled components for enhanced UI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
  overflow: "hidden",
}));

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  padding: theme.spacing(3, 4),
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/patterns/circuit-board.svg")',
    backgroundSize: "cover",
    opacity: 0.05,
    pointerEvents: "none",
  },
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  fontWeight: 700,
  whiteSpace: "nowrap",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  transition: "background-color 0.2s",
}));

const StyledChip = styled(Chip)(({ theme, statuscolor = "default" }) => {
  const getColor = () => {
    switch (statuscolor) {
      case "active":
        return theme.palette.success;
      case "blocked":
        return theme.palette.error;
      default:
        return theme.palette.grey;
    }
  };

  const color = getColor();

  return {
    backgroundColor: alpha(color.main, 0.1),
    color: color.main,
    fontWeight: 600,
    borderRadius: 8,
    "& .MuiChip-icon": {
      color: "inherit",
    },
    "& .MuiChip-label": {
      padding: "0px 8px",
    },
  };
});

const StatCard = styled(Card)(({ theme, bgcolor = "primary" }) => ({
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
  background: `linear-gradient(135deg, ${theme.palette[bgcolor].light} 0%, ${theme.palette[bgcolor].main} 100%)`,
  color: theme.palette[bgcolor].contrastText,
}));

const StudentList = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [actionStudent, setActionStudent] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [viewStudentOpen, setViewStudentOpen] = useState(false);
  const [viewStudentDetails, setViewStudentDetails] = useState(null);

  // Stats for students
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
  });

  const fetchStudents = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get("/api/v1/admin/students");
      setStudents(response.data.students);

      // Calculate stats
      const activeCount = response.data.students.filter(
        (s) => !s.isBlocked
      ).length;
      const blockedCount = response.data.students.filter(
        (s) => s.isBlocked
      ).length;

      setStats({
        total: response.data.students.length,
        active: activeCount,
        blocked: blockedCount,
      });

      applyFilters(response.data.students, searchTerm, statusFilter);
      setError("");
    } catch (error) {
      setError("Failed to load students. Please try again.");
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters(students, searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

  const applyFilters = (studentList, term, status) => {
    let filtered = [...studentList];

    // Filter by status
    if (status !== "all") {
      const isBlocked = status === "blocked";
      filtered = filtered.filter((student) => student.isBlocked === isBlocked);
    }

    // Filter by search term
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(lowerTerm) ||
          student.studentId.toLowerCase().includes(lowerTerm) ||
          student.email.toLowerCase().includes(lowerTerm)
      );
    }

    // Apply sorting
    filtered = sortStudents(filtered, orderBy, order);

    setFilteredStudents(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const sortStudents = (studentArray, property, direction) => {
    return [...studentArray].sort((a, b) => {
      let valueA = a[property];
      let valueB = b[property];

      // Handle string comparison (case insensitive)
      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const handleToggleBlock = async (student) => {
    setActionStudent(student);
    setConfirmBlockOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!actionStudent) return;

    setActionInProgress(actionStudent._id);
    setConfirmBlockOpen(false);

    try {
      await axios.patch(
        `/api/v1/admin/students/${actionStudent._id}/toggle-block`
      );

      // Update student in the list
      const updatedStudents = students.map((student) =>
        student._id === actionStudent._id
          ? { ...student, isBlocked: !student.isBlocked }
          : student
      );

      setStudents(updatedStudents);

      // Update stats
      const activeCount = updatedStudents.filter((s) => !s.isBlocked).length;
      setStats({
        total: updatedStudents.length,
        active: activeCount,
        blocked: updatedStudents.length - activeCount,
      });

      // Re-apply filters
      applyFilters(updatedStudents, searchTerm, statusFilter);
    } catch (error) {
      setError(
        `Failed to ${actionStudent.isBlocked ? "unblock" : "block"
        } student. Please try again.`
      );
      console.error("Error updating student:", error);
    } finally {
      setActionInProgress(null);
      setActionStudent(null);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);

    setFilteredStudents(sortStudents(filteredStudents, property, newOrder));
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
  const handleMenuOpen = (event, student) => {
    event.stopPropagation();
    setActionStudent(student);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle student actions
  const handleViewStudent = () => {
    setViewStudentDetails(actionStudent);
    setViewStudentOpen(true);
    handleMenuClose();
  };

  const handleEditStudent = () => {
    // Navigate to edit page
    handleMenuClose();
  };

  const handleResetPassword = () => {
    setResetPasswordOpen(true);
    handleMenuClose();
  };

  const handleSendEmail = () => {
    setEmailDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteStudent = () => {
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Create name avatar
  const getNameInitials = (name) => {
    if (!name) return "S";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    if (!name) return theme.palette.primary.main;
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];

    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <AdminLayout title="Student Management">
      <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
        {/* Header section */}
        <Fade in={true} timeout={800}>
          <HeaderBox>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    Student Management
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, mb: 2, maxWidth: "600px" }}
                  >
                    Manage your students, track their progress, and control
                    their account status.
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
                    <StudentImportExample />
                  <Button
                    variant="contained"
                    color="secondary"
                    component={RouterLink}
                    to="/admin/students/create"
                    startIcon={<AddIcon />}
                    disableElevation
                    sx={{
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.common.white, 0.9),
                      },
                    }}
                  >
                    Add Student
                  </Button>
                </Box>
              </Box>
            </Box>
          </HeaderBox>
        </Fade>

        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatCard elevation={0} bgcolor="primary">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      Total Students
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </Box>

                  <Typography variant="h3" fontWeight={700}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard elevation={0} bgcolor="success">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      Active Students
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <CheckCircleIcon />
                    </Avatar>
                  </Box>

                  <Typography variant="h3" fontWeight={700}>
                    {stats.active}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard elevation={0} bgcolor="error">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      Blocked Students
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <BlockIcon />
                    </Avatar>
                  </Box>

                  <Typography variant="h3" fontWeight={700}>
                    {stats.blocked}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
        </Box>

        {/* Search and Filter Controls */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <SearchBar>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search students…"
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>

            <TextField
              select
              variant="outlined"
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Students</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              startIcon={<CloudDownloadIcon />}
              variant="outlined"
              sx={{ px: 2, py: 1, borderRadius: 2 }}
            >
              Export CSV
            </Button>

            <Tooltip title="Refresh student list">
              <IconButton
                color="primary"
                onClick={fetchStudents}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchStudents}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <StyledTableContainer component={Paper} sx={{ mb: 3 }}>
          {isRefreshing && <LinearProgress />}

          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableHeaderCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Student
                  </TableSortLabel>
                </TableHeaderCell>
                <TableHeaderCell>
                  <TableSortLabel
                    active={orderBy === "studentId"}
                    direction={orderBy === "studentId" ? order : "asc"}
                    onClick={() => handleSort("studentId")}
                  >
                    Student ID
                  </TableSortLabel>
                </TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Skeleton
                          variant="circular"
                          width={40}
                          height={40}
                          sx={{ mr: 2 }}
                        />
                        <Skeleton variant="text" width={150} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={180} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={80} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center", p: 3 }}>
                      {searchTerm || statusFilter !== "all" ? (
                        <>
                          <SearchIcon
                            sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            No students match your search
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 2 }}
                          >
                            Try adjusting your filters or search term
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                          >
                            Clear Filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <PersonIcon
                            sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            No students found
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 2 }}
                          >
                            Add new students to get started
                          </Typography>
                          <Button
                            variant="contained"
                            component={RouterLink}
                            to="/admin/students/create"
                            startIcon={<AddIcon />}
                          >
                            Add Student
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // Paginated table data
                filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <StyledTableRow key={student._id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(student.name),
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getNameInitials(student.name)}
                          </Avatar>
                          <Typography variant="body1" fontWeight={500}>
                            {student.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontWeight: 500 }}
                        >
                          {student.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MailOutlineIcon
                            sx={{
                              fontSize: 18,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2">
                            {student.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StyledChip
                          icon={
                            student.isBlocked ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleIcon fontSize="small" />
                            )
                          }
                          label={student.isBlocked ? "Blocked" : "Active"}
                          statuscolor={student.isBlocked ? "blocked" : "active"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(student.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Tooltip
                            title={
                              student.isBlocked
                                ? "Unblock Student"
                                : "Block Student"
                            }
                          >
                            <IconButton
                              color={student.isBlocked ? "success" : "error"}
                              onClick={() => handleToggleBlock(student)}
                              disabled={actionInProgress === student._id}
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  student.isBlocked
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  0.1
                                ),
                              }}
                            >
                              {actionInProgress === student._id ? (
                                <CircularProgress size={20} />
                              ) : student.isBlocked ? (
                                <LockOpenIcon fontSize="small" />
                              ) : (
                                <BlockIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More Actions">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, student)}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
              )}
            </TableBody>
          </Table>

          {!isLoading && filteredStudents.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </StyledTableContainer>

        {/* Bottom help box */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.info.main, 0.05),
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <DownloadIcon color="info" />
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Need to add multiple students?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You can import multiple students at once using our CSV
                  template.
                </Typography>
              </Box>
            </Box>
            <StudentImportExample />
          </Box>
        </Paper>
      </Container>

      {/* Student Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2, mt: 0.5 },
        }}
      >
        <MenuItem onClick={handleViewStudent}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          component={RouterLink}
          to={actionStudent ? `/admin/students/${actionStudent._id}/edit` : "#"}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Student</ListItemText>
        </MenuItem>

        {/* <MenuItem onClick={handleSendEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleResetPassword}>
          <ListItemIcon>
            <VpnKeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem> */}

        <Divider />

        <MenuItem
          onClick={handleDeleteStudent}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Student</ListItemText>
        </MenuItem>
      </Menu>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog
        open={confirmBlockOpen}
        onClose={() => setConfirmBlockOpen(false)}
        PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          {actionStudent?.isBlocked ? "Unblock Student?" : "Block Student?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionStudent?.isBlocked ? (
              <>
                Are you sure you want to <strong>unblock</strong> the student{" "}
                <strong>{actionStudent?.name}</strong>? This will restore their
                ability to access exams and other resources.
              </>
            ) : (
              <>
                Are you sure you want to <strong>block</strong> the student{" "}
                <strong>{actionStudent?.name}</strong>? This will prevent them
                from accessing any exams or other resources.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmBlockOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmBlock}
            color={actionStudent?.isBlocked ? "success" : "error"}
            variant="contained"
            startIcon={
              actionStudent?.isBlocked ? <LockOpenIcon /> : <BlockIcon />
            }
          >
            {actionStudent?.isBlocked ? "Unblock" : "Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Delete Student?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the student{" "}
            <strong>{actionStudent?.name}</strong>? This action cannot be
            undone, and will remove all their data from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Student Details Dialog */}
      <Dialog
        open={viewStudentOpen}
        onClose={() => setViewStudentOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ elevation: 24, sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          Student Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewStudentDetails && (
            <Grid container spacing={3}>
              <Grid
                item
                xs={12}
                sm={4}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: getAvatarColor(viewStudentDetails.name),
                      fontSize: "3rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {getNameInitials(viewStudentDetails.name)}
                  </Avatar>

                  <StyledChip
                    icon={
                      viewStudentDetails.isBlocked ? (
                        <BlockIcon fontSize="small" />
                      ) : (
                        <CheckCircleIcon fontSize="small" />
                      )
                    }
                    label={viewStudentDetails.isBlocked ? "Blocked" : "Active"}
                    statuscolor={
                      viewStudentDetails.isBlocked ? "blocked" : "active"
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={8}>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  {viewStudentDetails.name}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Student ID
                    </Typography>
                    <Typography
                      variant="body1"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {viewStudentDetails.studentId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {viewStudentDetails.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created On
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(viewStudentDetails.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(
                        viewStudentDetails.updatedAt ||
                        viewStudentDetails.createdAt
                      )}
                    </Typography>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    pt: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Exams Taken: {Math.floor(Math.random() * 10)}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={RouterLink}
                      to={`/admin/students/${viewStudentDetails._id}/exams`}
                      onClick={() => setViewStudentOpen(false)}
                    >
                      View Exam History
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Button onClick={() => setViewStudentOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            component={RouterLink}
            to={
              viewStudentDetails
                ? `/admin/students/${viewStudentDetails._id}/edit`
                : "#"
            }
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setViewStudentOpen(false)}
          >
            Edit Student
          </Button>
        </DialogActions>
      </Dialog>

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
          Current Date and Time (UTC): <strong>2025-04-21 15:10:55</strong>
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          User: <strong>VanshSharmaSDE</strong>
        </Typography>
      </Box> */}
    </AdminLayout>
  );
};

export default StudentList;
