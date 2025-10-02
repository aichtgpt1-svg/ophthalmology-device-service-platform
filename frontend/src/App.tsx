import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceForm from './pages/DeviceForm';
import ServiceLog from './pages/ServiceLog';
import DiagnosticWizard from './pages/DiagnosticWizard';
import DocumentAnalyzer from './pages/DocumentAnalyzer';
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import MaintenanceForm   from './pages/MaintenanceForm';
import DeviceDetail from './pages/DeviceDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
		  <Route path="diagnostics" element={<DiagnosticWizard />} />
		  <Route path="documents" element={<DocumentAnalyzer />} />
		  <Route path="maintenance" element={<MaintenanceCalendar />} />
		  <Route path="maintenance/new" element={<MaintenanceForm />} />
		  <Route path="devices/:id" element={<DeviceDetail />} />
		  
		  
		  
          <Route
            path="/*"
			
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/devices" />} />
            <Route path="devices" element={<DeviceList />} />
            <Route path="devices/new" element={<DeviceForm />} />
            <Route path="services" element={<ServiceLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;