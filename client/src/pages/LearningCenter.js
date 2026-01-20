import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  School,
  Quiz,
  EmojiEvents,
  Search,
  BookmarkBorder,
  Bookmark,
  ExpandMore,
  Star,
  AccessTime,
  Person,
  CheckCircle,
  Lock,
  TrendingUp,
  Security,
  AccountBalance,
  Group
} from '@mui/icons-material';

const LearningCenter = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Courses - fetch from API
  const [courses, setCourses] = useState([]);

  const [tutorials, setTutorials] = useState([]);

  const [faqs, setFaqs] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);

    Promise.all([
      fetch('/api/learning/courses', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] })),
      fetch('/api/learning/tutorials', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] })),
      fetch('/api/learning/faqs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] }))
    ])
      .then(([coursesData, tutorialsData, faqsData]) => {
        setCourses(coursesData.data || []);
        setTutorials(tutorialsData.data || []);
        setFaqs(faqsData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load learning center data', err);
        setLoading(false);
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleBookmark = (courseId) => {
    const newBookmarks = new Set(bookmarkedCourses);
    if (newBookmarks.has(courseId)) {
      newBookmarks.delete(courseId);
    } else {
      newBookmarks.add(courseId);
    }
    setBookmarkedCourses(newBookmarks);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Beginner':
        return <School color="success" />;
      case 'Intermediate':
        return <TrendingUp color="warning" />;
      case 'Advanced':
        return <Security color="error" />;
      default:
        return <School />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Master cryptocurrency and MLM strategies with our comprehensive courses
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Courses" icon={<School />} />
          <Tab label="Tutorials" icon={<PlayArrow />} />
          <Tab label="Quizzes" icon={<Quiz />} />
          <Tab label="Certificates" icon={<EmojiEvents />} />
          <Tab label="FAQ" icon={<ExpandMore />} />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search courses, tutorials, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Courses Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <PlayArrow sx={{ fontSize: 60, color: 'primary.main' }} />
                  {course.isPremium && (
                    <Chip
                      label="Premium"
                      color="warning"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                  {course.isCompleted && (
                    <CheckCircle
                      color="success"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      icon={getCategoryIcon(course.category)}
                      label={course.category}
                      color={getCategoryColor(course.category)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleBookmark(course.id)}
                      sx={{ ml: 'auto' }}
                    >
                      {bookmarkedCourses.has(course.id) ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={course.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({course.students})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {course.duration}
                    </Typography>
                    <Person sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      {course.lessons} lessons
                    </Typography>
                  </Box>
                  {course.progress > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{course.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={course.progress} />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant={course.progress > 0 ? "outlined" : "contained"}
                    onClick={() => handleCourseClick(course)}
                  >
                    {course.isCompleted ? 'Review' : course.progress > 0 ? 'Continue' : 'Start Course'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tutorials Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {tutorials.map((tutorial) => (
            <Grid item xs={12} md={6} key={tutorial.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tutorial.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip label={tutorial.type} size="small" sx={{ mr: 1 }} />
                    <Chip
                      label={tutorial.difficulty}
                      color={getCategoryColor(tutorial.difficulty)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {tutorial.duration} • {tutorial.views} views
                    </Typography>
                    <Button variant="outlined" startIcon={<PlayArrow />}>
                      Start
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quizzes Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Your Knowledge
          </Typography>
          <Grid container spacing={3}>
            {['Crypto Basics Quiz', 'MLM Strategies Assessment', 'Investment Risk Quiz', 'Security Best Practices'].map((quiz, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {quiz}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Test your understanding with {10 + index * 5} questions
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Duration: {15 + index * 5} minutes
                      </Typography>
                      <Button variant="contained" startIcon={<Quiz />}>
                        Take Quiz
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Certificates Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Certificates
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmojiEvents color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        Blockchain Security Specialist
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Earned on December 15, 2024
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ opacity: 0.6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Lock color="disabled" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        MLM Master Strategist
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete MLM Business Strategies course
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" fullWidth disabled>
                    70% Complete
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* FAQ Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Course Detail Dialog */}
      <Dialog
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">{selectedCourse.title}</Typography>
                <Chip
                  label={selectedCourse.category}
                  color={getCategoryColor(selectedCourse.category)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedCourse.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2 }}>{selectedCourse.instructor[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{selectedCourse.instructor}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={selectedCourse.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {selectedCourse.rating} ({selectedCourse.students} students)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              <List>
                {selectedCourse.topics.map((topic, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PlayArrow />
                    </ListItemIcon>
                    <ListItemText primary={topic} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
              <Button variant="contained" startIcon={<PlayArrow />}>
                {selectedCourse.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default LearningCenter;