'use client';

import React, { useRef, useState } from 'react';
import { useEditor } from '../components/EditorContext';
import { MediaItem, TimelineItem } from '../lib/editor';
import Image from 'next/image';

const Timeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);
  const [trimming, setTrimming] = useState<{
    trackId: string;
    itemId: string;
    edge: 'start' | 'end';
  } | null>(null);

  const {
    tracks,
    currentTime,
    duration,
    mediaLibrary,
    selectedTool,
    addToTimeline,
    trimClip,
    splitClip,
    setCurrentTime,
  } = useEditor();

  // Timeline click for playhead
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, media: MediaItem) => {
    setDraggedItem(media);
    e.dataTransfer.setData('text/plain', media.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    if (!draggedItem || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropTime = (dropX / rect.width) * duration;

    // Add media to timeline at drop position
    addToTimeline({
      ...draggedItem,
      startTime: dropTime,
      endTime: dropTime + draggedItem.duration,
      trimStart: 0,
      trimEnd: draggedItem.duration,
      effects: []
    }, trackId);

    setDraggedItem(null);
  };

  // Trim handlers
  const handleTrimStart = (
    e: React.MouseEvent,
    trackId: string,
    itemId: string,
    edge: 'start' | 'end'
  ) => {
    e.stopPropagation();
    setTrimming({ trackId, itemId, edge });
    setIsDragging(true);
  };

  const handleTrimMove = (e: React.MouseEvent) => {
    if (!trimming || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const trimTime = (mouseX / rect.width) * duration;

    const track = tracks.find(t => t.id === trimming.trackId);
    const item = track?.items.find(i => i.id === trimming.itemId) as TimelineItem;

    if (!item) return;

    const updatedItem = { ...item };
    if (trimming.edge === 'start') {
      updatedItem.startTime = Math.min(trimTime, item.endTime - 0.1);
      updatedItem.trimStart = Math.max(0, trimTime - item.startTime);
    } else {
      updatedItem.endTime = Math.max(trimTime, item.startTime + 0.1);
      updatedItem.trimEnd = Math.min(item.duration, trimTime - item.startTime);
    }

    trimClip(trimming.trackId, trimming.itemId, updatedItem);
  };

  const handleTrimEnd = () => {
    setTrimming(null);
    setIsDragging(false);
  };

  // Split handler
  const handleSplit = (trackId: string, itemId: string) => {
    if (selectedTool === 'cut') {
      splitClip(trackId, itemId, currentTime);
    }
  };

  return (
    <div className="h-[200px] bg-[#242424] flex flex-col">
      {/* Media Library */}
      <div className="h-20 border-b border-[#333] p-2 overflow-x-auto whitespace-nowrap">
        {mediaLibrary.map((media: MediaItem) => (
          <div
            key={media.id}
            className="inline-block w-24 h-16 bg-[#333] rounded mr-2 cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, media)}
          >
            {media.thumbnail && (
              <div className="w-full h-full relative">
                <Image
                  src={media.thumbnail}
                  alt={media.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 relative overflow-hidden"
        onClick={handleTimelineClick}
        onMouseMove={trimming ? handleTrimMove : undefined}
        onMouseUp={handleTrimEnd}
        onMouseLeave={handleTrimEnd}
      >
        {/* Time markers */}
        <div className="h-6 bg-[#2a2a2a] flex border-b border-[#333]">
          {Array.from({ length: Math.ceil(duration / 5) }).map((_, i) => (
            <div key={i} className="flex-1 border-l border-[#444] h-full flex items-end pb-1">
              <span className="text-xs text-gray-400 ml-1">{i * 5}s</span>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="h-16 border-b border-[#333] relative"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, track.id)}
            >
              {/* Track label */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#2a2a2a] border-r border-[#333] flex items-center justify-center">
                <span className="text-sm text-gray-400">{track.type}</span>
              </div>

              {/* Track items */}
              <div className="ml-20 h-full relative">
                {track.items.map((item) => (
                  <div
                    key={item.id}
                    className="absolute top-2 bottom-2 bg-[#4a4a4a] rounded cursor-pointer"
                    style={{
                      left: `${(item.startTime / duration) * 100}%`,
                      width: `${((item.endTime - item.startTime) / duration) * 100}%`
                    }}
                    onClick={() => handleSplit(track.id, item.id)}
                  >
                    {/* Trim handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize"
                      onMouseDown={(e) => handleTrimStart(e, track.id, item.id, 'start')}
                    />
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize"
                      onMouseDown={(e) => handleTrimStart(e, track.id, item.id, 'end')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-3 h-3 bg-red-500 transform -translate-x-1/2 rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default Timeline;