import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsDashboard from './AnalyticsDashboard';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('axios');

describe('AnalyticsDashboard', () => {
  const fakeData = {
    totalClicks: 100,
    dailyClicks: [
      { date: '2025-02-07', count: 20 },
      { date: '2025-02-08', count: 80 },
    ],
    referrers: [
      { referrer: 'google.com', count: 50 },
      { referrer: 'facebook.com', count: 50 },
    ],
  };

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Exibe o estado de loading enquanto busca os dados', () => {
    axios.get.mockResolvedValueOnce({ data: fakeData });

    render(
      <MemoryRouter initialEntries={['/analytics/abc123']}>
        <Routes>
          <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('Exibe os dados de analytics quando a requisição é bem-sucedida', async () => {
    axios.get.mockResolvedValueOnce({ data: fakeData });

    render(
      <MemoryRouter initialEntries={['/analytics/abc123']}>
        <Routes>
          <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/Estatísticas para: abc123/i)).toBeInTheDocument()
    );

    expect(screen.getByText('Total de Cliques')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('Exibe mensagem de erro se o token não for encontrado', async () => {
    localStorage.removeItem('token');

    render(
      <MemoryRouter initialEntries={['/analytics/abc123']}>
        <Routes>
          <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/Token não encontrado/i)).toBeInTheDocument()
    );
  });

  test('Exibe mensagem de erro se a requisição falhar', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/analytics/abc123']}>
        <Routes>
          <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Erro ao buscar analytics. Verifique o console/i)
      ).toBeInTheDocument()
    );
  });
});
