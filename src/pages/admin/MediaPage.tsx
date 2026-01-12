import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, FileText, Film, Search, Grid, List, Copy, ExternalLink, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: string;
  uploadedAt: string;
}

// Mock media data - in production this would come from Supabase Storage
const mockMedia: MediaItem[] = [
  {
    id: '1',
    name: 'hero-image.jpg',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    type: 'image',
    size: '245 KB',
    uploadedAt: '2025-01-10',
  },
  {
    id: '2',
    name: 'tech-article.jpg',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    type: 'image',
    size: '180 KB',
    uploadedAt: '2025-01-09',
  },
  {
    id: '3',
    name: 'health-wellness.jpg',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    type: 'image',
    size: '312 KB',
    uploadedAt: '2025-01-08',
  },
  {
    id: '4',
    name: 'business-meeting.jpg',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    type: 'image',
    size: '198 KB',
    uploadedAt: '2025-01-07',
  },
];

const MediaPage = () => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredMedia = mockMedia.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copied to clipboard' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <Film className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">Manage your uploaded files and images</p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Tabs value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
                <TabsTrigger value="document">Documents</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Media Grid/List */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No media files found</p>
            <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first file
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square bg-muted relative">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {filteredMedia.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    getTypeIcon(item.type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.size} • {item.uploadedAt}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
            <DialogDescription>File details and actions</DialogDescription>
          </DialogHeader>
          
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.type === 'image' && (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.name}
                  className="w-full rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">File name</p>
                  <p className="font-medium">{selectedMedia.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File size</p>
                  <p className="font-medium">{selectedMedia.size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedMedia.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{selectedMedia.uploadedAt}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">URL</p>
                <div className="flex gap-2">
                  <Input value={selectedMedia.url} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => handleCopyUrl(selectedMedia.url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="destructive" size="sm">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setSelectedMedia(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>Upload images, documents, or videos</DialogDescription>
          </DialogHeader>
          
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium mb-1">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Button variant="outline">Browse Files</Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supports: JPG, PNG, GIF, PDF, DOC, MP4 (max 10MB)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default MediaPage;
