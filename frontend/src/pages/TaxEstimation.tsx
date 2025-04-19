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
  BarChart,
  Alert,
  Spinner,
  Form,
  FormField,
  Select,
  Input
} from '@cloudscape-design/components';

interface TaxData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  taxEstimate: number;
  taxRate: string;
  quarterlyBreakdown: Array<{
    quarter: string;
    income: number;
    expenses: number;
    tax: number;
  }>;
}

const TaxEstimation: React.FC = () => {
  const { user } = useAuth();
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedFilingStatus, setSelectedFilingStatus] = useState('single');

  const filingStatusOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Married Filing Jointly', value: 'married_joint' },
    { label: 'Married Filing Separately', value: 'married_separate' },
    { label: 'Head of Household', value: 'head_household' }
  ];

  const yearOptions = [
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' }
  ];

  useEffect(() => {
    fetchTaxData();
  }, [selectedYear, selectedFilingStatus]);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get(`/api/v1/finance/tax-estimate?year=${selectedYear}&filingStatus=${selectedFilingStatus}`);
      // setTaxData(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setTaxData({
          totalIncome: 60000,
          totalExpenses: 15000,
          netIncome: 45000,
          taxEstimate: 9000,
          taxRate: '20%',
          quarterlyBreakdown: [
            { quarter: 'Q1', income: 15000, expenses: 3750, tax: 2250 },
            { quarter: 'Q2', income: 15000, expenses: 3750, tax: 2250 },
            { quarter: 'Q3', income: 15000, expenses: 3750, tax: 2250 },
            { quarter: 'Q4', income: 15000, expenses: 3750, tax: 2250 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load tax estimation data');
      setLoading(false);
      console.error(err);
    }
  };

  const recalculateTaxes = () => {
    fetchTaxData();
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading tax estimation data...
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    );
  }

  if (!taxData) {
    return (
      <Alert type="warning">
        No tax estimation data available
      </Alert>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Estimate your taxes based on your income and expenses"
          actions={
            <Button
              variant="primary"
              onClick={recalculateTaxes}
            >
              Recalculate
            </Button>
          }
        >
          Tax Estimation
        </Header>

        <Form>
          <SpaceBetween direction="horizontal" size="l">
            <FormField label="Tax Year">
              <Select
                selectedOption={{ label: selectedYear, value: selectedYear }}
                onChange={({ detail }) => setSelectedYear(detail.selectedOption.value)}
                options={yearOptions}
              />
            </FormField>
            <FormField label="Filing Status">
              <Select
                selectedOption={
                  filingStatusOptions.find(option => option.value === selectedFilingStatus) || filingStatusOptions[0]
                }
                onChange={({ detail }) => setSelectedFilingStatus(detail.selectedOption.value)}
                options={filingStatusOptions}
              />
            </FormField>
          </SpaceBetween>
        </Form>

        {/* Summary Cards */}
        <ColumnLayout columns={4} variant="text-grid">
          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
            borderRadius="default"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${taxData.totalIncome.toLocaleString()}</Box>
              <Box variant="h3">Total Income</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
            borderRadius="default"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${taxData.totalExpenses.toLocaleString()}</Box>
              <Box variant="h3">Total Expenses</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
            borderRadius="default"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${taxData.netIncome.toLocaleString()}</Box>
              <Box variant="h3">Net Income</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
            borderRadius="default"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${taxData.taxEstimate.toLocaleString()} ({taxData.taxRate})</Box>
              <Box variant="h3">Estimated Tax</Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>

        {/* Quarterly Breakdown Chart */}
        <Container
          header={
            <Header variant="h2">Quarterly Breakdown</Header>
          }
        >
          <BarChart
            series={[
              {
                title: 'Income',
                type: 'bar',
                data: taxData.quarterlyBreakdown.map(item => ({ x: item.quarter, y: item.income })),
                valueFormatter: e => `$${e.toLocaleString()}`
              },
              {
                title: 'Expenses',
                type: 'bar',
                data: taxData.quarterlyBreakdown.map(item => ({ x: item.quarter, y: item.expenses })),
                valueFormatter: e => `$${e.toLocaleString()}`
              },
              {
                title: 'Tax',
                type: 'bar',
                data: taxData.quarterlyBreakdown.map(item => ({ x: item.quarter, y: item.tax })),
                valueFormatter: e => `$${e.toLocaleString()}`
              }
            ]}
            xDomain={taxData.quarterlyBreakdown.map(item => item.quarter)}
            yDomain={[0, Math.max(...taxData.quarterlyBreakdown.map(item => item.income)) * 1.2]}
            i18nStrings={{
              xTickFormatter: e => e,
              yTickFormatter: e => `$${e.toLocaleString()}`
            }}
            ariaLabel="Quarterly Tax Breakdown"
            height={300}
            hideFilter
            hideLegend={false}
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

        <Box>
          <Alert type="info">
            <b>Tax Disclaimer:</b> This tax estimation is for informational purposes only and should not be considered as tax advice.
            Please consult with a qualified tax professional for accurate tax planning and filing.
          </Alert>
        </Box>
      </SpaceBetween>
    </Container>
  );
};

export default TaxEstimation;
