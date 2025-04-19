import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Cloudscape Design System components
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  ColumnLayout,
  Button,
  LineChart,
  AreaChart,
  Table,
  Pagination,
  TextFilter,
  Modal,
  Form,
  FormField,
  Input,
  Select,
  DatePicker,
  Alert,
  Spinner,
  Tabs,
  SegmentedControl,
  ExpandableSection,
  StatusIndicator,
  Flashbar
} from '@cloudscape-design/components';

interface CashFlowData {
  date: string;
  actual: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

interface CashFlowScenario {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  baselineChange: number;
  events: CashFlowEvent[];
  createdAt: string;
}

interface CashFlowEvent {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'investment' | 'loan';
  amount: number;
  date: string;
  probability?: number;
  recurring?: boolean;
  frequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  description?: string;
}

interface CashFlowAlert {
  id: string;
  type: 'warning' | 'critical' | 'opportunity';
  title: string;
  description: string;
  date: string;
  impact: number;
  recommendation: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface CashFlowOptimization {
  id: string;
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  status: 'suggested' | 'in-progress' | 'implemented' | 'rejected';
}

const CashFlowAI: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [scenarios, setScenarios] = useState<CashFlowScenario[]>([]);
  const [alerts, setAlerts] = useState<CashFlowAlert[]>([]);
  const [optimizations, setOptimizations] = useState<CashFlowOptimization[]>([]);
  const [activeTabId, setActiveTabId] = useState('forecast');
  const [forecastRange, setForecastRange] = useState('6months');
  const [confidenceInterval, setConfidenceInterval] = useState('90');
  const [selectedScenario, setSelectedScenario] = useState<CashFlowScenario | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    // api.get('/finance/cash-flow/forecast')
    setTimeout(() => {
      // Generate mock cash flow data
      const today = new Date();
      const mockCashFlowData: CashFlowData[] = [];

      // Past data (actual)
      for (let i = -180; i <= 0; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Create some realistic patterns with weekly, monthly variations and an overall trend
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        // Base value with upward trend
        let value = 50000 + (i * 100);

        // Add monthly pattern (higher at start/end of month)
        if (dayOfMonth <= 5 || dayOfMonth >= 25) {
          value += 10000;
        }

        // Add weekly pattern (lower on weekends)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          value *= 0.7;
        }

        // Add some randomness
        value += (Math.random() - 0.5) * 15000;

        mockCashFlowData.push({
          date: date.toISOString().split('T')[0],
          actual: Math.round(value),
          predicted: Math.round(value),
          lowerBound: Math.round(value * 0.9),
          upperBound: Math.round(value * 1.1)
        });
      }

      // Future data (predicted)
      for (let i = 1; i <= 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Create some realistic patterns with weekly, monthly variations and an overall trend
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        // Base value with upward trend
        let value = 50000 + ((i + 180) * 100);

        // Add monthly pattern (higher at start/end of month)
        if (dayOfMonth <= 5 || dayOfMonth >= 25) {
          value += 10000;
        }

        // Add weekly pattern (lower on weekends)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          value *= 0.7;
        }

        // Add some randomness (more for future dates)
        const randomFactor = 15000 * (1 + (i / 365));
        value += (Math.random() - 0.5) * randomFactor;

        // Increasing uncertainty over time
        const uncertainty = 0.1 + (i / 365) * 0.2;

        mockCashFlowData.push({
          date: date.toISOString().split('T')[0],
          actual: 0, // No actual data for future dates
          predicted: Math.round(value),
          lowerBound: Math.round(value * (1 - uncertainty)),
          upperBound: Math.round(value * (1 + uncertainty))
        });
      }

      // Mock scenarios, alerts, and optimizations would be here
      // Simplified for brevity

