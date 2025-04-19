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
  StatusIndicator,
  ProgressBar,
  Flashbar
} from '@cloudscape-design/components';

interface ComplianceRequirement {
  id: string;
  name: string;
  category: string;
  jurisdiction: string;
  description: string;
  dueDate: string;
  status: 'compliant' | 'at-risk' | 'non-compliant' | 'pending-review';
  assignedTo?: string;
  lastUpdated: string;
  automationLevel: 'none' | 'partial' | 'full';
}

interface ComplianceAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  date: string;
  requirementId?: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface JurisdictionMetadata {
  id: string;
  name: string;
  code: string;
  type: 'federal' | 'state' | 'local' | 'international';
  requirements: number;
  complianceRate: number;
}

const JURISDICTIONS = [
  { label: 'Federal', value: 'federal' },
  { label: 'California', value: 'ca' },
  { label: 'New York', value: 'ny' },
  { label: 'Texas', value: 'tx' },
  { label: 'European Union', value: 'eu' }
];

const CATEGORIES = [
  { label: 'Tax', value: 'tax' },
  { label: 'Employment', value: 'employment' },
  { label: 'Data Privacy', value: 'data_privacy' },
  { label: 'Financial Reporting', value: 'financial' },
  { label: 'Environmental', value: 'environmental' }
];

