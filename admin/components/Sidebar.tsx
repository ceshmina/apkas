'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: '日記', href: '/diary' },
    { name: '写真', href: '/photos' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <Link href="/" className="block">
          <h1 className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors">
            apkas
          </h1>
        </Link>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-150 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;