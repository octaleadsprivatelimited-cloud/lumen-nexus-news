import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, Mail, Bell, Shield, Palette, Clock, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLastPing, useManualPing } from '@/hooks/usePingStatus';

const SettingsPage = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '9knowledge',
    siteDescription: 'Your trusted source for insightful articles on technology, health, business, and more.',
    siteUrl: 'https://9knowledge.com',
    logo: '',
    favicon: '',
    contactEmail: 'info@9knowledge.com',
    supportEmail: 'support@9knowledge.com',
  });

  const [seoSettings, setSeoSettings] = useState({
    defaultMetaTitle: '9knowledge - Knowledge Portal',
    defaultMetaDescription: 'Discover insightful articles on technology, health, business, and more.',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    facebookPixelId: '',
  });

  const [socialSettings, setSocialSettings] = useState({
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    youtube: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewSubscriber: true,
    emailNewComment: true,
    emailWeeklyReport: true,
    browserNotifications: false,
  });

  const handleSave = (section: string) => {
    toast({ title: `${section} settings saved successfully` });
  };

  const KEEP_ALIVE_URL = 'https://ycsvgcvrknipvvrbjond.supabase.co/functions/v1/keep-alive';

  const KeepAliveSettings = () => {
    const { data: lastPing } = useLastPing();
    const { mutate: triggerPing, isPending } = useManualPing();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(KEEP_ALIVE_URL);
      setCopied(true);
      toast({ title: 'URL copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Backend Keep-Alive Configuration
            </CardTitle>
            <CardDescription>
              Keep your backend active by setting up automatic pings every 12 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-sm text-muted-foreground">
                    Last ping: {lastPing?.pinged_at 
                      ? new Date(lastPing.pinged_at).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
                <Badge variant={lastPing?.status === 'success' ? 'default' : 'secondary'}>
                  {lastPing?.status === 'success' ? 'Healthy' : 'No Data'}
                </Badge>
              </div>
            </div>

            {/* Endpoint URL */}
            <div className="space-y-2">
              <Label>Keep-Alive Endpoint URL</Label>
              <div className="flex gap-2">
                <Input 
                  value={KEEP_ALIVE_URL} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this URL in your external cron service
              </p>
            </div>

            {/* Test Button */}
            <Button 
              onClick={() => triggerPing()} 
              disabled={isPending}
              variant="outline"
            >
              {isPending ? 'Pinging...' : 'Test Ping Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions (cron-job.org)</CardTitle>
            <CardDescription>
              Follow these steps to set up automatic 12-hour pings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li className="space-y-1">
                <span className="font-medium">Create a free account at cron-job.org</span>
                <div className="ml-6">
                  <a 
                    href="https://cron-job.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Go to cron-job.org <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </li>
              
              <li className="space-y-1">
                <span className="font-medium">Click "Create cronjob" after logging in</span>
              </li>
              
              <li className="space-y-2">
                <span className="font-medium">Configure the cron job with these settings:</span>
                <div className="ml-6 p-3 bg-muted rounded-lg space-y-2 font-mono text-xs">
                  <div><span className="text-muted-foreground">Title:</span> 9knowledge Keep-Alive</div>
                  <div><span className="text-muted-foreground">URL:</span> {KEEP_ALIVE_URL}</div>
                  <div><span className="text-muted-foreground">Schedule:</span> Every 12 hours</div>
                  <div><span className="text-muted-foreground">Method:</span> POST</div>
                </div>
              </li>
              
              <li className="space-y-1">
                <span className="font-medium">Set the schedule to "Every 12 hours"</span>
                <div className="ml-6 text-muted-foreground">
                  Or use cron expression: <code className="bg-muted px-1 rounded">0 */12 * * *</code>
                </div>
              </li>
              
              <li className="space-y-1">
                <span className="font-medium">Save and enable the cron job</span>
              </li>
            </ol>

            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Important
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Free-tier databases may sleep after 7 days of inactivity. 
                This keep-alive ping ensures your database stays active.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Services */}
        <Card>
          <CardHeader>
            <CardTitle>Alternative Cron Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <a 
                href="https://www.easycron.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>EasyCron</span>
              </a>
              <a 
                href="https://uptimerobot.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>UptimeRobot</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="keepalive" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Keep-Alive</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic site configuration and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={generalSettings.siteUrl}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={generalSettings.logo}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      value={generalSettings.favicon}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, favicon: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
                  <Input
                    id="defaultMetaTitle"
                    value={seoSettings.defaultMetaTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultMetaTitle: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Used when pages don't have a custom title</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
                  <Textarea
                    id="defaultMetaDescription"
                    value={seoSettings.defaultMetaDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultMetaDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleSearchConsoleId">Google Search Console ID</Label>
                    <Input
                      id="googleSearchConsoleId"
                      value={seoSettings.googleSearchConsoleId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleSearchConsoleId: e.target.value })}
                      placeholder="Verification code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXXXX"
                  />
                </div>

                <Button onClick={() => handleSave('SEO')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={socialSettings.twitter}
                      onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialSettings.facebook}
                      onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialSettings.linkedin}
                      onChange={(e) => setSocialSettings({ ...socialSettings, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialSettings.instagram}
                      onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialSettings.youtube}
                      onChange={(e) => setSocialSettings({ ...socialSettings, youtube: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Social')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email templates and SMTP settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Email configuration is managed through Lovable Cloud. 
                    Contact support for custom email template changes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Email Templates</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Welcome Email</p>
                        <p className="text-sm text-muted-foreground">Sent to new subscribers</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Newsletter</p>
                        <p className="text-sm text-muted-foreground">Weekly digest template</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Password Reset</p>
                        <p className="text-sm text-muted-foreground">Account recovery email</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Subscriber</p>
                      <p className="text-sm text-muted-foreground">Get notified when someone subscribes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNewSubscriber}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNewSubscriber: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Comment</p>
                      <p className="text-sm text-muted-foreground">Get notified on new article comments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNewComment}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNewComment: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics summary</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailWeeklyReport}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailWeeklyReport: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Browser Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, browserNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keepalive">
            <KeepAliveSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
