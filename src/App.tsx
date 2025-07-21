import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContractProvider } from './contexts/ContractContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';

function App() {
  return (
    <ContractProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
        </Routes>
      </Router>
    </ContractProvider>
  );
}

export default App;