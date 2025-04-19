import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const ProjectCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const projects = [
  {
    id: 1,
    name: 'Website Redesign',
    client: 'Tech Solutions',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    status: 'In Progress',
    progress: 65,
    budget: '$25,000',
    team: [
      { name: 'John Doe', role: 'Lead Developer' },
      { name: 'Jane Smith', role: 'UI Designer' },
    ],
    priority: 'High',
  },
  {
    id: 2,
    name: 'Mobile App Development',
    client: 'Global Corp',
    startDate: '2024-03-10',
    endDate: '2024-06-30',
    status: 'Planning',
    progress: 20,
    budget: '$45,000',
    team: [
      { name: 'Mike Johnson', role: 'Project Manager' },
      { name: 'Sarah Wilson', role: 'Mobile Developer' },
    ],
    priority: 'Medium',
  },
  {
    id: 3,
    name: 'E-commerce Platform',
    client: 'Innovation Labs',
    startDate: '2024-02-15',
    endDate: '2024-05-01',
    status: 'Completed',
    progress: 100,
    budget: '$35,000',
    team: [
      { name: 'David Brown', role: 'Full Stack Developer' },
      { name: 'Lisa Chen', role: 'UX Designer' },
    ],
    priority: 'Low',
  },
  // Add more sample projects as needed
];

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setOpenDialog(true);
  };

  const handleSaveProject = () => {
    // Implement save logic
    handleCloseDialog();
  };

  const handleDeleteProject = (project) => {
    // Implement delete logic
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon color="success" />;
      case 'In Progress':
        return <WarningIcon color="warning" />;
      case 'Planning':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProject}
        >
          Add Project
        </Button>
      </Box>

      <StyledPaper>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="All Projects" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Planning" />
        </Tabs>

        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <ProjectCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.client}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Progress: {project.progress}%
                    </Typography>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <CalendarIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Timeline"
                        secondary={`${project.startDate} - ${project.endDate}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <MoneyIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Budget"
                        secondary={project.budget}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PeopleIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Team"
                        secondary={project.team.map(member => member.name).join(', ')}
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip
                      icon={getStatusIcon(project.status)}
                      label={project.status}
                      size="small"
                      color={
                        project.status === 'Completed'
                          ? 'success'
                          : project.status === 'In Progress'
                          ? 'warning'
                          : 'error'
                      }
                    />
                    <Chip
                      label={project.priority}
                      size="small"
                      color={
                        project.priority === 'High'
                          ? 'error'
                          : project.priority === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                    />
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Edit Project">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(project)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Project">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ProjectCard>
            </Grid>
          ))}
        </Grid>
      </StyledPaper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Project Name"
              fullWidth
              defaultValue={selectedProject?.name}
            />
            <TextField
              label="Client"
              fullWidth
              defaultValue={selectedProject?.client}
            />
            <TextField
              label="Start Date"
              fullWidth
              type="date"
              defaultValue={selectedProject?.startDate}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              fullWidth
              type="date"
              defaultValue={selectedProject?.endDate}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Budget"
              fullWidth
              defaultValue={selectedProject?.budget}
            />
            <TextField
              label="Status"
              fullWidth
              select
              defaultValue={selectedProject?.status}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </TextField>
            <TextField
              label="Priority"
              fullWidth
              select
              defaultValue={selectedProject?.priority}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects; 