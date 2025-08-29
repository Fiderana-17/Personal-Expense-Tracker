import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader, Login, Signup } from "./components";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./Layout/MainLayout";

const MainApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-screen">
        <Loader />
      </div>
    );
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
          {/* Layout principal avec Sidebar + Header */}
          <Route path="/" element={<MainLayout> </MainLayout>} />
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
