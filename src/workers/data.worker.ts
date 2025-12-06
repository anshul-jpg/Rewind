/// <reference lib="webworker" />
import { parse } from 'papaparse';
import { parseISO, differenceInSeconds, getDay, format, startOfDay, isWithinInterval, subDays, compareAsc } from 'date-fns';
import type { ProcessedData, WatchHistoryItem, TimeFilter, TopVideo } from '@/types';


interface WorkerInput {
  files: { name: string; content: File }[];
  filter: TimeFilter;
  minDuration: number;
}

// --- HELPER FUNCTIONS ---

function postProgress(progress: number, message: string) {
  self.postMessage({ type: 'progress', payload: { progress, message } });
}

const getChannelInfo = (videoItem: WatchHistoryItem) => {
  if (!videoItem.subtitles || videoItem.subtitles.length === 0) {
    return { name: "Unknown", url: null, id: null };
  }
  const name = videoItem.subtitles[0].name;
  const url = videoItem.subtitles[0].url;
  const idMatch = url.match(/channel\/(UC[\w-]{22})/);
  const id = idMatch ? idMatch[1] : null;

  return { name, url, id };
};


const getFilterDateRange = (filter: TimeFilter) => {
  const now = new Date();
  switch (filter) {
    case 'last7':
      return { start: subDays(now, 7), end: now };
    case 'last30':
      return { start: subDays(now, 30), end: now };
    case 'lastYear':
      return { start: subDays(now, 365), end: now };
    case 'allTime':
    default:
      return { start: new Date(0), end: now };
  }
};


// --- PARSING LOGIC ---

