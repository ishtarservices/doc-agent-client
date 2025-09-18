import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingBottomBar from '@/components/floatingBar/FloatingBottomBar';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingBottomBar />
    </div>
  );
};

export default Layout;