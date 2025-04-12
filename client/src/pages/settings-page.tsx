import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

export default function SettingsPage() {
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    portfolio: true,
    security: true,
    marketing: false,
  });

  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSavePassword = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Settings</h1>

              <Tabs defaultValue="notifications">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="api">API Access</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-slate-500">Receive email updates about account activity</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.email} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Portfolio Alerts</Label>
                          <p className="text-sm text-slate-500">Get alerted about significant changes in your portfolio</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.portfolio} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, portfolio: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Security Notifications</Label>
                          <p className="text-sm text-slate-500">Receive alerts about security-related events</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.security} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, security: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Marketing Updates</Label>
                          <p className="text-sm text-slate-500">Receive updates about new features and promotions</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.marketing} 
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketing: checked})}
                        />
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleSavePassword}>Update Password</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-slate-500">Toggle between light and dark mode</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-refresh Data</Label>
                          <p className="text-sm text-slate-500">Automatically refresh market data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button>Save Preferences</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Add API settings here */}
                      <p>API settings will go here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}