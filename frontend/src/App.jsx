import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home'; 
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Register from './components/Register';
import Login from './components/Login';
import RedirectShortUrl from './components/RedirectShortUrl';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />
        <Route path="/:code" element={<RedirectShortUrl />} />
      </Routes>
    </Router>
  );
}

export default App;
