import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import VehiclesPage from './pages/VehiclesPage';
import OwnersPage from './pages/OwnersPage';
import PoliciesPage from './pages/PoliciesPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
