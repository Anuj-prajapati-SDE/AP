import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const AdminFooter = () => {
  const now = new Date();
  const currentTimestamp = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const currentYear = now.getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Skillvedaa Assessment System. All rights reserved.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Designed & Developed By Vansh Vyas (SDE)
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Current Date and Time (UTC): <strong>{currentTimestamp}</strong>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminFooter;
