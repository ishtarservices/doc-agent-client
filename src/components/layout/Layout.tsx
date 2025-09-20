import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingBottomBar from '@/components/floatingBar/FloatingBottomBar';

const Layout = () => {
  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      {/* <FloatingBottomBar /> */}
    </div>
  );
};

export default Layout;