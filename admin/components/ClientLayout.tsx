'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HamburgerIcon from '@/components/HamburgerIcon';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen relative">
      <HamburgerIcon isOpen={isSidebarOpen} onClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="pt-16 md:pt-0 px-4 md:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;