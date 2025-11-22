import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Paper,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Link,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { styled } from '@mui/material/styles';

// Styled components for drag and drop functionality
const UploadBox = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.light
  }
}));

const ImportStudentsPopup = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Choose File', 'Review', 'Upload'];

  // Sample template data for the Excel format
  const exampleData = [
    { name: 'John Doe', email: 'john@example.com', studentId: 'ST001', password: 'password123' },
    { name: 'Jane Smith', email: 'jane@example.com', studentId: 'ST002', password: '' },
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile) => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload an Excel or CSV file');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setActiveStep(1); // Move to Review step
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      validateFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setActiveStep(2); // Move to Upload step
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/admin/import-students`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token is stored in localStorage
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload students data');
      }
      
      setUploadResult(data);
      // Call parent callback with result
      if (onImport) {
        onImport(data);
      }
      
    } catch (error) {
      setUploadResult({
        error: error.message,
        results: {
          successful: 0,
          failed: 0,
          errors: [{error: error.message}]
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setActiveStep(0);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = "name,email,studentId,password\n";
    const rows = [
      "John Doe,john@example.com,ST001,password123",
      "Jane Smith,jane@example.com,ST002,"
    ].join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', 'student-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleClose = () => {
    if (!isUploading) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        Import Students from Excel
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <>
            {/* Guidelines Panel */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Required Excel Format</AlertTitle>
              <Typography variant="body2" mb={1}>
                Your Excel file must have the following columns:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                <li><strong>name</strong> (Required): Full name of the student</li>
                <li><strong>email</strong> (Required): Valid email address, must be unique</li>
                <li><strong>studentId</strong> (Required): Unique identifier for the student</li>
                <li><strong>password</strong> (Optional): If not provided, a random password will be generated</li>
              </Box>
            </Alert>
        
            {/* Sample Table */}
            <Typography variant="h6" gutterBottom>
              Example Format:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>name</strong></TableCell>
                    <TableCell><strong>email</strong></TableCell>
                    <TableCell><strong>studentId</strong></TableCell>
                    <TableCell><strong>password</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exampleData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.studentId}</TableCell>
                      <TableCell>{row.password || '(will be generated)'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Download Template Button */}
            <Box display="flex" justifyContent="center" mb={3}>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
            </Box>
            
            {/* Upload Box */}
            <Box
              component="label"
              htmlFor="student-excel-upload"
              sx={{ display: 'block', cursor: 'pointer' }}
            >
              <input
                id="student-excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <UploadBox
                isDragActive={isDragActive}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                elevation={0}
              >
                <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag and drop your Excel file here
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  or click to browse (max 5MB)
                </Typography>
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </UploadBox>
            </Box>
            
            {/* Notes and Warnings */}
            <Box mt={3}>
              <Alert severity="warning">
                <AlertTitle>Important Notes</AlertTitle>
                <Typography variant="body2">
                  • Duplicate emails or student IDs will be rejected<br />
                  • All emails must be valid format<br />
                  • Excel files (.xlsx, .xls) and CSV files are supported<br />
                  • Maximum file size is 5MB
                </Typography>
              </Alert>
            </Box>
          </>
        )}
        
        {activeStep === 1 && file && (
          <>
            <Box textAlign="center" mb={3}>
              <FileDownloadDoneIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6">File selected and ready for upload</Typography>
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography><strong>File name:</strong> {file.name}</Typography>
                <Typography><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</Typography>
                <Typography><strong>Type:</strong> {file.type}</Typography>
              </Box>
            </Box>
            
            <Alert severity="info">
              <AlertTitle>Ready to Import</AlertTitle>
              <Typography variant="body2">
                Click "Upload" to start importing student data. All valid records will be created
                in the system. Any errors will be reported after the upload completes.
              </Typography>
            </Alert>
          </>
        )}
        
        {activeStep === 2 && (
          <Box textAlign="center" p={3}>
            {isUploading ? (
              <>
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6">Uploading and processing data...</Typography>
                <Typography variant="body2" color="textSecondary">
                  Please wait while we import your student data
                </Typography>
              </>
            ) : uploadResult && (
              <Box>
                {uploadResult.error ? (
                  <Box textAlign="center">
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h6" color="error" gutterBottom>
                      Upload Failed
                    </Typography>
                    <Typography variant="body1" mb={3}>
                      {uploadResult.error}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <FileDownloadDoneIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Upload Complete!
                    </Typography>
                    <Typography variant="body1" mb={3}>
                      Successfully processed {uploadResult.results.total} records
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" gap={3} mb={3}>
                      <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={1} width={150}>
                        <Typography variant="h5" color="white">{uploadResult.results.successful}</Typography>
                        <Typography variant="body2" color="white">Successful</Typography>
                      </Box>
                      
                      <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={1} width={150}>
                        <Typography variant="h5" color="white">{uploadResult.results.failed}</Typography>
                        <Typography variant="body2" color="white">Failed</Typography>
                      </Box>
                    </Box>
                    
                    {uploadResult.results.errors && uploadResult.results.errors.length > 0 && (
                      <Box mt={3}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>Error Details:</Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Row</TableCell>
                                <TableCell>Error</TableCell>
                                {uploadResult.results.errors.some(e => e.email) && (
                                  <TableCell>Email</TableCell>
                                )}
                                {uploadResult.results.errors.some(e => e.studentId) && (
                                  <TableCell>Student ID</TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {uploadResult.results.errors.map((error, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{error.row || 'N/A'}</TableCell>
                                  <TableCell>{error.error}</TableCell>
                                  {uploadResult.results.errors.some(e => e.email) && (
                                    <TableCell>{error.email || ''}</TableCell>
                                  )}
                                  {uploadResult.results.errors.some(e => e.studentId) && (
                                    <TableCell>{error.studentId || ''}</TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        {activeStep === 0 && (
          <Button onClick={handleClose}>Cancel</Button>
        )}
        
        {activeStep === 1 && (
          <>
            <Button onClick={handleReset}>Back</Button>
            <Button 
              variant="contained" 
              onClick={handleUpload} 
              color="primary"
              disabled={!file}
            >
              Upload
            </Button>
          </>
        )}
        
        {activeStep === 2 && !isUploading && (
          <>
            <Button onClick={handleReset}>Import Another File</Button>
            <Button variant="contained" onClick={handleClose} color="primary">
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportStudentsPopup;