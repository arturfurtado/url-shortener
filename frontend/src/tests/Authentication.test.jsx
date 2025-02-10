import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './Authentication';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not loading'}</div>
      <div data-testid="user">{user ? user.username : 'no user'}</div>
      <button data-testid="login-button" onClick={() => login({ username: 'testuser', password: '1234' })}>
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

jest.mock('axios');

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Quando não há token, loading termina e usuário é nulo', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(getByTestId('loading').textContent).toBe('not loading'));
    expect(getByTestId('user').textContent).toBe('no user');
  });

  test('Se token existe e validação retorna usuário, o usuário é definido', async () => {
    localStorage.setItem('token', 'valid-token');
    axios.get.mockResolvedValueOnce({ data: { user: { username: 'validUser' } } });
    
    const { getByTestId } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => expect(getByTestId('loading').textContent).toBe('not loading'));
    expect(getByTestId('user').textContent).toBe('validUser');
  });

  test('Se a validação do token falhar, o logout é acionado e o usuário fica nulo', async () => {
    localStorage.setItem('token', 'invalid-token');
    axios.get.mockRejectedValueOnce(new Error('Invalid token'));
    
    const { getByTestId } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => expect(getByTestId('loading').textContent).toBe('not loading'));
    expect(getByTestId('user').textContent).toBe('no user');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('A função login salva token e define usuário', async () => {
    const fakeUser = { username: 'newUser' };
    axios.post.mockResolvedValueOnce({ data: { token: 'new-token', user: fakeUser } });
    
    const { getByTestId } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    
    fireEvent.click(getByTestId('login-button'));
    
    await waitFor(() => expect(getByTestId('user').textContent).toBe('newUser'));
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  test('A função logout limpa o token e o usuário', async () => {
    localStorage.setItem('token', 'token');
    axios.get.mockResolvedValueOnce({ data: { user: { username: 'existingUser' } } });
    
    const { getByTestId } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => expect(getByTestId('user').textContent).toBe('existingUser'));
    fireEvent.click(getByTestId('logout-button'));
    expect(getByTestId('user').textContent).toBe('no user');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
