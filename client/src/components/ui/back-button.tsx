import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  to?: string; // Optional destination path
  label?: string; // Optional custom label
  className?: string;
}

export function BackButton({ to, label = "Back", className }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`mb-4 pl-0 hover:bg-transparent ${className}`}
      onClick={handleClick}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}