      setCashFlowData(mockCashFlowData);
      setLoading(false);
    }, 1500);
  }, []);

  // Filter data based on selected forecast range
  const getFilteredCashFlowData = () => {
    const today = new Date();
    let endDate = new Date(today);

    switch (forecastRange) {
      case '3months':
        endDate.setMonth(today.getMonth() + 3);
        break;
      case '6months':
        endDate.setMonth(today.getMonth() + 6);
        break;
      case '12months':
        endDate.setMonth(today.getMonth() + 12);
        break;
      default:
        endDate.setMonth(today.getMonth() + 6);
    }

    // Get data from 3 months ago to the selected end date
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);

    return cashFlowData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Prepare chart data
  const getChartData = () => {
    const filteredData = getFilteredCashFlowData();

    // Determine if we should show confidence intervals based on selection
    const showConfidenceInterval = confidenceInterval !== 'none';

    return {
      series: [
        {
          title: 'Actual Cash Flow',
          type: 'line' as const,
          data: filteredData
            .filter(item => item.actual > 0) // Only include points with actual data
            .map(item => ({
              x: item.date,
              y: item.actual
            })),
          valueFormatter: (value: number) => `$${value.toLocaleString()}`
        },
        {
          title: 'Predicted Cash Flow',
          type: 'line' as const,
          data: filteredData.map(item => ({
            x: item.date,
            y: item.predicted
          })),
          valueFormatter: (value: number) => `$${value.toLocaleString()}`
        },
        ...(showConfidenceInterval ? [
          {
            title: 'Lower Bound',
            type: 'threshold' as const,
            data: filteredData.map(item => ({
              x: item.date,
              y: item.lowerBound
            })),
            valueFormatter: (value: number) => `$${value.toLocaleString()}`
          },
          {
            title: 'Upper Bound',
            type: 'threshold' as const,
            data: filteredData.map(item => ({
              x: item.date,
              y: item.upperBound
            })),
            valueFormatter: (value: number) => `$${value.toLocaleString()}`
          }
        ] : [])
      ]
    };
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading AI-powered cash flow analysis...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="AI-powered cash flow forecasting and optimization"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Create Scenario</Button>
              <Button variant="primary">Run New Forecast</Button>
            </SpaceBetween>
          }
        >
          Cash Flow AI
        </Header>

        {/* Main Tabs */}
        <Tabs
          tabs={[
            {
              id: 'forecast',
              label: 'Cash Flow Forecast',
              content: (
                <SpaceBetween size="l">
                  {/* Controls */}
                  <Container>
                    <SpaceBetween direction="horizontal" size="xs">
                      <FormField label="Forecast Range">
                        <SegmentedControl
                          selectedId={forecastRange}
                          onChange={({ detail }) => setForecastRange(detail.selectedId)}
                          options={[
                            { id: '3months', text: '3 Months' },
                            { id: '6months', text: '6 Months' },
                            { id: '12months', text: '12 Months' }
                          ]}
                        />
                      </FormField>
                      <FormField label="Confidence Interval">
                        <SegmentedControl
                          selectedId={confidenceInterval}
                          onChange={({ detail }) => setConfidenceInterval(detail.selectedId)}
                          options={[
                            { id: 'none', text: 'None' },
                            { id: '90', text: '90%' },
                            { id: '95', text: '95%' }
                          ]}
                        />
                      </FormField>
                    </SpaceBetween>
                  </Container>

                  {/* Main Chart */}
                  <Container
                    header={
                      <Header variant="h2">
                        Cash Flow Forecast
                      </Header>
                    }
                  >
                    <LineChart
                      series={getChartData().series}
                      xDomain={getFilteredCashFlowData().map(item => item.date)}
                      yDomain={[0, Math.max(...getFilteredCashFlowData().map(item => item.upperBound)) * 1.1]}
                      i18nStrings={{
                        xTickFormatter: (value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        },
                        yTickFormatter: (value) => `$${Math.round(value / 1000)}k`
                      }}
                      ariaLabel="Cash flow forecast chart"
                      height={400}
                      hideFilter
                      hideLegend={false}
                      statusType="finished"
                      empty={
                        <Box textAlign="center" color="inherit">
                          <b>No data available</b>
                          <Box variant="p" color="inherit">
                            There is no data available
                          </Box>
                        </Box>
                      }
                      noMatch={
                        <Box textAlign="center" color="inherit">
                          <b>No matching data</b>
                          <Box variant="p" color="inherit">
                            There is no matching data to display
                          </Box>
                        </Box>
                      }
                    />
                  </Container>

                  {/* Key Metrics */}
                  <ColumnLayout columns={3} variant="text-grid">
                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">$120,500</Box>
                        <Box variant="h3">Projected Low Point</Box>
                        <Box variant="p">August 15, 2025</Box>
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">$245,000</Box>
                        <Box variant="h3">Projected High Point</Box>
                        <Box variant="p">December 1, 2025</Box>
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">92%</Box>
                        <Box variant="h3">Forecast Accuracy</Box>
                        <Box variant="p">Based on past 6 months</Box>
                      </SpaceBetween>
                    </Box>
                  </ColumnLayout>
                </SpaceBetween>
              )
            },
            {
              id: 'scenarios',
              label: 'What-If Scenarios',
              content: (
                <Box textAlign="center" padding={{ top: 'l' }}>
                  <Box variant="h3">What-If Scenario Analysis</Box>
                  <Box variant="p">Create and compare different business scenarios</Box>
                </Box>
              )
            },
            {
              id: 'optimizations',
              label: 'Cash Flow Optimizations',
              content: (
                <Box textAlign="center" padding={{ top: 'l' }}>
                  <Box variant="h3">AI-Powered Optimizations</Box>
                  <Box variant="p">Recommendations to improve your cash flow</Box>
                </Box>
              )
            }
          ]}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        />
      </SpaceBetween>
    </Container>
  );
};

export default CashFlowAI;
