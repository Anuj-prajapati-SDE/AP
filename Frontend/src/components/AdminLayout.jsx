import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Breadcrumbs,
  Link,
  useMediaQuery,
  Badge,
  Fade,
  Paper,
  InputBase,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Assignment,
  BarChart,
  ExitToApp,
  Dashboard,
  School,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import AdminFooter from './AdminFooter';

const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState(title);

  // Auto-close drawer when switching to desktop view
  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
    }
  }, [isDesktop]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login/admin');
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
    },
    {
      text: 'Students',
      icon: <School />,
      path: '/admin/students',
    },
    {
      text: 'Exams',
      icon: <Assignment />,
      path: '/admin/exams',
    },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);

    if (pathSegments.length <= 1) return null;

    const breadcrumbs = [
      <Link
        underline="hover"
        key="home"
        color="inherit"
        component={RouterLink}
        to="/admin"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Admin
      </Link>
    ];

    let currentPath = "";

    pathSegments.slice(1).forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.slice(1).length - 1;

      breadcrumbs.push(
        isLast ? (
          <Typography key={segment} color="text.primary" sx={{ textTransform: 'capitalize' }}>
            {segment}
          </Typography>
        ) : (
          <Link
            underline="hover"
            key={segment}
            color="inherit"
            component={RouterLink}
            to={`/admin${currentPath}`}
            sx={{ textTransform: 'capitalize' }}
          >
            {segment}
          </Link>
        )
      );
    });

    return (
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 1 }}>
        {breadcrumbs}
      </Breadcrumbs>
    );
  };

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
        color: 'white'
      }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          Skillvedaa Assessment 
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                    bgcolor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? theme.palette.primary.main : 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Chip
          avatar={<Avatar alt={user?.name || 'Admin'} />}
          label={`${user?.name || 'Admin'} | Admin`}
          variant="outlined"
          sx={{ width: '100%', justifyContent: 'flex-start' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/admin"
              sx={{
                mr: 3,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Skillvedaa Assessment 
            </Typography>

            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      mx: 0.5,
                      my: 1,
                      color: 'white',
                      display: 'flex',
                      borderRadius: 1,
                      position: 'relative',
                      fontWeight: isActive ? 500 : 400,
                      '&::after': isActive ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 8,
                        right: 8,
                        height: 3,
                        bgcolor: 'white',
                        borderRadius: '3px 3px 0 0',
                      } : {}
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0, ml: 1 }}>
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.name || 'Admin'}
                    sx={{
                      width: 40,
                      height: 40,
                      border: '2px solid white'
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                TransitionComponent={Fade}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {/* {user?.name || 'Admin'} */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrator
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderRadius: 0
          }}
        >
          <Container maxWidth={false} sx={{ pt: 3, pb: 2 }}>
            {getBreadcrumbs()}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="medium"
              >
                {title}
              </Typography>
            </Box>
          </Container>
        </Paper>

        <Container maxWidth={false} sx={{ pb: 4, flexGrow: 1 }}>
          {children}
        </Container>

        <AdminFooter />
      </Box>
    </Box>
  );
};

export default AdminLayout;