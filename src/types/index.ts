export interface WatchHistoryItem {
  header: string;
  title: string;
  titleUrl?: string;
  subtitles?: { name: string; url: string }[];
  time: string;
  products: string[];
  activityControls: string[];
  // Added by our worker
  date: Date; 
}

export type TimeFilter = 'last7' | 'last30' | 'lastYear' | 'allTime';

export interface Channel {
  id: string | null;
  name: string;
  minutes: number;
  url?: string | null;
}

export interface TopVideo {
  title: string;
  url: string;
  views: number;
}

export interface GhostChannel {
  name: string;
  id: string;
}

export interface DailyWatchData {
  date: string;
  minutes: number;
}

export interface AdvancedStatsData {
  avgVideosPerDay: number;
  mostActiveDate: { date: string; views: number };
  favoriteHour: number;
  favoriteDay: string;
}

export interface ProcessedData {
  totalMinutes: number;
  totalVideos: number;
  topChannels: Channel[];
  topVideos: TopVideo[];
  dailyWatchData: DailyWatchData[];
  ghostChannels: GhostChannel[];
  advancedStats: AdvancedStatsData;
  channelAvatars: Record<string, string>;
}
