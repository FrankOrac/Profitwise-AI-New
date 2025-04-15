
import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Play, BookOpen, CheckCircle } from 'lucide-react';
import { EducationalContent } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EducationCardProps {
  content: EducationalContent;
  onStart?: () => void;
}

export function EducationCard({ content, onStart }: EducationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: updateProgress } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/education/${content.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: Math.min((content.progress || 0) + 10, 100) })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['education']);
    }
  });

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await updateProgress();
      onStart?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="aspect-video bg-slate-100 relative">
        {content.imageUrl ? (
          <img 
            src={content.imageUrl} 
            alt={content.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-300" />
          </div>
        )}
        {content.progress && content.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <Progress value={content.progress} className="h-1" />
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge>{content.category}</Badge>
          <span className="text-xs text-slate-500">{content.difficulty}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight">{content.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {content.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{content.duration}</span>
          </div>
          {content.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400" />
              <span>{content.rating}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent mr-2" />
              Loading...
            </div>
          ) : (
            <>
              {content.progress === 100 ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {content.progress === 100 ? 'Completed' : content.progress && content.progress > 0 ? 'Continue' : 'Start Learning'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
