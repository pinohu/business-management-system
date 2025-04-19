import { HTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  children: ReactNode;
}

export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
