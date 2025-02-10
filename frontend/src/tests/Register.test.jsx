// Register.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renderiza os inputs e botão de registro', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Escolha um usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escolha uma senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirme a senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar/i })).toBeInTheDocument();
  });

  test('Exibe erro se as senhas não coincidirem', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Escolha um usuário/i), {
      target: { value: 'novoUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Escolha uma senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirme a senha/i), {
      target: { value: 'senhaDiferente' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();
  });

  test('Exibe mensagem de sucesso após registro bem-sucedido', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Escolha um usuário/i), {
      target: { value: 'novoUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Escolha uma senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirme a senha/i), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registro realizado com sucesso! Faça login./i)).toBeInTheDocument();
    });
  });

  test('Exibe mensagem de erro se o registro falhar', async () => {
    axios.post.mockRejectedValueOnce(new Error('Erro no registro'));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Escolha um usuário/i), {
      target: { value: 'novoUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Escolha uma senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirme a senha/i), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Falha no registro/i)).toBeInTheDocument();
    });
  });

  test('Alterna a visibilidade da senha quando o botão é clicado', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/Escolha uma senha/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirme a senha/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button');
    const toggleBtn = toggleButtons.find(
      (btn) => !btn.textContent.includes('Registrar')
    );
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