const ComplianceAutomation: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionMetadata[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockRequirements: ComplianceRequirement[] = [
        {
          id: '1',
          name: 'Quarterly Tax Filing',
          category: 'tax',
          jurisdiction: 'federal',
          description: 'Federal quarterly estimated tax payments for businesses',
          dueDate: '2025-06-15',
          status: 'compliant',
          assignedTo: 'John Smith',
          lastUpdated: '2025-04-10T14:30:00Z',
          automationLevel: 'partial'
        },
        {
          id: '2',
          name: 'GDPR Compliance',
          category: 'data_privacy',
          jurisdiction: 'eu',
          description: 'General Data Protection Regulation compliance requirements',
          dueDate: 'N/A',
          status: 'at-risk',
          assignedTo: 'Jane Doe',
          lastUpdated: '2025-03-15T09:45:00Z',
          automationLevel: 'partial'
        },
        {
          id: '3',
          name: 'California Consumer Privacy Act (CCPA)',
          category: 'data_privacy',
          jurisdiction: 'ca',
          description: 'California law regulating how businesses handle personal information',
          dueDate: 'N/A',
          status: 'non-compliant',
          assignedTo: 'Jane Doe',
          lastUpdated: '2025-02-28T13:10:00Z',
          automationLevel: 'none'
        }
      ];

      const mockJurisdictions: JurisdictionMetadata[] = [
        {
          id: '1',
          name: 'Federal',
          code: 'federal',
          type: 'federal',
          requirements: 12,
          complianceRate: 92
        },
        {
          id: '2',
          name: 'California',
          code: 'ca',
          type: 'state',
          requirements: 8,
          complianceRate: 75
        },
        {
          id: '3',
          name: 'European Union',
          code: 'eu',
          type: 'international',
          requirements: 5,
          complianceRate: 80
        }
      ];

      const mockAlerts: ComplianceAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'CCPA Compliance Deadline Approaching',
          description: 'Your business needs to implement CCPA requirements within 30 days.',
          date: '2025-04-15T09:00:00Z',
          requirementId: '3',
          status: 'new'
        },
        {
          id: '2',
          type: 'error',
          title: 'GDPR Cookie Consent Overdue',
          description: 'The cookie consent implementation task is overdue.',
          date: '2025-04-16T10:30:00Z',
          requirementId: '2',
          status: 'acknowledged'
        }
      ];

      setRequirements(mockRequirements);
      setJurisdictions(mockJurisdictions);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1500);
  }, []);

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    // In a real app, this would be an API call
    // For demo purposes, we'll just update the state
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' }
          : alert
      )
    );
  };

  // Calculate compliance statistics
  const getComplianceStats = () => {
    const total = requirements.length;
    const compliant = requirements.filter(req => req.status === 'compliant').length;
    const atRisk = requirements.filter(req => req.status === 'at-risk').length;
    const nonCompliant = requirements.filter(req => req.status === 'non-compliant').length;

    return {
      total,
      compliant,
      atRisk,
      nonCompliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0
    };
  };

  // Calculate automation statistics
  const getAutomationStats = () => {
    const total = requirements.length;
    const none = requirements.filter(req => req.automationLevel === 'none').length;
    const partial = requirements.filter(req => req.automationLevel === 'partial').length;
    const full = requirements.filter(req => req.automationLevel === 'full').length;

    return {
      total,
      none,
      partial,
      full,
      automationRate: total > 0 ? ((partial * 0.5 + full) / total) * 100 : 0
    };
  };

  // Format alerts for Flashbar
  const getFormattedAlerts = () => {
    return alerts
      .filter(alert => alert.status !== 'resolved')
      .map(alert => ({
        type: alert.type as 'error' | 'warning' | 'success' | 'info',
        content: alert.title,
        statusIconAriaLabel: alert.type,
        dismissLabel: 'Dismiss alert',
        dismissible: false,
        action: alert.status === 'new' ?
          <Button onClick={() => handleAlertAction(alert.id, 'acknowledge')}>Acknowledge</Button> :
          <Button onClick={() => handleAlertAction(alert.id, 'resolve')}>Resolve</Button>,
        description: alert.description
      }));
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading compliance automation data...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Automated multi-jurisdiction regulatory compliance management"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Add Requirement</Button>
              <Button variant="primary">Run Compliance Scan</Button>
            </SpaceBetween>
          }
        >
          Regulatory Compliance Automation
        </Header>

        {/* Alerts */}
        {alerts.some(alert => alert.status !== 'resolved') && (
          <Flashbar items={getFormattedAlerts()} />
        )}

        {/* Main Tabs */}
        <Tabs
          tabs={[
            {
              id: 'dashboard',
              label: 'Compliance Dashboard',
              content: (
                <SpaceBetween size="l">
                  {/* Compliance Summary */}
                  <ColumnLayout columns={3} variant="text-grid">
                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getComplianceStats().complianceRate.toFixed(1)}%</Box>
                        <Box variant="h3">Overall Compliance Rate</Box>
                        <ProgressBar
                          value={getComplianceStats().complianceRate}
                          status={
                            getComplianceStats().complianceRate >= 90 ? 'success' :
                            getComplianceStats().complianceRate >= 70 ? 'in-progress' : 'error'
                          }
                          description={`${getComplianceStats().compliant} of ${getComplianceStats().total} requirements compliant`}
                        />
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getAutomationStats().automationRate.toFixed(1)}%</Box>
                        <Box variant="h3">Automation Level</Box>
                        <ProgressBar
                          value={getAutomationStats().automationRate}
                          status="in-progress"
                          description={`${getAutomationStats().full} fully automated, ${getAutomationStats().partial} partially automated`}
                        />
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{jurisdictions.length}</Box>
                        <Box variant="h3">Active Jurisdictions</Box>
                        <Box variant="p">{requirements.length} total requirements</Box>
                      </SpaceBetween>
                    </Box>
                  </ColumnLayout>

                  {/* Requirements Table */}
                  <Table
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'Requirement',
                        cell: item => item.name,
                        sortingField: 'name'
                      },
                      {
                        id: 'jurisdiction',
                        header: 'Jurisdiction',
                        cell: item => JURISDICTIONS.find(j => j.value === item.jurisdiction)?.label || item.jurisdiction,
                        sortingField: 'jurisdiction'
                      },
                      {
                        id: 'category',
                        header: 'Category',
                        cell: item => CATEGORIES.find(c => c.value === item.category)?.label || item.category,
                        sortingField: 'category'
                      },
                      {
                        id: 'dueDate',
                        header: 'Due Date',
                        cell: item => item.dueDate === 'N/A' ? 'N/A' : new Date(item.dueDate).toLocaleDateString(),
                        sortingField: 'dueDate'
                      },
                      {
                        id: 'status',
                        header: 'Status',
                        cell: item => (
                          <StatusIndicator type={
                            item.status === 'compliant' ? 'success' :
                            item.status === 'at-risk' ? 'warning' :
                            item.status === 'non-compliant' ? 'error' : 'pending'
                          }>
                            {item.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </StatusIndicator>
                        ),
                        sortingField: 'status'
                      },
                      {
                        id: 'actions',
                        header: 'Actions',
                        cell: item => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setSelectedRequirement(item)}>View</Button>
                            <Button variant="link">Edit</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={requirements}
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(requirements.length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(requirements.length / 10)}`
                        }}
                      />
                    }
                    loadingText="Loading requirements"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No requirements</b>
                        <Box variant="p" color="inherit">
                          No compliance requirements found.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              )
            },
            {
              id: 'requirements',
              label: 'Compliance Requirements',
              content: (
                <Box textAlign="center" padding={{ top: 'l' }}>
                  <Box variant="h3">Compliance Requirements</Box>
                  <Box variant="p">View and manage all compliance requirements across jurisdictions</Box>
                </Box>
              )
            },
            {
              id: 'automation',
              label: 'Automation Settings',
              content: (
                <Box textAlign="center" padding={{ top: 'l' }}>
                  <Box variant="h3">Compliance Automation</Box>
                  <Box variant="p">Configure automated compliance monitoring and reporting</Box>
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

export default ComplianceAutomation;
