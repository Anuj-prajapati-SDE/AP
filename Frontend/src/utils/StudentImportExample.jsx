import React, { useState } from 'react';
import { Button, Typography, Box, Snackbar, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImportStudentsPopup from './ImportStudentsPopup';

const StudentImportExample = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleImportOpen = () => {
    setIsImportOpen(true);
  };

  const handleImportClose = () => {
    setIsImportOpen(false);
  };

  const handleImportComplete = (result) => {
    // Update your student list or state here if needed
    
    // Show a success message
    setSnackbar({
      open: true,
      message: `Successfully imported ${result.results.successful} students`,
      severity: result.results.failed > 0 ? 'warning' : 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<UploadFileIcon />}
          onClick={handleImportOpen}
        >
          Import Students
        </Button>
      </Box>
            
      {/* Import Students Popup */}
      <ImportStudentsPopup 
        open={isImportOpen} 
        onClose={handleImportClose}
        onImport={handleImportComplete}
      />
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentImportExample;