import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Satya-Chain branding', () => {
  render(<App />);
  const titleElement = screen.getByText(/Satya-Chain/i);
  expect(titleElement).toBeInTheDocument();
});
