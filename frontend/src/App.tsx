import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Prepare from './pages/Prepare';
import Loss from './pages/Loss';
import Emergency from './pages/Emergency';
import Learn from './pages/Learn';
import Documents from './pages/Documents';
import Vault from './pages/Vault';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './store/AuthContext';
import { UserProvider } from './store/UserContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              <Route path="onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="prepare" element={
                <ProtectedRoute>
                  <Prepare />
                </ProtectedRoute>
              } />
              
              <Route path="loss" element={
                <ProtectedRoute>
                  <Loss />
                </ProtectedRoute>
              } />
              
              <Route path="emergency" element={<Emergency />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:slug" element={<Learn />} />
              
              <Route path="documents" element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } />
              
              <Route path="vault" element={
                <ProtectedRoute>
                  <Vault />
                </ProtectedRoute>
              } />
              
              <Route path="account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
