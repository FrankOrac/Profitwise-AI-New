import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle } from "lucide-react";
import { EducationalContent } from "@shared/schema";

interface EducationCardProps {
  content: EducationalContent;
}

export function EducationCard({ content }: EducationCardProps) {
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
      </div>
    </Card>
  );
}

export default EducationCard;
