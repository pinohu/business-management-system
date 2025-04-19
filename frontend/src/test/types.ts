import { RenderOptions } from '@testing-library/react';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialState?: Record<string, unknown>;
}

export interface TestWrapperProps {
  children: React.ReactNode;
}
