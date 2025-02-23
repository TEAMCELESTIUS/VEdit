'use client';

import React from 'react';
import { EditorProvider } from '../components/EditorContext';
import TopBar from '../components/TopBar';
import LeftSidebar from '../components/LeftSideBar';
import MainEditor from '../components/MainEditor';
import RightSidebar from '../components/RightSidebar';
import ControlBar from '../components/ControlBar';
import Timeline from '../components/Timeline';

export default function EditorPage() {
  return (
    <EditorProvider>
      <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white">
        <TopBar />
        <main className="flex flex-1">
          <LeftSidebar />
          <MainEditor />
          <RightSidebar />
        </main>
        <footer className="h-[200px] bg-[#242424]">
          <ControlBar />
          <Timeline />
        </footer>
      </div>
    </EditorProvider>
  );
} 