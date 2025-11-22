import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Paper,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Layers as LayersIcon,
  Timeline as TimelineIcon,
  SecurityOutlined as SecurityIcon,
  EmojiEvents as TrophyIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Custom styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #3a4dc1 100%)',
  color: 'white',
  padding: '6rem 0',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundImage: 'url("/patterns/circuit-board.svg")',
    backgroundSize: 'cover',
    opacity: 0.1,
  },
  [theme.breakpoints.down('md')]: {
    padding: '4rem 0',
  },
}));

const Section = styled(Box)(({ theme }) => ({
  padding: '5rem 0',
  [theme.breakpoints.down('md')]: {
    padding: '3rem 0',
  },
}));

const TimelinePoint = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: '2rem',
  marginBottom: '3rem',
  '&:before': {
    content: '""',
    position: 'absolute',
    left: '0.5rem',
    top: '0',
    width: '1px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    left: '0',
    top: '0.5rem',
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
  },
  '&:last-child': {
    marginBottom: 0,
    '&:before': {
      display: 'none',
    }
  },
}));

const ValueCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '1rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  },
}));

const TeamMember = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '1rem',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: '0 auto 16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  border: `4px solid ${theme.palette.background.paper}`,
}));

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock team data
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      bio: 'PhD in Educational Technology with over 15 years of experience in assessment systems.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      bio: 'Former Google engineer with expertise in scalable education platforms.',
    },
    {
      name: 'Ananya Patel',
      role: 'Head of Curriculum',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      bio: 'Educational consultant who has developed assessment frameworks for top universities.',
    },
    {
      name: 'James Wilson',
      role: 'Chief Academic Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      bio: 'Former university dean with expertise in educational outcome measurement.',
    },
  ];

  // Company timeline data
  const timeline = [
    {
      year: '2018',
      title: 'Foundation',
      description: 'Assessment System was founded with a mission to revolutionize educational assessment.',
    },
    {
      year: '2020',
      title: 'Platform Launch',
      description: 'The first version of our assessment platform was launched, serving 50 educational institutions.',
    },
    {
      year: '2022',
      title: 'International Expansion',
      description: 'Expanded our services to international markets, now serving clients in over 30 countries.',
    },
    {
      year: '2025',
      title: 'Next Generation',
      description: 'Released our next-generation platform with AI-driven analytics and personalized learning paths.',
    },
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
                ABOUT US
              </Typography>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Transforming Education Through Assessment
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '90%' }}>
                Our mission is to revolutionize education by providing innovative assessment tools that empower students and educators alike.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box component="img" 
                src="https://img.freepik.com/free-vector/illustration-social-media-concept_53876-18141.jpg" 
                alt="Assessment System Vision"
                sx={{ 
                  width: '100%',
                  borderRadius: '1rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                }} 
              />
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Our Story Section */}
      <Section>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box component="img" 
                src="https://img.freepik.com/free-vector/business-team-discussing-ideas-startup_74855-4380.jpg" 
                alt="Our Story"
                sx={{ 
                  width: '100%',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Chip 
                  label="Our Story" 
                  color="primary" 
                  sx={{ mb: 2, fontWeight: 500, backgroundColor: theme.palette.primary.light }} 
                />
                <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
                  Reimagining Assessment for the Modern Era
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontSize: '1.1rem' }}>
                  Founded in 2018, Assessment System was born from a simple observation: traditional assessment methods weren't keeping pace with modern educational needs. We set out to create a platform that measures not just knowledge, but critical thinking, problem-solving abilities, and practical application.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                  Today, our platform serves thousands of students and educators worldwide, providing real-time feedback, personalized learning paths, and actionable analytics that drive better educational outcomes.
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/features" 
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: '2rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                }}
              >
                Explore Our Features
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Our Values Section */}
      <Section sx={{ bgcolor: '#f7f9fc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip 
              label="Our Values" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 500, backgroundColor: theme.palette.primary.light }} 
            />
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
              What Drives Us Forward
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary', fontSize: '1.1rem' }}>
              Our core values inform everything we do—from product development to customer service.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <SchoolIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Educational Excellence
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We believe in rigorous standards and continuous improvement to deliver the best assessment tools for educators and students.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <LayersIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Inclusive Learning
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We design our platform to accommodate diverse learning styles, abilities, and backgrounds to ensure education is accessible to all.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'warning.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <TimelineIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Data-Driven Decisions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We empower educators with meaningful insights through advanced analytics, enabling better instructional decisions.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'error.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <SecurityIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Security & Privacy
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We prioritize the protection of student data with industry-leading security practices and rigorous privacy standards.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <TrophyIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Achievement Recognition
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We celebrate student accomplishments through comprehensive performance tracking and meaningful recognition systems.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <ValueCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.light', 
                    width: 70, 
                    height: 70, 
                    margin: '0 auto 1.5rem',
                  }}>
                    <VerifiedUserIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Academic Integrity
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We uphold the highest standards of honesty and integrity while making assessment fair and accessible for all users.
                  </Typography>
                </CardContent>
              </ValueCard>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Our Journey Section */}
      <Section>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <Chip 
                label="Our Journey" 
                color="primary" 
                sx={{ mb: 2, fontWeight: 500, backgroundColor: theme.palette.primary.light }} 
              />
              <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                Milestones That Define Us
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                Our journey has been marked by continuous innovation and a relentless pursuit of educational excellence.
              </Typography>
              
              <Box>
                {timeline.map((item, index) => (
                  <TimelinePoint key={index}>
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={item.year}
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TimelinePoint>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box component="img" 
                src="https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg" 
                alt="Our Journey"
                sx={{ 
                  width: '100%',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }} 
              />
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Our Team Section */}
      <Section sx={{ bgcolor: '#f7f9fc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip 
              label="Our Team" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 500, backgroundColor: theme.palette.primary.light }} 
            />
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Meet the Minds Behind Our Mission
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary', fontSize: '1.1rem' }}>
              Our diverse team of educators, technologists, and assessment experts are united by a shared passion for educational innovation.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <TeamMember elevation={2}>
                  <LargeAvatar src={member.image} alt={member.name} />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 500 }}>
                    {member.role}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {member.bio}
                  </Typography>
                </TeamMember>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Want to Join Our Team?
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              size="large"
              component={Link}
              to="/contact" 
              sx={{ 
                px: 4,
                borderRadius: '2rem',
                fontWeight: 500,
              }}
            >
              View Career Opportunities
            </Button>
          </Box>
        </Container>
      </Section>

      {/* Call to Action Section */}
      <Box sx={{ 
        py: 8, 
        bgcolor: 'primary.main', 
        color: 'white',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Ready to Transform Your Assessment Experience?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto' }}>
              Join thousands of educators and students who are already experiencing the benefits of our platform.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              to="/contact"
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: '2rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </Container>
      </Box>
      
      <Footer 
        currentTime="2025-04-21 10:54:13"
        currentUser="VanshSharmaSDE"
      />
    </>
  );
};

export default AboutUs;