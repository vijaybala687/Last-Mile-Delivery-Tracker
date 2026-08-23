import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 w-full flex">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/customer/*" element={<CustomerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/agent/*" element={<AgentDashboard />} />
      </Routes>
    </div>
  );
}

export default App;