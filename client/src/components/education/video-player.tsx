
import React from 'react';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video">
        <video
          className="w-full h-full"
          controls
          controlsList="nodownload"
          poster={`${videoUrl}?thumb=1`}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
      </div>
    </Card>
  );
}
