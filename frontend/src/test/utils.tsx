import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { UserProvider } from '@/contexts/UserContext';
import { CustomRenderOptions } from './types';

function render(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
  }

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...options,
  });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
