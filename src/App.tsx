import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContractProvider } from './contexts/ContractContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CreatePage } from './pages/CreatePage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <ContractProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="create" element={<CreatePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </Router>
    </ContractProvider>
  );
}

export default App;