import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FileText, Eye, FolderOpen, Users, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your admin dashboard</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Articles"
            value={analytics?.totalArticles || 0}
            icon={FileText}
            description={`${analytics?.publishedArticles || 0} published`}
          />
          <StatCard
            title="Total Views"
            value={analytics?.totalViews?.toLocaleString() || 0}
            icon={Eye}
          />
          <StatCard
            title="Categories"
            value={analytics?.categoryCount || 0}
            icon={FolderOpen}
          />
          <StatCard
            title="Subscribers"
            value={analytics?.subscriberCount || 0}
            icon={Users}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Articles
              </CardTitle>
              <CardDescription>Your latest content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentArticles?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No articles yet.{' '}
                    <Link to="/admin/articles/new" className="text-primary hover:underline">
                      Create your first article
                    </Link>
                  </p>
                ) : (
                  analytics?.recentArticles?.map((article: any) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/admin/articles/${article.id}`}
                          className="text-sm font-medium hover:text-primary truncate block"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {article.category?.name}
                        </p>
                      </div>
                      <Badge
                        variant={
                          article.status === 'published'
                            ? 'default'
                            : article.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {article.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Link
                  to="/admin/articles/new"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">New Article</p>
                    <p className="text-xs text-muted-foreground">
                      Create a new blog post
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/categories"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Manage Categories</p>
                    <p className="text-xs text-muted-foreground">
                      Add or edit categories
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
