import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContractProvider } from './contexts/ContractContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CreatePage } from './pages/CreatePage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <ContractProvider>
      <Router>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="create" element={<CreatePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
        </Routes>
      </Router>
    </ContractProvider>
  );
}

export default App;