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
  LineChart,
  BarChart,
  PieChart,
  StatusIndicator,
  ProgressBar,
  Toggle,
  Slider
} from '@cloudscape-design/components';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  costPrice: number;
  margin: number;
  elasticity: number;
  minPrice: number;
  maxPrice: number;
  lastUpdated: string;
  optimizationEnabled: boolean;
}

interface PricingRule {
  id: string;
  name: string;
  productId: string;
  type: 'time-based' | 'inventory-based' | 'competitor-based' | 'demand-based' | 'customer-based';
  condition: string;
  adjustment: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  priority: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'scheduled';
}

interface PricingRecommendation {
  id: string;
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  potentialRevenue: number;
  confidence: number;
  factors: string[];
  date: string;
  status: 'pending' | 'applied' | 'rejected';
}

interface PricingHistory {
  date: string;
  price: number;
  sales: number;
  revenue: number;
}

const PRODUCT_CATEGORIES = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Home & Kitchen', value: 'home' },
  { label: 'Books', value: 'books' },
  { label: 'Services', value: 'services' }
];

const RULE_TYPES = [
  { label: 'Time-Based', value: 'time-based' },
  { label: 'Inventory-Based', value: 'inventory-based' },
  { label: 'Competitor-Based', value: 'competitor-based' },
  { label: 'Demand-Based', value: 'demand-based' },
  { label: 'Customer-Based', value: 'customer-based' }
];

