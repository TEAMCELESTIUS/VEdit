'use client';

import React from 'react';
import { useEditor } from '../components/EditorContext';

const RightSidebar = () => {
  const { selectedMedia } = useEditor();

  return (
    <div className="w-64 bg-[#1a1a1a] p-4 border-l border-[#333]">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      {selectedMedia ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Name</label>
            <p className="text-sm">{selectedMedia.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Duration</label>
            <p className="text-sm">{selectedMedia.duration.toFixed(2)}s</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Select a media item to view properties</p>
      )}
    </div>
  );
};

export default RightSidebar;