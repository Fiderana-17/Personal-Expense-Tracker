import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './Layout/Header';
import { Loader, Login, Register } from './components';
import ExpensesList from './components/Expense/ExpenseList';

const MainApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='grid place-items-center min-h-screen'>
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      {/* Si l'utilisateur n'est pas connecté */}
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Redirection par défaut vers /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* Si l'utilisateur est connecté */}
          <Route path="/" element={<Header />} />
          {/* Redirection par défaut vers / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
