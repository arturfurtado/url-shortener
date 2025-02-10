// Login.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Exibe formulário de login quando não há token', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/Entrar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nome de usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
  });

  test('Realiza login com sucesso e exibe as URLs', async () => {
    const fakeToken = 'fake-token';
    const fakeUrls = [
      { id: 1, shortened_url: 'http://localhost:3000/abc123', original_url: 'http://example.com' },
      { id: 2, shortened_url: 'http://localhost:3000/def456', original_url: 'http://example.org' },
    ];

    axios.post.mockResolvedValueOnce({ data: { token: fakeToken } });
    axios.get.mockResolvedValueOnce({ data: fakeUrls });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nome de usuário/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), {
      target: { value: '1234' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => expect(screen.getByText(/Suas URLs/i)).toBeInTheDocument());

    expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3000/def456')).toBeInTheDocument();

    expect(localStorage.getItem('username')).toBe('testuser');
  });

  test('Exibe mensagem de erro se o login falhar', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login error'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nome de usuário/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() =>
      expect(screen.getByText(/Falha no login/i)).toBeInTheDocument()
    );

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  test('Busca automaticamente as URLs se token existir no localStorage', async () => {
    const fakeToken = 'stored-token';
    const fakeUrls = [
      { id: 1, shortened_url: 'http://localhost:3000/abc123', original_url: 'http://example.com' },
    ];
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('username', 'testuser');

    axios.get.mockResolvedValueOnce({ data: fakeUrls });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/Suas URLs/i)).toBeInTheDocument()
    );

    expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
  });
});
