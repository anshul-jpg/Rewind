// This uses a public CORS proxy to fetch channel avatars.
// It's a workaround since we are not using the official YouTube API.
const PROXY_BASE = "https://api.allorigins.win/raw?url=";

export async function fetchChannelAvatar(channelId: string): Promise<string | null> {
  try {
    const targetUrl = `https://www.youtube.com/channel/${channelId}`;
    
    const response = await fetch(`${PROXY_BASE}${encodeURIComponent(targetUrl)}`);
    if (!response.ok) {
        console.warn(`Proxy fetch failed for ${channelId}`);
        return null;
    }
    
    const htmlText = await response.text();

    // The most reliable way to get the avatar is to look for the Open Graph image meta tag.
    const match = htmlText.match(/<meta property="og:image" content="([^"]+)"/);

    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.warn(`Failed to scrape avatar for ${channelId}`, error);
  }
  
  return null;
}
