import { useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import {
  Search,
  Loader2,
  Plus,
  UserPlus,
  Edit,
  Trash2,
  SlidersHorizontal,
  UserCog,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newSubscription, setNewSubscription] = useState("");
  
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "User information has been successfully updated.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewSubscription(user.subscriptionTier);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updates: Partial<User> = {};
    if (newRole !== editingUser.role) {
      updates.role = newRole;
    }
    if (newSubscription !== editingUser.subscriptionTier) {
      updates.subscriptionTier = newSubscription;
    }
    
    if (Object.keys(updates).length > 0) {
      updateUserMutation.mutate({ id: editingUser.id, data: updates });
    } else {
      setIsEditDialogOpen(false);
    }
  };
  
  const filteredUsers = users.filter(user => {
    // Filter by search query
    if (searchQuery && 
        !user.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by role
    if (roleFilter && user.role !== roleFilter) {
      return false;
    }
    
    // Filter by subscription tier
    if (subscriptionFilter && user.subscriptionTier !== subscriptionFilter) {
      return false;
    }
    
    return true;
  });
  
  // Get unique roles and subscription tiers for filters
  const roles = Array.from(new Set(users.map(user => user.role)));
  const subscriptionTiers = Array.from(new Set(users.map(user => user.subscriptionTier)));
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary-100 text-primary-700 border-primary-200";
      case "moderator":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  
  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "pro":
        return "bg-success/10 text-success border-success/20";
      case "enterprise":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>User Management | ProfitWise AI Admin</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-col">
          <Header />
          
          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">User Management</h1>
                <p className="text-slate-500">Manage user accounts, roles, and subscription plans</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-60">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Select 
                      value={roleFilter || ""} 
                      onValueChange={(value) => setRoleFilter(value || null)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <div className="flex items-center">
                          <UserCog className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Role" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={subscriptionFilter || ""} 
                      onValueChange={(value) => setSubscriptionFilter(value || null)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center">
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Subscription" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Subscriptions</SelectItem>
                        {subscriptionTiers.map(tier => (
                          <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(searchQuery || roleFilter || subscriptionFilter) && (
                      <Button variant="ghost" onClick={() => {
                        setSearchQuery("");
                        setRoleFilter(null);
                        setSubscriptionFilter(null);
                      }}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <UserCog className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-slate-500 mb-4">
                      {searchQuery 
                        ? "No users match your search criteria" 
                        : "There are no users to display"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getSubscriptionBadgeColor(user.subscriptionTier)}>
                                {user.subscriptionTier}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Username</p>
                    <p className="text-sm font-medium">{editingUser.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium">{editingUser.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Tier</label>
                <Select value={newSubscription} onValueChange={setNewSubscription}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
