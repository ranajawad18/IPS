
export enum AppTab {
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  SPEECH = 'speech',
  LIVE = 'live'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  timestamp: number;
}
