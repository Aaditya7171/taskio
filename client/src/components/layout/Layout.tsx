import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import FeedbackButton from '@/components/feedback/FeedbackButton';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6 flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
};

export default Layout;
