import { useState, useEffect } from 'react';
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
import { Upload, Image, FileText, Film, Search, Grid, List, Copy, ExternalLink, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  path: string; // Full path including folder
  type: 'image' | 'document' | 'video';
  size: string;
  uploadedAt: string;
}

const MediaPage = () => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Fetch media from storage - from all folders
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const folders = ['uploads', 'articles'];
      const allItems: MediaItem[] = [];

      // Fetch from each folder
      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from('media')
          .list(folder, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) {
          // If folder doesn't exist, continue to next folder
          if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
            continue;
          }
          throw error;
        }

        const items: MediaItem[] = (data || [])
          .filter(file => file.name !== '.emptyFolderPlaceholder' && !file.name.endsWith('/'))
          .map(file => {
            const filePath = `${folder}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);
            
            return {
              id: file.id || `${folder}-${file.name}`,
              name: file.name,
              url: urlData.publicUrl,
              path: filePath,
              type: 'image' as const,
              size: formatFileSize(file.metadata?.size || 0),
              uploadedAt: file.created_at || new Date().toISOString(),
            };
          });

        allItems.push(...items);
      }

      // Sort by upload date (newest first)
      allItems.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setMediaItems(allItems);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([selectedMedia.path]);

      if (error) throw error;

      toast.success('File deleted successfully');
      setSelectedMedia(null);
      fetchMedia();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSuccess = (url: string) => {
    setUploadedUrl(url);
    fetchMedia();
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
            <p className="text-muted-foreground">Manage your uploaded images (WebP optimized)</p>
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No media files found</p>
            <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first image
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
                      loading="lazy"
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
                  <p className="text-xs text-muted-foreground/70 mt-1">{item.path.split('/')[0]}</p>
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
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    getTypeIcon(item.type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.size} • {format(new Date(item.uploadedAt), 'MMM d, yyyy')} • {item.path.split('/')[0]}
                  </p>
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
                  loading="lazy"
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
                  <p className="text-muted-foreground">Folder</p>
                  <p className="font-medium capitalize">{selectedMedia.path.split('/')[0]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{format(new Date(selectedMedia.uploadedAt), 'MMM d, yyyy')}</p>
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
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
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
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload images (PNG, JPG, WEBP). Files will be optimized automatically.
            </DialogDescription>
          </DialogHeader>
          
          <ImageUpload 
            value={uploadedUrl}
            onChange={handleUploadSuccess}
            folder="uploads"
            aspectRatio="video"
          />
          
          <p className="text-xs text-muted-foreground text-center">
            Max size: 300KB after compression • WebP format recommended
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              setUploadedUrl('');
            }}>
              {uploadedUrl ? 'Done' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default MediaPage;
