import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader, Login, Signup, ExpensesList, Dashboard, Profile, CategoriesList, IncomeList } from "./components";
import MainLayout from "./Layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";


const MainApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="grid place-items-center min-h-screen">
      <Loader />
    </div>;
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="expenses" element={<ExpensesList />} />
            <Route path="income" element={<IncomeList />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="reports" element={<p className="text-fuchsia-600 text-3xl text-center mt-40">contenu à changer dans <br /> App.tsx</p>} />
            <Route path="receipts" element={<p className="text-lime-500 text-3xl text-center mt-40">contenu à changer dans <br /> App.tsx</p>} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
