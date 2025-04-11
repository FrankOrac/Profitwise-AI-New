import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EducationalContent } from "@shared/schema";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EducationManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<EducationalContent | null>(null);
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery<EducationalContent[]>({
    queryKey: ["/api/education"],
  });

  const addMutation = useMutation({
    mutationFn: async (newContent: Partial<EducationalContent>) => {
      const response = await fetch("/api/admin/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      });
      if (!response.ok) throw new Error("Failed to add content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      setIsAddDialogOpen(false);
      toast({ title: "Content added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (content: EducationalContent) => {
      const response = await fetch(`/api/admin/education/${content.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      setEditingContent(null);
      toast({ title: "Content updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/education/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete content");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      toast({ title: "Content deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      difficulty: formData.get("difficulty") as string,
      duration: formData.get("duration") as string,
      instructor: formData.get("instructor") as string,
      imageUrl: formData.get("imageUrl") as string,
      videoUrl: formData.get("videoUrl") as string,
      accessTier: formData.get("accessTier") as string,
    };

    if (editingContent) {
      updateMutation.mutate({ ...data, id: editingContent.id } as EducationalContent);
    } else {
      addMutation.mutate(data);
    }
  };

  return (
    <>
      <Helmet>
        <title>Education Management | ProfitWise AI</title>
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-col">
          <Header />

          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Education Management</h1>
                <p className="text-slate-500">Manage educational content and resources</p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingContent ? "Edit Content" : "Add New Content"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Input
                      name="title"
                      placeholder="Title"
                      defaultValue={editingContent?.title}
                      required
                    />
                    <Textarea
                      name="description"
                      placeholder="Description"
                      defaultValue={editingContent?.description}
                      required
                    />
                    <Select name="category" defaultValue={editingContent?.category || "INVESTING"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INVESTING">Investing</SelectItem>
                        <SelectItem value="CRYPTOCURRENCY">Cryptocurrency</SelectItem>
                        <SelectItem value="ANALYSIS">Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select name="difficulty" defaultValue={editingContent?.difficulty || "Beginner"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      name="duration"
                      placeholder="Duration (e.g., 15 min)"
                      defaultValue={editingContent?.duration}
                      required
                    />
                    <Input
                      name="instructor"
                      placeholder="Instructor name"
                      defaultValue={editingContent?.instructor}
                      required
                    />
                    <Input
                      name="imageUrl"
                      placeholder="Image URL"
                      defaultValue={editingContent?.imageUrl}
                    />
                    <Input
                      name="videoUrl"
                      placeholder="Video URL"
                      defaultValue={editingContent?.videoUrl}
                    />
                    <Select name="accessTier" defaultValue={editingContent?.accessTier || "basic"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Access Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" className="w-full">
                      {editingContent ? "Update Content" : "Add Content"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                content.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingContent(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Category:</span> {item.category}
                          </div>
                          <div>
                            <span className="font-medium">Difficulty:</span> {item.difficulty}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {item.duration}
                          </div>
                          <div>
                            <span className="font-medium">Access:</span> {item.accessTier}
                          </div>
                          <div>
                            <span className="font-medium">Instructor:</span> {item.instructor}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}