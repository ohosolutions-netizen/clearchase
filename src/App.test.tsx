import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('ClearChase', () => {
  it('renders the sandbox dashboard and primary CTA', () => {
    render(<App />);
    expect(screen.getByText('Good evening, Krishna')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new document request/i })).toBeInTheDocument();
    expect(screen.getByText('Sandbox mode')).toBeInTheDocument();
  });
});
