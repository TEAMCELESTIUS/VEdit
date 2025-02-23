'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '../components/EditorContext';

const MainEditor = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const { 
    selectedMedia, 
    currentTime,
    duration,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    togglePlayback
  } = useEditor();

  // Load video when media changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedMedia) return;

    video.src = selectedMedia.url;
    video.load();

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setVideoLoaded(true);
    };

    return () => {
      video.src = '';
      setVideoLoaded(false);
    };
  }, [selectedMedia, setDuration]);

  // Handle time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [setCurrentTime]);

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoLoaded) return;

    if (isPlaying) {
      video.play().catch(error => {
        console.error('Error playing video:', error);
        togglePlayback(); // Reset playing state if playback fails
      });
    } else {
      video.pause();
    }
  }, [isPlaying, videoLoaded, togglePlayback]);

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayback]);

  const tools = [
    { id: 'cut', label: 'Cut', icon: '✂️' },
    { id: 'trim', label: 'Trim', icon: '📏' },
    { id: 'text', label: 'Add Text', icon: 'T' },
    { id: 'effect', label: 'Effects', icon: '✨' },
  ];

  return (
    <div className="flex-1 flex flex-col p-5 bg-[#1a1a1a]">
      <div className="flex-1 bg-[#242424] rounded-lg flex items-center justify-center relative overflow-hidden">
        {selectedMedia ? (
          <>
            <video
              ref={videoRef}
              className="max-h-full max-w-full"
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                  >
                    {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    
                    className="w-20 cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center gap-4">
            <span className="text-4xl">📁</span>
            <span>Select a media file to start editing</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="px-4 py-2 bg-[#333] rounded hover:bg-[#444] flex items-center gap-2"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default MainEditor;