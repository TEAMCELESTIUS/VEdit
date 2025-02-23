'use client';

import React from 'react';
import { useEditor } from '../components/EditorContext';

const ControlBar = () => {
  const { isPlaying, togglePlayback, currentTime } = useEditor();

  return (
    <div className="h-12 bg-[#1a1a1a] border-t border-[#333] flex items-center px-4 gap-4">
      <button
        onClick={togglePlayback}
        className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-[#444]"
      >
        {isPlaying ? '⏸' : '▶️'}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm">
          {formatTime(currentTime)} / {formatTime(300)} {/* Example total duration */}
        </span>
      </div>

      <div className="flex-1 h-2 bg-[#333] rounded cursor-pointer">
        <div
          className="h-full bg-blue-500 rounded"
          style={{ width: `${(currentTime / 300) * 100}%` }}
        />
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default ControlBar;