import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { EducationalContent } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";

interface EducationCardProps {
  content: EducationalContent;
}

export function EducationCard({ content }: EducationCardProps) {
  const { mutate: updateProgress } = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await fetch(`/api/education/${contentId}/progress`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    }
  });

  const handleStartContent = () => {
    updateProgress(content.id);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <AspectRatio ratio={16/9} className="bg-slate-200 relative">
        <img 
          src={content.imageUrl || '/placeholder-image.jpg'} 
          alt={content.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
          {content.duration}
        </div>
      </AspectRatio>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-primary-600 font-medium mb-2">{content.category}</div>
        <h3 className="text-lg font-bold mb-2">{content.title}</h3>
        <p className="text-sm text-slate-500 mb-4 flex-1">{content.description}</p>
        <div className="flex items-center text-sm text-slate-500">
          <PlayCircle className="h-4 w-4 mr-1.5" />
          <span>{content.difficulty} • {content.duration}</span>
        </div>
      <div className="mt-4 flex items-center justify-between">
          {content.progress && (
            <div className="flex-1 mr-4">
              <div className="h-2 bg-slate-200 rounded-full">
                <div 
                  className="h-2 bg-primary-600 rounded-full" 
                  style={{ width: `${content.progress}%` }}
                />
              </div>
            </div>
          )}
          <Button onClick={handleStartContent} size="sm">
            {content.progress ? 'Continue' : 'Start'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default EducationCard;
