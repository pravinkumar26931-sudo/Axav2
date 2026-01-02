
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-xl font-bold tracking-tight">Shramik Hisaab</h1>
        </div>
        <span className="text-xs font-medium bg-blue-600 px-2 py-1 rounded">Worker Buddy</span>
      </div>
    </header>
  );
};

export default Header;