function parseWatchHistory(fileContent: string, filter: TimeFilter, minDuration: number) {
  postProgress(10, 'Parsing watch history...');
  
  if (fileContent.trim().startsWith('<')) {
    throw new Error("Invalid file format. Please ensure you export your watch history as JSON from Google Takeout, not HTML.");
  }

  let history: WatchHistoryItem[];
  try {
    history = JSON.parse(fileContent);
  } catch (e) {
    throw new Error("Failed to parse the JSON file. The file may be corrupt or in the wrong format. Please ensure it's the watch-history.json file from Google Takeout.");
  }
  
  const filterInterval = getFilterDateRange(filter);

  const validItems = history
    .map(item => ({...item, date: parseISO(item.time)}))
    .filter(item =>
      item.header === 'YouTube' &&
      item.titleUrl &&
      isWithinInterval(item.date, filterInterval)
    )
    .sort((a, b) => compareAsc(a.date, b.date)); 
  postProgress(20, `Found ${validItems.length} watch history items for the selected period. Calculating durations...`);

  let totalMinutes = 0;
  const channelWatchTime: Record<string, { minutes: number, id: string | null, name: string, url: string | null }> = {};
  const hourlyActivity: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  const dailyViewCounts: Record<string, number> = {};
  const dailyWatchDataMap: Record<string, number> = {};
  const videoViewCounts: Record<string, { title: string; url: string, views: number }> = {};
  
  let processedItems = [];

  for (let i = 0; i < validItems.length - 1; i++) {
    const current = validItems[i];
    const next = validItems[i + 1];

    let durationSeconds = differenceInSeconds(next.date, current.date);

    if (durationSeconds > 60 * 60) {
      durationSeconds = 15 * 60;
    }

    const durationMinutes = durationSeconds / 60;

    if (durationMinutes < minDuration) {
      continue;
    }

    processedItems.push(current);

    totalMinutes += durationMinutes;

    const channel = getChannelInfo(current);
    const channelKey = channel.id || channel.name;
    
    if (!channelWatchTime[channelKey]) {
      channelWatchTime[channelKey] = { minutes: 0, id: channel.id, name: channel.name, url: channel.url };
    }
    channelWatchTime[channelKey].minutes += durationMinutes;

    if (current.titleUrl) {
      if (!videoViewCounts[current.titleUrl]) {
        videoViewCounts[current.titleUrl] = { title: current.title.replace('Watched ', ''), url: current.titleUrl, views: 0 };
      }
      videoViewCounts[current.titleUrl].views++;
    }

    const dayOfWeek = getDay(current.date); // Sunday = 0
    const hour = current.date.getHours();
    hourlyActivity[dayOfWeek][hour]++;

    const dayKey = format(startOfDay(current.date), 'yyyy-MM-dd');
    dailyViewCounts[dayKey] = (dailyViewCounts[dayKey] || 0) + 1;
    dailyWatchDataMap[dayKey] = (dailyWatchDataMap[dayKey] || 0) + durationMinutes;
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const totalViewsPerDay = Array(7).fill(0);
  hourlyActivity.forEach((dayHours, dayIndex) => {
    totalViewsPerDay[dayIndex] = dayHours.reduce((sum, views) => sum + views, 0);
  });
  
  let favoriteDayIndex = 0;
  totalViewsPerDay.forEach((views, index) => {
    if (views > totalViewsPerDay[favoriteDayIndex]) {
      favoriteDayIndex = index;
    }
  });

  const totalViewsPerHour = Array(24).fill(0);
  hourlyActivity.forEach(dayHours => {
    dayHours.forEach((views, hour) => {
      totalViewsPerHour[hour] += views;
    });
  });

  let favoriteHourIndex = 0;
  totalViewsPerHour.forEach((views, hour) => {
    if (views > totalViewsPerHour[favoriteHourIndex]) {
      favoriteHourIndex = hour;
    }
  });

  const topChannels = Object.values(channelWatchTime)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);
  
  const topVideos: TopVideo[] = Object.values(videoViewCounts)
    .sort((a,b) => b.views - a.views)
    .slice(0, 10);

  const mostActiveDateEntry = Object.entries(dailyViewCounts).sort(([,a], [,b]) => b - a)[0];
  
  const advancedStats = {
      avgVideosPerDay: processedItems.length / (Object.keys(dailyViewCounts).length || 1),
      mostActiveDate: {
          date: mostActiveDateEntry ? mostActiveDateEntry[0] : 'N/A',
          views: mostActiveDateEntry ? mostActiveDateEntry[1] : 0
      },
      favoriteDay: dayNames[favoriteDayIndex],
      favoriteHour: favoriteHourIndex,
  };
  
  const dailyWatchData = Object.entries(dailyWatchDataMap)
      .map(([date, minutes]) => ({ date, minutes: Math.round(minutes) }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
  return {
    totalMinutes: Math.round(totalMinutes),
    totalVideos: processedItems.length,
    topChannels,
    topVideos,
    dailyWatchData,
    advancedStats,
    watchHistoryItems: processedItems
  };
}

function parseSubscriptions(fileContent: string) {
  postProgress(70, 'Parsing subscriptions...');
  const parsed = parse<{ 'Channel Url': string, 'Channel Title': string }>(fileContent, { header: true });
  const subscriptions = new Map<string, string>();
  parsed.data.forEach(row => {
    if (row['Channel Url']) {
        const idMatch = row['Channel Url'].match(/channel\/(UC[\w-]{22})/);
        const id = idMatch ? idMatch[1] : null; // Only store valid IDs
        if (id) {
            subscriptions.set(id, row['Channel Title']);
        }
    }
  });
  return { subscriptions };
}


function crossReferenceData(
  watchHistory: WatchHistoryItem[],
  subscriptions: Map<string, string>
) {
  postProgress(80, 'Cross-referencing subscriptions and watch history...');

  const watchedChannelIds = new Set<string>();
  watchHistory.forEach(item => {
    const channelInfo = getChannelInfo(item);
    if (channelInfo.id) {
        watchedChannelIds.add(channelInfo.id);
    }
  });

  const ghostChannels: { name: string, id: string }[] = [];
  subscriptions.forEach((name, id) => {
    if (!watchedChannelIds.has(id)) {
      ghostChannels.push({ name, id });
    }
  });

  return { ghostChannels };
}

// --- MAIN WORKER LOGIC ---

self.onmessage = async (event: MessageEvent<WorkerInput>) => {
  try {
    const { files, filter, minDuration } = event.data;

    const historyFileWrapper = files.find(f => f.name.endsWith('watch-history.json'));
    const subsFileWrapper = files.find(f => f.name.endsWith('subscriptions.csv'));
    
    if (!historyFileWrapper) {
      // Check for common mistake of uploading HTML file
      if (files.some(f => f.name.endsWith('watch-history.html'))) {
        throw new Error("HTML file detected. Please go back to Google Takeout and export your 'history' data as JSON, not HTML.");
      }
      throw new Error('Could not find `watch-history.json`. Please make sure you have selected the entire `Takeout` folder.');
    }
    
    const historyContent = await historyFileWrapper.content.text();
    const historyData = parseWatchHistory(historyContent, filter, minDuration);
    postProgress(60, 'Watch history processed.');
    
    let crossRefData = { ghostChannels: [] };
    if (subsFileWrapper) {
      const subsContent = await subsFileWrapper.content.text();
      const subsData = parseSubscriptions(subsContent);
      crossRefData = crossReferenceData(historyData.watchHistoryItems, subsData.subscriptions);
      postProgress(95, 'Subscription data analyzed.');
    } else {
      postProgress(95, 'Skipping subscription analysis (file not found).');
    }

    const finalData: ProcessedData = {
      ...historyData,
      ...crossRefData,
      channelAvatars: {}, // Keep this empty, will be handled by client
    };
    
    // We don't need to send these large items to the main thread
    // @ts-ignore
    delete finalData.watchHistoryItems;


    postProgress(100, 'Analysis complete!');
    self.postMessage({
      type: 'result',
      payload: finalData
    });

  } catch (error) {
    self.postMessage({ type: 'error', payload: error instanceof Error ? error.message : 'An unknown worker error occurred.' });
  }
};
