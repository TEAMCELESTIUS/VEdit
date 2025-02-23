'use client';

import React from 'react';
import { useEditor } from './EditorContext';
import Image from 'next/image';

const TopBar = () => {
  useEditor();

  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-[#333] flex items-center px-4">
      <Image
        src="/logo.png"
        alt="Logo"
        width={32}
        height={32}
        className="mr-4"
      />
      <div className="flex items-center gap-4">
        <nav className="flex gap-4">
          <button className="px-3 py-1 bg-[#333] rounded">Project</button>
          <button className="px-3 py-1">Cloud</button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          My team
        </span>
        <button className="flex items-center gap-1">
          New file
          <span className="text-xs">▼</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-[#4a4a4a] rounded hover:bg-[#555]">
          Export
        </button>
        <button className="p-2 hover:bg-[#333] rounded">⚙️</button>
        <button className="p-2 hover:bg-[#333] rounded">?</button>
        <div className="w-8 h-8 rounded-full bg-[#333]">👤</div>
      </div>
    </div>
  );
};

export default TopBar;