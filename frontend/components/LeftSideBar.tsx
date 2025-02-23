'use client';

import React, { useState, useRef } from 'react';
import { useEditor } from '../components/EditorContext';
import { MediaItem } from '../lib/editor';

const mediaTypes = [
  { type: 'video' as const, icon: '📹', label: 'Video', accept: 'video/*' },
  { type: 'photo' as const, icon: '📷', label: 'Photo', accept: 'image/*' },
  { type: 'audio' as const, icon: '🎵', label: 'Audio', accept: 'audio/*' },
  { type: 'text' as const, icon: 'T', label: 'Text' },
  { type: 'subtitle' as const, icon: '💬', label: 'Subtitles' },
  { type: 'effect' as const, icon: '🎨', label: 'Effects' }
];

const LeftSidebar = () => {
  const { addMedia } = useEditor();
  const [selectedType, setSelectedType] = useState<MediaItem['type'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (const file of files) {
        await addMedia(file);
        // The file will be added to the editor context
        // and can be accessed through selectedMedia
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error (show user feedback)
    }
  };

  const handleMediaTypeClick = (type: MediaItem['type']) => {
    setSelectedType(type);
    if (type === 'video' || type === 'photo' || type === 'audio') {
      handleUploadClick();
    }
  };

  return (
    <div className="w-64 bg-[#242424] border-r border-[#333] p-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={mediaTypes.find(t => t.type === selectedType)?.accept}
        onChange={handleFileChange}
        multiple
      />

      <button 
        className="w-full px-4 py-2 bg-[#4a4a4a] rounded hover:bg-[#555] mb-6"
        onClick={handleUploadClick}
      >
        Upload
      </button>

      <div className="flex flex-col gap-2">
        {mediaTypes.map((item) => (
          <button
            key={item.type}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              selectedType === item.type ? 'bg-[#4a4a4a]' : 'hover:bg-[#333]'
            }`}
            onClick={() => handleMediaTypeClick(item.type)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Media Preview Section */}
      <div className="mt-6 border-t border-[#333] pt-4">
        <h3 className="text-sm text-gray-400 mb-3">Media Files</h3>
        <div className="space-y-2">
          {/* uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="p-2 bg-[#333] rounded flex items-center gap-2"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(file));
              }}
            >
              <span>{file.type === 'video' ? '📹' : '📷'}</span>
              <span className="text-sm truncate">{file.name}</span>
            </div>
          )) */}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;