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
  Alert,
  Spinner,
  Cards,
  Link,
  StatusIndicator,
  Tabs
} from '@cloudscape-design/components';

interface BankAccount {
  id: string;
  name: string;
  institution: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  accountNumber: string; // Last 4 digits only
  balance: number;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  connectionId?: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  accountId: string;
  pending: boolean;
  imported: boolean;
}

interface BankFormData {
  institution: string;
  credentials: {
    username: string;
    password: string;
  };
}

const INSTITUTIONS = [
  { label: 'Chase', value: 'chase' },
  { label: 'Bank of America', value: 'bofa' },
  { label: 'Wells Fargo', value: 'wellsfargo' },
  { label: 'Citibank', value: 'citi' },
  { label: 'Capital One', value: 'capitalone' },
  { label: 'American Express', value: 'amex' },
  { label: 'Discover', value: 'discover' },
  { label: 'Other', value: 'other' }
];

const ACCOUNT_TYPES = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'Investment', value: 'investment' }
];

const BankIntegration: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [activeTabId, setActiveTabId] = useState('accounts');
  const [formData, setFormData] = useState<BankFormData>({
    institution: '',
    credentials: {
      username: '',
      password: ''
    }
  });

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    // api.get('/finance/bank-accounts')
    setTimeout(() => {
      const mockAccounts: BankAccount[] = [
        {
          id: '1',
          name: 'Business Checking',
          institution: 'chase',
          accountType: 'checking',
          accountNumber: '1234',
          balance: 15000,
          status: 'connected',
          lastSync: '2025-04-18T12:00:00Z',
          connectionId: 'conn_123456'
        },
        {
          id: '2',
          name: 'Business Savings',
          institution: 'chase',
          accountType: 'savings',
          accountNumber: '5678',
          balance: 50000,
          status: 'connected',
          lastSync: '2025-04-18T12:00:00Z',
          connectionId: 'conn_123456'
        },
        {
          id: '3',
          name: 'Business Credit Card',
          institution: 'amex',
          accountType: 'credit',
          accountNumber: '9012',
          balance: -2500,
          status: 'connected',
          lastSync: '2025-04-18T12:00:00Z',
          connectionId: 'conn_789012'
        }
      ];

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2025-04-18',
          description: 'Client Payment - ABC Corp',
          amount: 5000,
          category: 'Income',
          accountId: '1',
          pending: false,
          imported: true
        },
        {
          id: '2',
          date: '2025-04-17',
          description: 'Office Supplies - Staples',
          amount: -150.75,
          category: 'Office Supplies',
          accountId: '1',
          pending: false,
          imported: true
        },
        {
          id: '3',
          date: '2025-04-16',
          description: 'Software Subscription - Adobe',
          amount: -52.99,
          category: 'Software',
          accountId: '3',
          pending: false,
          imported: true
        },
        {
          id: '4',
          date: '2025-04-15',
          description: 'Client Payment - XYZ Inc',
          amount: 3500,
          category: 'Income',
          accountId: '1',
          pending: false,
          imported: false
        },
        {
          id: '5',
          date: '2025-04-14',
          description: 'Office Rent',
          amount: -2000,
          category: 'Rent',
          accountId: '1',
          pending: false,
          imported: true
        }
      ];

      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleConnectAccount = () => {
    setFormData({
      institution: '',
      credentials: {
        username: '',
        password: ''
      }
    });
    setIsConnectModalOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    if (field === 'username' || field === 'password') {
      setFormData(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitConnection = () => {
    // Validate form
    if (!formData.institution || !formData.credentials.username || !formData.credentials.password) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, this would be an API call to a service like Plaid
    // api.post('/finance/bank-connections', formData)

    // For demo purposes, we'll just add a new mock account
    const newAccount: BankAccount = {
      id: `${accounts.length + 1}`,
      name: `${INSTITUTIONS.find(i => i.value === formData.institution)?.label} Account`,
      institution: formData.institution,
      accountType: 'checking',
      accountNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      balance: Math.floor(1000 + Math.random() * 10000),
      status: 'connected',
      lastSync: new Date().toISOString(),
      connectionId: `conn_${Math.floor(100000 + Math.random() * 900000)}`
    };

    setAccounts(prev => [...prev, newAccount]);
    setIsConnectModalOpen(false);
    setError(null);
  };

  const handleSyncAccount = (account: BankAccount) => {
    // In a real app, this would be an API call
    // api.post(`/finance/bank-accounts/${account.id}/sync`)

    // For demo purposes, we'll just update the lastSync timestamp
    setAccounts(prev =>
      prev.map(a => a.id === account.id ? { ...a, lastSync: new Date().toISOString() } : a)
    );
  };

  const handleDisconnectAccount = (account: BankAccount) => {
    // In a real app, this would be an API call
    // api.delete(`/finance/bank-connections/${account.connectionId}`)

    // For demo purposes, we'll just update the status
    setAccounts(prev =>
      prev.map(a => a.id === account.id ? { ...a, status: 'disconnected' } : a)
    );
  };

  const handleImportTransaction = (transaction: Transaction) => {
    // In a real app, this would be an API call
    // api.post(`/finance/transactions/import/${transaction.id}`)

    // For demo purposes, we'll just update the imported status
    setTransactions(prev =>
      prev.map(t => t.id === transaction.id ? { ...t, imported: true } : t)
    );
  };

  const handleImportAllTransactions = () => {
    // In a real app, this would be an API call
    // api.post('/finance/transactions/import-all')

    // For demo purposes, we'll just update all transactions to imported
    setTransactions(prev =>
      prev.map(t => ({ ...t, imported: true }))
    );
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(filterText.toLowerCase()) ||
    INSTITUTIONS.find(i => i.value === account.institution)?.label.toLowerCase().includes(filterText.toLowerCase()) ||
    ACCOUNT_TYPES.find(t => t.value === account.accountType)?.label.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(filterText.toLowerCase()) ||
    (transaction.category && transaction.category.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Calculate statistics
  const totalBalance = accounts.reduce((sum, account) => {
    // Only include checking and savings in total balance
    if (account.accountType === 'checking' || account.accountType === 'savings') {
      return sum + account.balance;
    }
    return sum;
  }, 0);

  const totalDebt = accounts.reduce((sum, account) => {
    // Only include credit accounts with negative balances
    if (account.accountType === 'credit' && account.balance < 0) {
      return sum + Math.abs(account.balance);
    }
    return sum;
  }, 0);

  const pendingTransactionsCount = transactions.filter(t => t.pending).length;

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading bank accounts...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Connect your bank accounts to automatically import transactions"
          actions={
            <Button
              variant="primary"
              onClick={handleConnectAccount}
            >
              Connect Bank Account
            </Button>
          }
        >
          Bank Account Integration
        </Header>

        {/* Summary Cards */}
        <ColumnLayout columns={3} variant="text-grid">
          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalBalance.toLocaleString()}</Box>
              <Box variant="h3">Total Balance</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalDebt.toLocaleString()}</Box>
              <Box variant="h3">Total Debt</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">{pendingTransactionsCount}</Box>
              <Box variant="h3">Pending Transactions</Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>

        {/* Tabs for Accounts/Transactions */}
        <Tabs
          tabs={[
            {
              id: 'accounts',
              label: 'Connected Accounts',
              content: (
                <SpaceBetween size="l">
                  <TextFilter
                    filteringText={filterText}
                    filteringPlaceholder="Find accounts"
                    filteringAriaLabel="Filter accounts"
                    onChange={({ detail }) => setFilterText(detail.filteringText)}
                  />

                  <Cards
                    cardDefinition={{
                      header: item => (
                        <Link href="#" onFollow={e => e.preventDefault()}>
                          {item.name}
                        </Link>
                      ),
                      sections: [
                        {
                          id: 'institution',
                          header: 'Institution',
                          content: item => INSTITUTIONS.find(i => i.value === item.institution)?.label || item.institution
                        },
                        {
                          id: 'accountType',
                          header: 'Account Type',
                          content: item => ACCOUNT_TYPES.find(t => t.value === item.accountType)?.label || item.accountType
                        },
                        {
                          id: 'accountNumber',
                          header: 'Account Number',
                          content: item => `****${item.accountNumber}`
                        },
                        {
                          id: 'balance',
                          header: 'Balance',
                          content: item => `$${item.balance.toLocaleString()}`
                        },
                        {
                          id: 'status',
                          header: 'Status',
                          content: item => (
                            <StatusIndicator type={
                              item.status === 'connected' ? 'success' :
                              item.status === 'error' ? 'error' : 'warning'
                            }>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </StatusIndicator>
                          )
                        },
                        {
                          id: 'lastSync',
                          header: 'Last Synced',
                          content: item => item.lastSync ? new Date(item.lastSync).toLocaleString() : 'Never'
                        }
                      ]
                    }}
                    cardsPerRow={[
                      { cards: 1 },
                      { minWidth: 500, cards: 2 }
                    ]}
                    items={filteredAccounts}
                    loadingText="Loading accounts"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No accounts</b>
                        <Box variant="p" color="inherit">
                          No bank accounts connected. Click "Connect Bank Account" to get started.
                        </Box>
                      </Box>
                    }
                    header={
                      <Header
                        counter={`(${filteredAccounts.length})`}
                      >
                        Connected Accounts
                      </Header>
                    }
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(filteredAccounts.length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredAccounts.length / 10)}`
                        }}
                      />
                    }
                  />
                </SpaceBetween>
              )
            },
            {
              id: 'transactions',
              label: 'Bank Transactions',
              content: (
                <SpaceBetween size="l">
                  <TextFilter
                    filteringText={filterText}
                    filteringPlaceholder="Find transactions"
                    filteringAriaLabel="Filter transactions"
                    onChange={({ detail }) => setFilterText(detail.filteringText)}
                  />

                  <Button
                    onClick={handleImportAllTransactions}
                    disabled={filteredTransactions.every(t => t.imported)}
                  >
                    Import All Transactions
                  </Button>

                  <Table
                    columnDefinitions={[
                      {
                        id: 'date',
                        header: 'Date',
                        cell: item => new Date(item.date).toLocaleDateString(),
                        sortingField: 'date'
                      },
                      {
                        id: 'description',
                        header: 'Description',
                        cell: item => item.description,
                        sortingField: 'description'
                      },
                      {
                        id: 'amount',
                        header: 'Amount',
                        cell: item => (
                          <Box color={item.amount >= 0 ? 'text-status-success' : 'text-status-error'}>
                            ${Math.abs(item.amount).toLocaleString()}
                            {item.amount >= 0 ? ' (Credit)' : ' (Debit)'}
                          </Box>
                        ),
                        sortingField: 'amount'
                      },
                      {
                        id: 'category',
                        header: 'Category',
                        cell: item => item.category || 'Uncategorized',
                        sortingField: 'category'
                      },
                      {
                        id: 'account',
                        header: 'Account',
                        cell: item => {
                          const account = accounts.find(a => a.id === item.accountId);
                          return account ? account.name : 'Unknown Account';
                        },
                        sortingField: 'accountId'
                      },
                      {
                        id: 'status',
                        header: 'Status',
                        cell: item => (
                          <StatusIndicator type={item.pending ? 'in-progress' : 'success'}>
                            {item.pending ? 'Pending' : 'Cleared'}
                          </StatusIndicator>
                        )
                      },
                      {
                        id: 'actions',
                        header: 'Actions',
                        cell: item => (
                          <Button
                            onClick={() => handleImportTransaction(item)}
                            disabled={item.imported}
                          >
                            {item.imported ? 'Imported' : 'Import'}
                          </Button>
                        )
                      }
                    ]}
                    items={filteredTransactions}
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(filteredTransactions.length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredTransactions.length / 10)}`
                        }}
                      />
                    }
                    loadingText="Loading transactions"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No transactions</b>
                        <Box variant="p" color="inherit">
                          No transactions available from connected accounts.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              )
            }
          ]}
          activeTabId={activeTabId}
          onChange={({ detail }) => {
            setActiveTabId(detail.activeTabId);
            setFilterText('');
          }}
        />
      </SpaceBetween>

      {/* Connect Bank Account Modal */}
      <Modal
        visible={isConnectModalOpen}
        header={<Header variant="h2">Connect Bank Account</Header>}
        onDismiss={() => setIsConnectModalOpen(false)}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsConnectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitConnection}
              >
                Connect
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            {error && (
              <Alert type="error">
                {error}
              </Alert>
            )}

            <Alert type="info">
              In a production application, this would use a secure third-party service like Plaid to handle bank credentials securely. For this demo, no real credentials are being stored or transmitted.
            </Alert>

            <FormField
              label="Financial Institution"
              description="Select your bank or financial institution"
              constraintText="Required"
            >
              <Select
                selectedOption={INSTITUTIONS.find(i => i.value === formData.institution) || null}
                onChange={({ detail }) => handleFormChange('institution', detail.selectedOption?.value || '')}
                options={INSTITUTIONS}
                placeholder="Select an institution"
              />
            </FormField>

            <FormField
              label="Username"
              description="Enter your online banking username"
              constraintText="Required"
            >
              <Input
                value={formData.credentials.username}
                onChange={({ detail }) => handleFormChange('username', detail.value)}
                placeholder="Enter username"
              />
            </FormField>

            <FormField
              label="Password"
              description="Enter your online banking password"
              constraintText="Required"
            >
              <Input
                value={formData.credentials.password}
                onChange={({ detail }) => handleFormChange('password', detail.value)}
                placeholder="Enter password"
                type="password"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </Container>
  );
};

export default BankIntegration;
