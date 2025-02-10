// Home.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

describe('Home Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Exibe os botões de cadastro e login quando o usuário não está logado', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cadastro/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test('Exibe o nome do usuário e ícone de logout quando o usuário está logado', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('username', 'testuser');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sair/i })).toBeInTheDocument();
  });

  test('Submete o formulário e exibe a shortUrl quando a requisição é bem-sucedida', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('username', 'testuser');

    axios.post.mockResolvedValueOnce({ data: { shortUrl: 'http://localhost:3000/abc123' } });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const urlInput = screen.getByPlaceholderText(/Insira a URL/i);
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });

    const submitButton = screen.getByRole('button', { name: /Encurtar URL/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
    });

    expect(screen.getByText(/\(Ver estatísticas\)/i).closest('a')).toHaveAttribute('href', '/analytics/abc123');
  });

  test('Exibe mensagem de erro se a requisição falhar', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('username', 'testuser');

    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Erro no backend' } },
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const urlInput = screen.getByPlaceholderText(/Insira a URL/i);
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });

    const submitButton = screen.getByRole('button', { name: /Encurtar URL/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no backend/i)).toBeInTheDocument();
    });
  });

  test('Copia a shortUrl para o clipboard quando o botão é clicado', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('username', 'testuser');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const writeTextMock = jest.fn().mockResolvedValue();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    axios.post.mockResolvedValueOnce({ data: { shortUrl: 'http://localhost:3000/abc123' } });
    const urlInput = screen.getByPlaceholderText(/Insira a URL/i);
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });
    const submitButton = screen.getByRole('button', { name: /Encurtar URL/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('http://localhost:3000/abc123')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByRole('button', { name: '' }); 
    const allButtons = screen.getAllByRole('button');
    const copyBtn = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'button' && element.innerHTML.includes('Copy');
    });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith('http://localhost:3000/abc123');
  });
});
