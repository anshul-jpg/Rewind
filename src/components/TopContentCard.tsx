'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, PlaySquare } from 'lucide-react';
import type { ProcessedData, TopVideo } from '@/types';
import { fetchChannelAvatar } from '@/lib/youtubeAvatar';
import { TopVideosChart } from './charts/TopVideosChart';

const ChannelRow = ({ channel }: { channel: ProcessedData['topChannels'][0] }) => {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!channel.id) return;

    const cached = localStorage.getItem(`avatar_${channel.id}`);
    if (cached) {
      setAvatar(cached);
      return;
    }

    fetchChannelAvatar(channel.id).then((url) => {
      if (url) {
        setAvatar(url);
        localStorage.setItem(`avatar_${channel.id}`, url);
      }
    });
  }, [channel.id]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8">
          {avatar ? (
            <AvatarImage src={avatar} alt={channel.name} />
          ) : (
             <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {getInitials(channel.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="font-medium truncate" title={channel.name}>{channel.name}</span>
      </div>
      <span className="font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md flex-shrink-0">{Math.round(channel.minutes).toLocaleString()} mins</span>
    </div>
  );
};


interface TopContentCardProps {
    topChannels: ProcessedData['topChannels'];
    topVideos: ProcessedData['topVideos'];
}

export function TopContentCard({ topChannels, topVideos }: TopContentCardProps) {
    return (
        <Card>
            <CardHeader>
                <Tabs defaultValue="channels">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="channels">
                            <TrendingUp className="h-4 w-4 mr-2"/>
                            Top Channels
                        </TabsTrigger>
                        <TabsTrigger value="videos">
                             <PlaySquare className="h-4 w-4 mr-2"/>
                            Most Watched Videos
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="channels" className="mt-4">
                         <div className="space-y-4 pt-2">
                            {topChannels.slice(0, 5).map((channel, index) => (
                                <ChannelRow key={channel.id || index} channel={channel} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="videos" className="mt-4 h-[350px]">
                       <TopVideosChart data={topVideos} />
                    </TabsContent>
                </Tabs>
            </CardHeader>
        </Card>
    );
}