const DynamicPricing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [pricingHistory, setPricingHistory] = useState<PricingHistory[]>([]);
  const [optimizationLevel, setOptimizationLevel] = useState(50);

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          category: 'electronics',
          basePrice: 199.99,
          currentPrice: 179.99,
          costPrice: 89.99,
          margin: 50,
          elasticity: 1.2,
          minPrice: 149.99,
          maxPrice: 249.99,
          lastUpdated: '2025-04-15T10:30:00Z',
          optimizationEnabled: true
        },
        {
          id: '2',
          name: 'Smart Home Hub',
          category: 'electronics',
          basePrice: 129.99,
          currentPrice: 119.99,
          costPrice: 65.00,
          margin: 45.8,
          elasticity: 0.8,
          minPrice: 99.99,
          maxPrice: 149.99,
          lastUpdated: '2025-04-10T14:15:00Z',
          optimizationEnabled: true
        },
        {
          id: '3',
          name: 'Business Consulting (Hourly)',
          category: 'services',
          basePrice: 150.00,
          currentPrice: 175.00,
          costPrice: 75.00,
          margin: 57.1,
          elasticity: 0.5,
          minPrice: 125.00,
          maxPrice: 200.00,
          lastUpdated: '2025-04-12T09:45:00Z',
          optimizationEnabled: false
        }
      ];

      const mockRules: PricingRule[] = [
        {
          id: '1',
          name: 'Weekend Discount',
          productId: '1',
          type: 'time-based',
          condition: 'day_of_week in [5, 6]', // Friday and Saturday
          adjustment: {
            type: 'percentage',
            value: -10
          },
          priority: 1,
          startDate: '2025-04-01',
          endDate: '2025-12-31',
          status: 'active'
        },
        {
          id: '2',
          name: 'Competitor Price Match',
          productId: '1',
          type: 'competitor-based',
          condition: 'competitor_price < current_price',
          adjustment: {
            type: 'percentage',
            value: -5
          },
          priority: 2,
          status: 'active'
        },
        {
          id: '3',
          name: 'High Demand Surge',
          productId: '2',
          type: 'demand-based',
          condition: 'demand_score > 8',
          adjustment: {
            type: 'percentage',
            value: 5
          },
          priority: 1,
          status: 'active'
        }
      ];

      const mockRecommendations: PricingRecommendation[] = [
        {
          id: '1',
          productId: '1',
          currentPrice: 179.99,
          recommendedPrice: 189.99,
          potentialRevenue: 2500,
          confidence: 85,
          factors: ['Competitor prices increased', 'High demand in market', 'Positive price elasticity'],
          date: '2025-04-18T08:00:00Z',
          status: 'pending'
        },
        {
          id: '2',
          productId: '2',
          currentPrice: 119.99,
          recommendedPrice: 109.99,
          potentialRevenue: 1800,
          confidence: 75,
          factors: ['New competitor entered market', 'Seasonal demand decrease'],
          date: '2025-04-17T14:30:00Z',
          status: 'applied'
        }
      ];

      // Generate mock pricing history data
      const today = new Date();
      const mockPricingHistory: PricingHistory[] = [];

      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Base price with some fluctuation
        const basePrice = 179.99;
        const priceVariation = Math.sin(i / 5) * 15;
        const price = basePrice + priceVariation;

        // Sales inversely related to price (higher price, lower sales)
        const baseSales = 50;
        const salesVariation = -priceVariation * 0.8;
        const sales = Math.max(5, Math.round(baseSales + salesVariation));

        mockPricingHistory.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
          sales: sales,
          revenue: parseFloat((price * sales).toFixed(2))
        });
      }

      setProducts(mockProducts);
      setRules(mockRules);
      setRecommendations(mockRecommendations);
      setPricingHistory(mockPricingHistory);
      setLoading(false);
    }, 1500);
  }, []);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setIsRuleModalOpen(true);
  };

  const handleApplyRecommendation = (recommendation: PricingRecommendation) => {
    // In a real app, this would be an API call
    // api.post(`/pricing/recommendations/${recommendation.id}/apply`)

    // For demo purposes, we'll just update the state
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === recommendation.id ? { ...rec, status: 'applied' } : rec
      )
    );

    // Update the product price
    setProducts(prev =>
      prev.map(product =>
        product.id === recommendation.productId
          ? { ...product, currentPrice: recommendation.recommendedPrice, lastUpdated: new Date().toISOString() }
          : product
      )
    );
  };

  const handleRejectRecommendation = (recommendation: PricingRecommendation) => {
    // In a real app, this would be an API call
    // api.post(`/pricing/recommendations/${recommendation.id}/reject`)

    // For demo purposes, we'll just update the state
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === recommendation.id ? { ...rec, status: 'rejected' } : rec
      )
    );
  };

  const handleToggleOptimization = (productId: string, enabled: boolean) => {
    // In a real app, this would be an API call
    // api.patch(`/pricing/products/${productId}`, { optimizationEnabled: enabled })

    // For demo purposes, we'll just update the state
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, optimizationEnabled: enabled } : product
      )
    );
  };

  const handleOptimizationLevelChange = (value: number) => {
    setOptimizationLevel(value);
  };

  const runPriceOptimization = () => {
    // In a real app, this would be an API call
    // api.post('/pricing/optimize', { level: optimizationLevel })

    // For demo purposes, we'll just show a success message
    setError('Price optimization initiated. New recommendations will be available shortly.');
    setTimeout(() => setError(null), 3000);
  };

  // Filter products based on text filter
  const getFilteredProducts = () => {
    return products.filter(product =>
      product.name.toLowerCase().includes(filterText.toLowerCase()) ||
      product.category.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  // Get pricing history chart data
  const getPricingHistoryChartData = () => {
    return {
      series: [
        {
          title: 'Price',
          type: 'line' as const,
          data: pricingHistory.map(item => ({
            x: item.date,
            y: item.price
          })),
          valueFormatter: (value: number) => `$${value.toFixed(2)}`
        },
        {
          title: 'Sales',
          type: 'bar' as const,
          data: pricingHistory.map(item => ({
            x: item.date,
            y: item.sales
          })),
          valueFormatter: (value: number) => value.toString()
        },
        {
          title: 'Revenue',
          type: 'line' as const,
          data: pricingHistory.map(item => ({
            x: item.date,
            y: item.revenue
          })),
          valueFormatter: (value: number) => `$${value.toFixed(2)}`
        }
      ]
    };
  };

  // Calculate pricing statistics
  const getPricingStats = () => {
    const totalProducts = products.length;
    const optimizedProducts = products.filter(product => product.optimizationEnabled).length;
    const averageMargin = products.reduce((sum, product) => sum + product.margin, 0) / totalProducts;
    const pendingRecommendations = recommendations.filter(rec => rec.status === 'pending').length;

    return {
      totalProducts,
      optimizedProducts,
      averageMargin,
      pendingRecommendations
    };
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading dynamic pricing data...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="AI-driven price optimization and revenue management"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleCreateProduct}>Add Product</Button>
              <Button variant="primary" onClick={runPriceOptimization}>Run Price Optimization</Button>
            </SpaceBetween>
          }
        >
          Dynamic Pricing & Revenue Optimization
        </Header>

        {/* Error/Success Messages */}
        {error && (
          <Alert dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs
          tabs={[
            {
              id: 'dashboard',
              label: 'Pricing Dashboard',
              content: (
                <SpaceBetween size="l">
                  {/* Pricing Summary */}
                  <ColumnLayout columns={4} variant="text-grid">
                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getPricingStats().totalProducts}</Box>
                        <Box variant="h3">Total Products</Box>
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getPricingStats().optimizedProducts}</Box>
                        <Box variant="h3">AI-Optimized Products</Box>
                        <ProgressBar
                          value={(getPricingStats().optimizedProducts / getPricingStats().totalProducts) * 100}
                          status="in-progress"
                          description={`${((getPricingStats().optimizedProducts / getPricingStats().totalProducts) * 100).toFixed(0)}% of products`}
                        />
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getPricingStats().averageMargin.toFixed(1)}%</Box>
                        <Box variant="h3">Average Margin</Box>
                      </SpaceBetween>
                    </Box>

                    <Box
                      padding="l"
                      variant="awsui-key-label"
                      textAlign="center"
                    >
                      <SpaceBetween size="s">
                        <Box variant="h2">{getPricingStats().pendingRecommendations}</Box>
                        <Box variant="h3">Pending Recommendations</Box>
                      </SpaceBetween>
                    </Box>
                  </ColumnLayout>

                  {/* Optimization Level */}
                  <Container
                    header={
                      <Header variant="h2">
                        AI Optimization Level
                      </Header>
                    }
                  >
                    <SpaceBetween size="m">
                      <Box variant="p">
                        Adjust the AI optimization level to balance between revenue maximization and market share growth.
                        Higher values prioritize short-term revenue, while lower values focus on long-term market share.
                      </Box>
                      <Slider
                        value={optimizationLevel}
                        onChange={({ detail }) => handleOptimizationLevelChange(detail.value)}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <Box textAlign="center">
                        <SpaceBetween direction="horizontal" size="xxl">
                          <Box>Market Share</Box>
                          <Box>Balanced</Box>
                          <Box>Revenue</Box>
                        </SpaceBetween>
                      </Box>
                    </SpaceBetween>
                  </Container>

                  {/* Price vs. Sales Chart */}
                  <Container
                    header={
                      <Header variant="h2">
                        Price vs. Sales Analysis
                      </Header>
                    }
                  >
                    <LineChart
                      series={getPricingHistoryChartData().series.filter(series => series.type === 'line')}
                      xDomain={pricingHistory.map(item => item.date)}
                      yDomain={[0, Math.max(
                        ...pricingHistory.map(item => item.price * 1.2),
                        ...pricingHistory.map(item => item.sales * 5),
                        ...pricingHistory.map(item => item.revenue / 10)
                      )]}
                      i18nStrings={{
                        xTickFormatter: (value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        },
                        yTickFormatter: (value) => value.toString()
                      }}
                      ariaLabel="Price vs. Sales Analysis"
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

                  {/* Price Recommendations */}
                  <Container
                    header={
                      <Header variant="h2">
                        AI Price Recommendations
                      </Header>
                    }
                  >
                    <Table
                      columnDefinitions={[
                        {
                          id: 'product',
                          header: 'Product',
                          cell: item => {
                            const product = products.find(p => p.id === item.productId);
                            return product ? product.name : 'Unknown Product';
                          },
                          sortingField: 'productId'
                        },
                        {
                          id: 'currentPrice',
                          header: 'Current Price',
                          cell: item => `$${item.currentPrice.toFixed(2)}`,
                          sortingField: 'currentPrice'
                        },
                        {
                          id: 'recommendedPrice',
                          header: 'Recommended Price',
                          cell: item => `$${item.recommendedPrice.toFixed(2)}`,
                          sortingField: 'recommendedPrice'
                        },
                        {
                          id: 'change',
                          header: 'Change',
                          cell: item => {
                            const change = ((item.recommendedPrice - item.currentPrice) / item.currentPrice) * 100;
                            return (
                              <Box color={change >= 0 ? 'text-status-success' : 'text-status-error'}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </Box>
                            );
                          }
                        },
                        {
                          id: 'potentialRevenue',
                          header: 'Potential Revenue',
                          cell: item => `$${item.potentialRevenue.toLocaleString()}`,
                          sortingField: 'potentialRevenue'
                        },
                        {
                          id: 'confidence',
                          header: 'Confidence',
                          cell: item => (
                            <ProgressBar
                              value={item.confidence}
                              status={
                                item.confidence >= 80 ? 'success' :
                                item.confidence >= 60 ? 'in-progress' : 'error'
                              }
                              description={`${item.confidence}%`}
                            />
                          ),
                          sortingField: 'confidence'
                        },
                        {
                          id: 'status',
                          header: 'Status',
                          cell: item => (
                            <StatusIndicator type={
                              item.status === 'applied' ? 'success' :
                              item.status === 'rejected' ? 'error' : 'pending'
                            }>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </StatusIndicator>
                          ),
                          sortingField: 'status'
                        },
                        {
                          id: 'actions',
                          header: 'Actions',
                          cell: item => item.status === 'pending' ? (
                            <SpaceBetween direction="horizontal" size="xs">
                              <Button onClick={() => handleApplyRecommendation(item)}>Apply</Button>
                              <Button variant="link" onClick={() => handleRejectRecommendation(item)}>Reject</Button>
                            </SpaceBetween>
                          ) : null
                        }
                      ]}
                      items={recommendations}
                      loadingText="Loading recommendations"
                      empty={
                        <Box textAlign="center" color="inherit">
                          <b>No recommendations</b>
                          <Box variant="p" color="inherit">
                            No price recommendations available. Run price optimization to generate recommendations.
                          </Box>
                        </Box>
                      }
                    />
                  </Container>
                </SpaceBetween>
              )
            },
            {
              id: 'products',
              label: 'Products',
              content: (
                <SpaceBetween size="l">
                  <TextFilter
                    filteringText={filterText}
                    filteringPlaceholder="Find products"
                    filteringAriaLabel="Filter products"
                    onChange={({ detail }) => setFilterText(detail.filteringText)}
                  />

                  <Table
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'Product Name',
                        cell: item => item.name,
                        sortingField: 'name'
                      },
                      {
                        id: 'category',
                        header: 'Category',
                        cell: item => PRODUCT_CATEGORIES.find(c => c.value === item.category)?.label || item.category,
                        sortingField: 'category'
                      },
                      {
                        id: 'basePrice',
                        header: 'Base Price',
                        cell: item => `$${item.basePrice.toFixed(2)}`,
                        sortingField: 'basePrice'
                      },
                      {
                        id: 'currentPrice',
                        header: 'Current Price',
                        cell: item => `$${item.currentPrice.toFixed(2)}`,
                        sortingField: 'currentPrice'
                      },
                      {
                        id: 'margin',
                        header: 'Margin',
                        cell: item => `${item.margin.toFixed(1)}%`,
                        sortingField: 'margin'
                      },
                      {
                        id: 'elasticity',
                        header: 'Price Elasticity',
                        cell: item => item.elasticity.toFixed(1),
                        sortingField: 'elasticity'
                      },
                      {
                        id: 'optimization',
                        header: 'AI Optimization',
                        cell: item => (
                          <Toggle
                            checked={item.optimizationEnabled}
                            onChange={({ detail }) => handleToggleOptimization(item.id, detail.checked)}
                          >
                            {item.optimizationEnabled ? 'Enabled' : 'Disabled'}
                          </Toggle>
                        )
                      },
                      {
                        id: 'actions',
                        header: 'Actions',
                        cell: item => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setSelectedProduct(item)}>View</Button>
                            <Button variant="link">Edit</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={getFilteredProducts()}
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(getFilteredProducts().length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(getFilteredProducts().length / 10)}`
                        }}
                      />
                    }
                    loadingText="Loading products"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No products</b>
                        <Box variant="p" color="inherit">
                          No products found. Add your first product to get started.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              )
            },
            {
              id: 'rules',
              label: 'Pricing Rules',
              content: (
                <SpaceBetween size="l">
                  <Box textAlign="center" padding={{ top: 'l' }}>
                    <Box variant="h3">Pricing Rules</Box>
                    <Box variant="p">Create and manage dynamic pricing rules</Box>
                    <Button onClick={handleCreateRule}>Create Rule</Button>
                  </Box>
                </SpaceBetween>
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

export default DynamicPricing;
