import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TextFields as TextIcon,
  Code as CodeIcon,
  RecordVoiceOver as SpeechIcon,
  Psychology as AIIcon,
  Upload as UploadIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  AutoGraph as GraphIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AIDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef(null);

  // Mock data for performance metrics
  const performanceData = [
    { name: 'Jan', accuracy: 85, latency: 120 },
    { name: 'Feb', accuracy: 87, latency: 115 },
    { name: 'Mar', accuracy: 89, latency: 110 },
    { name: 'Apr', accuracy: 88, latency: 108 },
    { name: 'May', accuracy: 91, latency: 105 },
    { name: 'Jun', accuracy: 92, latency: 100 },
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile && !inputText) return;

    setProcessingStatus('processing');
    try {
      // Process based on selected tab and model
      const result = await processInput(selectedTab, selectedModel);
      setResults(result);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setProcessingStatus('idle');
    }
  };

  const processInput = async (tabIndex, model) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock results based on tab
    switch (tabIndex) {
      case 0: // Text Processing
        return {
          classification: 'Positive',
          confidence: 0.92,
          entities: [
            { text: 'John Doe', type: 'PERSON', confidence: 0.95 },
            { text: 'New York', type: 'LOCATION', confidence: 0.98 },
          ],
          sentiment: {
            score: 0.85,
            label: 'Positive',
          },
        };
      case 1: // Code Intelligence
        return {
          analysis: {
            complexity: 'Medium',
            maintainability: 'Good',
            security: 'High',
          },
          suggestions: [
            'Consider adding error handling',
            'Optimize database queries',
            'Add input validation',
          ],
          completion: 'function processData(data) {',
        };
      case 2: // Speech Processing
        return {
          transcription: 'This is a sample transcription of the audio file.',
          confidence: 0.95,
          segments: [
            { start: 0, end: 2, text: 'This is' },
            { start: 2, end: 4, text: 'a sample' },
            { start: 4, end: 6, text: 'transcription' },
          ],
        };
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (selectedTab) {
      case 0: // Text Processing
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Text Analysis Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Classification</Typography>
                    <Typography variant="h4" color="primary">
                      {results.classification}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Confidence: {(results.confidence * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Sentiment Analysis</Typography>
                    <Typography variant="h4" color={results.sentiment.score > 0 ? 'success' : 'error'}>
                      {results.sentiment.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Score: {results.sentiment.score.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Named Entities</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {results.entities.map((entity, index) => (
                        <Chip
                          key={index}
                          label={`${entity.text} (${entity.type})`}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 1: // Code Intelligence
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Code Analysis Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Complexity</Typography>
                    <Typography variant="h4" color="primary">
                      {results.analysis.complexity}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Maintainability</Typography>
                    <Typography variant="h4" color="success">
                      {results.analysis.maintainability}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Security</Typography>
                    <Typography variant="h4" color="warning">
                      {results.analysis.security}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Suggestions</Typography>
                    <List>
                      {results.suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CodeIcon />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 2: // Speech Processing
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Speech Processing Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Transcription</Typography>
                    <Typography variant="body1" paragraph>
                      {results.transcription}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Confidence: {(results.confidence * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Segments</Typography>
                    <List>
                      {results.segments.map((segment, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <SpeechIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={segment.text}
                            secondary={`${segment.start}s - ${segment.end}s`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">AI Dashboard</Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mr: 2 }}
              >
                Upload File
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
              >
                Settings
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="text/*,audio/*"
                onChange={handleFileUpload}
              />
            </Box>
          </Box>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab
              icon={<TextIcon />}
              label="Text Processing"
              iconPosition="start"
            />
            <Tab
              icon={<CodeIcon />}
              label="Code Intelligence"
              iconPosition="start"
            />
            <Tab
              icon={<SpeechIcon />}
              label="Speech Processing"
              iconPosition="start"
            />
          </Tabs>
        </Grid>

        {/* Input Section */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Model</InputLabel>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  label="Select Model"
                >
                  <MenuItem value="bert">BERT</MenuItem>
                  <MenuItem value="roberta">RoBERTa</MenuItem>
                  <MenuItem value="gpt2">GPT-2</MenuItem>
                  <MenuItem value="codebert">CodeBERT</MenuItem>
                  <MenuItem value="whisper">Whisper</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Input Text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to process..."
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={processingStatus === 'processing' ? <CircularProgress size={20} /> : <PlayIcon />}
                onClick={handleProcess}
                disabled={processingStatus === 'processing' || (!selectedFile && !inputText)}
              >
                Process
              </Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Model Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#8884d8"
                    name="Accuracy (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#82ca9d"
                    name="Latency (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12}>
          <StyledPaper>
            {results ? (
              renderResults()
            ) : (
              <Typography color="textSecondary" align="center">
                Process text or upload a file to see results
              </Typography>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Process File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selected file: {selectedFile?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Choose processing options and click Process to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleProcess}
            disabled={processingStatus === 'processing'}
          >
            Process
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIDashboard; 