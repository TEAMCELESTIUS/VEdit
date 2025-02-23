'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, MediaItem, TimelineItem, Effect } from '../lib/editor';

const initialState: EditorState = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  selectedTool: null as string | null,
  selectedMedia: null as MediaItem | null,
  mediaLibrary: [],
  tracks: [
    { id: 'video-1', type: 'video', items: [] as TimelineItem[] },
    { id: 'audio-1', type: 'audio', items: [] as TimelineItem[] },
    { id: 'text-1', type: 'text', items: [] as TimelineItem[] }
  ],
  zoom: 1,
};

export interface EditorContextType extends EditorState {
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  togglePlayback: () => void;
  addMedia: (file: File) => Promise<void>;
  trimClip: (trackId: string, itemId: string, updatedItem: TimelineItem) => void;
  splitClip: (trackId: string, itemId: string, splitTime: number) => void;
  addEffect: (trackId: string, itemId: string, effect: Omit<Effect, 'id' | 'startTime'>) => void;
  removeEffect: (trackId: string, itemId: string, effectId: string) => void;
  setSelectedTool: (tool: string | null) => void;
  addToTimeline: (media: MediaItem & Partial<TimelineItem>, trackId: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EditorState>(initialState);

  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  const togglePlayback = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);


  const addMedia = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      
      const type = file.type.startsWith('video/') ? 'video' : 
                  file.type.startsWith('audio/') ? 'audio' : 
                  file.type.startsWith('image/') ? 'photo' : 'text';

      const mediaItem: MediaItem = {
        id: uuidv4(),
        type,
        url,
        name: file.name,
        duration: 0,
        thumbnail: '',
        metadata: {
          width: undefined,
          height: undefined,
          format: undefined,
          bitrate: undefined,
          codec: undefined
        }
      };

      if (type === 'video' || type === 'audio') {
        const element = document.createElement(type);
        element.src = url;
        
        await new Promise<void>((resolve, reject) => {
          element.onloadedmetadata = () => {
            mediaItem.duration = element.duration;
            resolve();
          };
          element.onerror = () => reject(new Error('Failed to load media'));
        });

        if (type === 'video') {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 90;
          
          element.currentTime = 1;
          await new Promise<void>(resolve => {
            element.onseeked = () => {
              const ctx = canvas.getContext('2d');
              // Type assertion since we know this is a video element in this block
              ctx?.drawImage(element as HTMLVideoElement, 0, 0, canvas.width, canvas.height);
              mediaItem.thumbnail = canvas.toDataURL();
              resolve();
            };
          });
        }
      }

      setState(prev => ({
        ...prev,
        mediaLibrary: [...prev.mediaLibrary, mediaItem],
        selectedMedia: mediaItem
      }));

      return mediaItem;
    } catch (error) {
      console.error('Error adding media:', error);
      throw error;
    }
  }, []);


  const trimClip = useCallback((trackId: string, itemId: string, updatedItem: TimelineItem) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId
          ? {
              ...track,
              items: track.items.map(item =>
                item.id === itemId
                  ? { ...item, ...updatedItem }
                  : item
              )
            }
          : track
      )
    }));
  }, []);

  const splitClip = useCallback((trackId: string, itemId: string, splitTime: number) => {
    setState(prev => {
      const track = prev.tracks.find(t => t.id === trackId);
      if (!track) return prev;

      const item = track.items.find(i => i.id === itemId);
      if (!item || splitTime <= item.startTime || splitTime >= item.endTime) return prev;

      const newItem1: TimelineItem = {
        ...item,
        endTime: splitTime,
        trimEnd: splitTime - item.startTime + item.trimStart
      };

      const newItem2: TimelineItem = {
        ...item,
        id: uuidv4(),
        startTime: splitTime,
        trimStart: splitTime - item.startTime + item.trimStart
      };

      return {
        ...prev,
        tracks: prev.tracks.map(t =>
          t.id === trackId
            ? {
                ...t,
                items: t.items.flatMap(i =>
                  i.id === itemId ? [newItem1, newItem2] : [i]
                )
              }
            : t
        )
      };
    });
  }, []);

  const addEffect = useCallback((
    trackId: string, 
    itemId: string, 
    effectData: Omit<Effect, 'id' | 'startTime'>
  ) => {
    setState(prev => {
      const newTracks = prev.tracks.map(track => {
        if (track.id !== trackId) return track;
        
        return {
          ...track,
          items: track.items.map(item => {
            if (item.id !== itemId) return item;
            
            const effect: Effect = {
              ...effectData,
              id: uuidv4(),
              startTime: prev.currentTime - item.startTime
            };

            return {
              ...item,
              effects: [...(item.effects || []), effect]
            };
          })
        };
      });

      return {
        ...prev,
        tracks: newTracks
      };
    });
  }, []);

  const removeEffect = useCallback((trackId: string, itemId: string, effectId: string) => {
    setState(prev => {
      const newTracks = prev.tracks.map(track => {
        if (track.id !== trackId) return track;
        
        return {
          ...track,
          items: track.items.map(item => {
            if (item.id !== itemId) return item;
            
            return {
              ...item,
              effects: (item.effects || []).filter(effect => effect.id !== effectId)
            };
          })
        };
      });

      return {
        ...prev,
        tracks: newTracks
      };
    });
  }, []);

  const setSelectedTool = useCallback((tool: string | null) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
  }, []);


  const addToTimeline = useCallback((media: MediaItem & Partial<TimelineItem>, trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId
          ? {
              ...track,
              items: [...track.items, {
                ...media,
                startTime: media.startTime || 0,
                endTime: media.endTime || media.duration,
                trimStart: media.trimStart || 0,
                trimEnd: media.trimEnd || media.duration,
                effects: media.effects || []
              }]
            }
          : track
      )
    }));
  }, []);

  return (
    <EditorContext.Provider
      value={{
        ...state,
        setCurrentTime,
        setDuration,
        togglePlayback,
        
        addMedia: async (file: File): Promise<void> => {
          await addMedia(file);
        },
        
        trimClip,
        splitClip,
        addEffect,
        removeEffect,
        setSelectedTool,
        addToTimeline,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}