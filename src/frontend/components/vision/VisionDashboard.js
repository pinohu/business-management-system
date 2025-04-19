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
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Face as FaceIcon,
  TextFields as TextIcon,
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

const VisionDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
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
      setPreviewUrl(URL.createObjectURL(file));
      setUploadDialogOpen(true);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

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
      case 0: // Object Detection
        return {
          objects: [
            { label: 'Person', confidence: 0.95, bbox: [100, 100, 200, 300] },
            { label: 'Car', confidence: 0.88, bbox: [300, 150, 400, 250] },
            { label: 'Tree', confidence: 0.92, bbox: [50, 50, 150, 200] },
          ],
          imageSize: { width: 800, height: 600 },
        };
      case 1: // Face Recognition
        return {
          faces: [
            { id: 1, name: 'John Doe', confidence: 0.98, landmarks: [] },
            { id: 2, name: 'Jane Smith', confidence: 0.95, landmarks: [] },
          ],
          emotions: [
            { faceId: 1, emotion: 'Happy', confidence: 0.85 },
            { faceId: 2, emotion: 'Neutral', confidence: 0.78 },
          ],
        };
      case 2: // Scene Understanding
        return {
          scene: 'Indoor Office',
          confidence: 0.92,
          objects: [
            { label: 'Desk', confidence: 0.88 },
            { label: 'Computer', confidence: 0.95 },
            { label: 'Chair', confidence: 0.82 },
          ],
        };
      case 3: // OCR
        return {
          text: 'Sample text extracted from image',
          confidence: 0.95,
          regions: [
            { text: 'Sample', bbox: [100, 100, 200, 150] },
            { text: 'text', bbox: [210, 100, 300, 150] },
            { text: 'extracted', bbox: [100, 160, 250, 210] },
            { text: 'from', bbox: [260, 160, 320, 210] },
            { text: 'image', bbox: [330, 160, 400, 210] },
          ],
        };
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (selectedTab) {
      case 0: // Object Detection
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Object Detection Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Detected Objects</Typography>
                    <List>
                      {results.objects.map((obj, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ImageIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={obj.label}
                            secondary={`Confidence: ${(obj.confidence * 100).toFixed(1)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Image Details</Typography>
                    <Typography variant="body1">
                      Width: {results.imageSize.width}px
                    </Typography>
                    <Typography variant="body1">
                      Height: {results.imageSize.height}px
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 1: // Face Recognition
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Face Recognition Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Recognized Faces</Typography>
                    <List>
                      {results.faces.map((face, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FaceIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={face.name}
                            secondary={`Confidence: ${(face.confidence * 100).toFixed(1)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Emotion Analysis</Typography>
                    <List>
                      {results.emotions.map((emotion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FaceIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${results.faces.find(f => f.id === emotion.faceId)?.name || 'Unknown'}`}
                            secondary={`${emotion.emotion} (${(emotion.confidence * 100).toFixed(1)}%)`}
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
      case 2: // Scene Understanding
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Scene Understanding Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Scene Classification</Typography>
                    <Typography variant="h4" color="primary">
                      {results.scene}
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
                    <Typography variant="subtitle1">Detected Objects</Typography>
                    <List>
                      {results.objects.map((obj, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ImageIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={obj.label}
                            secondary={`Confidence: ${(obj.confidence * 100).toFixed(1)}%`}
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
      case 3: // OCR
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              OCR Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">Extracted Text</Typography>
                    <Typography variant="body1" paragraph>
                      {results.text}
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
                    <Typography variant="subtitle1">Text Regions</Typography>
                    <List>
                      {results.regions.map((region, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TextIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={region.text}
                            secondary={`Position: [${region.bbox.join(', ')}]`}
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
            <Typography variant="h4">Vision Dashboard</Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mr: 2 }}
              >
                Upload Media
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
                accept="image/*,video/*"
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
              icon={<ImageIcon />}
              label="Object Detection"
              iconPosition="start"
            />
            <Tab
              icon={<FaceIcon />}
              label="Face Recognition"
              iconPosition="start"
            />
            <Tab
              icon={<ImageIcon />}
              label="Scene Understanding"
              iconPosition="start"
            />
            <Tab
              icon={<TextIcon />}
              label="OCR"
              iconPosition="start"
            />
          </Tabs>
        </Grid>

        {/* Preview Section */}
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
                  <MenuItem value="yolo">YOLOv5</MenuItem>
                  <MenuItem value="faster-rcnn">Faster R-CNN</MenuItem>
                  <MenuItem value="facenet">FaceNet</MenuItem>
                  <MenuItem value="deepface">DeepFace</MenuItem>
                  <MenuItem value="resnet">ResNet</MenuItem>
                  <MenuItem value="efficientnet">EfficientNet</MenuItem>
                  <MenuItem value="tesseract">Tesseract</MenuItem>
                  <MenuItem value="easyocr">EasyOCR</MenuItem>
                </Select>
              </FormControl>
              {previewUrl && (
                <Box sx={{ position: 'relative', width: '100%', height: 400, mb: 2 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={processingStatus === 'processing' ? <CircularProgress size={20} /> : <PlayIcon />}
                onClick={handleProcess}
                disabled={processingStatus === 'processing' || !selectedFile}
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
                Upload an image or video to see results
              </Typography>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Process Media</DialogTitle>
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

export default VisionDashboard; 