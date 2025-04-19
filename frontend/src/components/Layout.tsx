import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Cloudscape Design System components
import {
  AppLayout,
  SideNavigation,
  Button,
  SpaceBetween,
  Container,
  Header
} from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navigationItems: SideNavigationProps.Item[] = [
    { type: 'link', text: 'Dashboard', href: '/' },
    { type: 'link', text: 'Income', href: '/income' },
    { type: 'link', text: 'Expenses', href: '/expenses' },
    { type: 'link', text: 'Invoices', href: '/invoices' },
    { type: 'link', text: 'Budgeting', href: '/budgeting' },
    { type: 'link', text: 'Recurring Transactions', href: '/recurring' },
    { type: 'link', text: 'Bank Integration', href: '/bank-integration' },
    { type: 'link', text: 'Cash Flow AI', href: '/cash-flow-ai' },
    { type: 'link', text: 'Compliance Automation', href: '/compliance' },
    { type: 'link', text: 'Dynamic Pricing', href: '/dynamic-pricing' },
    { type: 'link', text: 'Tax Estimation', href: '/tax-estimation' },
    { type: 'divider' },
    { type: 'link', text: 'Profile', href: '/profile' }
  ];

  const getActiveHref = () => {
    if (location.pathname === '/') return '/';
    const item = navigationItems.find(item =>
      item.type === 'link' && 'href' in item && location.pathname.startsWith(item.href)
    );
    return item && 'href' in item ? item.href : '/';
  };

  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{ text: 'Business Management', href: '/' }}
          items={navigationItems}
          activeHref={getActiveHref()}
          onFollow={event => {
            event.preventDefault();
            navigate(event.detail.href);
          }}
        />
      }
      toolsHide={true}
      content={
        <Container>
          <SpaceBetween size="l">
            <Header
              variant="h1"
              actions={
                <Button variant="primary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              }
            >
              {location.pathname === '/' ? 'Dashboard' :
               location.pathname === '/income' ? 'Income' :
               location.pathname === '/expenses' ? 'Expenses' :
               location.pathname === '/invoices' ? 'Invoices' :
               location.pathname === '/budgeting' ? 'Budgeting' :
               location.pathname === '/recurring' ? 'Recurring Transactions' :
               location.pathname === '/bank-integration' ? 'Bank Integration' :
               location.pathname === '/cash-flow-ai' ? 'Cash Flow AI' :
               location.pathname === '/compliance' ? 'Compliance Automation' :
               location.pathname === '/dynamic-pricing' ? 'Dynamic Pricing' :
               location.pathname === '/tax-estimation' ? 'Tax Estimation' :
               location.pathname === '/profile' ? 'Profile' : 'Page'}
            </Header>
            <Outlet />
          </SpaceBetween>
        </Container>
      }
      navigationWidth={250}
      contentType="default"
      headerSelector="#header"
      notifications={<div id="notifications" />}
      breadcrumbs={<div id="breadcrumbs" />}
    />
  );
};

export default Layout;
