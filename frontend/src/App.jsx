import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; 
import AnalyticsDashboard from './Components/AnalyticsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics/:code" element={<AnalyticsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
