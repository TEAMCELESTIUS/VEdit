export interface MediaItem {
    id: string;
    type: 'video' | 'photo' | 'audio' | 'text' | 'subtitle' | 'effect';
    url: string;
    name: string;
    duration: number;
    thumbnail?: string;
    metadata: MediaMetadata;
  }
  
  export interface MediaMetadata {
    width?: number;
    height?: number;
    format?: string;
    bitrate?: number;
    codec?: string;
  }
  
  export interface TimelineTrack {
    id: string;
    type: MediaItem['type'];
    items: TimelineItem[];
  }
  
  export interface TimelineItem extends MediaItem {
    startTime: number;
    endTime: number;
    trimStart: number;
    trimEnd: number;
    effects: Effect[];
  }
  
  export interface EditorState {
    mediaLibrary: MediaItem[];
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    volume: number;
    selectedTool: string | null;
    selectedMedia: MediaItem | null;
    tracks: TimelineTrack[];
    zoom: number;
  }
  
  export interface Effect {
    id: string;
    type: 'fade' | 'brightness' | 'contrast' | 'saturation';
    startTime: number;
    duration: number;
    value: number;
    config: EffectConfig;
  }
  
  export interface EffectConfig {
    intensity?: number;
    direction?: 'in' | 'out';
    curve?: 'linear' | 'ease';
  }
  
  export interface Track {
    id: string;
    type: MediaItem['type'];
    items: TimelineItem[];
  }
  
  export interface EditorContextType extends EditorState {
    addMedia: (file: File) => Promise<void>;
    removeMedia: (id: string) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    togglePlayback: () => void;
    setVolume: (volume: number) => void;
    addToTimeline: (media: MediaItem, trackType: string) => void;
    removeFromTimeline: (trackId: string, itemId: string) => void;
    trimClip: (trackId: string, itemId: string, updatedItem: TimelineItem) => void;
    splitClip: (trackId: string, itemId: string, splitTime: number) => void;
    addEffect: (trackId: string, itemId: string, effect: Effect) => void;
    removeEffect: (trackId: string, itemId: string, effectId: string) => void;
    setSelectedTool: (tool: string | null) => void;
    setZoom: (zoom: number) => void;
  }