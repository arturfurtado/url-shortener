// Dashboard.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { createContext } from 'react';

const AuthContext = createContext();
const FakeAuthProvider = ({ children, value }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

jest.mock('./Authentication', () => {
  const actualAuth = jest.requireActual('./Authentication');
  return {
    ...actualAuth,
    useAuth: () => React.useContext(AuthContext),
  };
});

jest.mock('axios');

const fakeUrls = [
  {
    code: 'abc123',
    shortUrl: 'http://localhost:3000/abc123',
    originalUrl: 'http://example.com',
  },
  {
    code: 'def456',
    shortUrl: 'http://localhost:3000/def456',
    originalUrl: 'http://example.org',
  },
];

describe('Dashboard Component', () => {
  const logoutMock = jest.fn();
  const fakeUser = { username: 'testuser' };

  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: fakeUrls });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Exibe saudação e URLs após carregar', async () => {
    render(
      <FakeAuthProvider value={{ user: fakeUser, logout: logoutMock, loading: false }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </FakeAuthProvider>
    );

    expect(screen.getByText(/Bem-vindo, testuser/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
      expect(screen.getByText('http://localhost:3000/def456')).toBeInTheDocument();
    });

    const estatisticasLink = screen.getByText('Estatísticas');
    expect(estatisticasLink.closest('a')).toHaveAttribute('href', '/analytics/abc123');
  });

  test('Dispara logout quando clica no botão "Sair"', async () => {
    render(
      <FakeAuthProvider value={{ user: fakeUser, logout: logoutMock, loading: false }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </FakeAuthProvider>
    );

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  test('Copia a URL para o clipboard ao clicar no botão de copiar', async () => {
    const writeTextMock = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <FakeAuthProvider value={{ user: fakeUser, logout: logoutMock, loading: false }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </FakeAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const copyButton = buttons.find((btn) => btn.innerHTML.includes('Copy'));
    expect(copyButton).toBeDefined();

    fireEvent.click(copyButton);
    expect(writeTextMock).toHaveBeenCalledWith('http://localhost:3000/abc123');
  });
});
