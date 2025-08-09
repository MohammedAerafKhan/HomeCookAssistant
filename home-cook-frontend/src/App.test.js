import { render, screen } from '@testing-library/react';
import AuthCard from './pages/AuthCard';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}), { virtual: true });

test('renders Home Cook Assistant header', () => {
  render(<AuthCard />);
  expect(screen.getAllByText(/Home Cook Assistant/i)[0]).toBeInTheDocument();
});
