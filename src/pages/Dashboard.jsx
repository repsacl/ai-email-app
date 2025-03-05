// src/pages/Dashboard.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Inbox from './Inbox';

function Dashboard() {
  // You can add dashboard-specific state here
  const [activeSection, setActiveSection] = useState('inbox');
  
  return (
    <div className="space-y-6">
      <div>
        {activeSection === 'inbox' ? (
          <Inbox />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default Dashboard;