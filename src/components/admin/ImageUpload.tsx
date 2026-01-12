import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxSizeKB?: number;
}

// Convert image to WebP and compress to target size
const compressToWebP = async (
  file: File,
  maxSizeKB: number = 200
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      const MAX_DIMENSION = 2048;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const targetBytes = maxSizeKB * 1024;
      let minQuality = 0.1;
      let maxQuality = 1.0;
      let bestBlob: Blob | null = null;
      let iterations = 0;
      const maxIterations = 10;

      const tryCompress = (quality: number): Promise<Blob> => {
        return new Promise((res) => {
          canvas.toBlob(
            (blob) => res(blob!),
            'image/webp',
            quality
          );
        });
      };

      const findOptimalQuality = async () => {
        let blob = await tryCompress(maxQuality);
        
        if (blob.size <= targetBytes) {
          resolve(blob);
          return;
        }

        while (iterations < maxIterations && maxQuality - minQuality > 0.05) {
          iterations++;
          const midQuality = (minQuality + maxQuality) / 2;
          blob = await tryCompress(midQuality);
          
          if (blob.size <= targetBytes) {
            bestBlob = blob;
            minQuality = midQuality;
          } else {
            maxQuality = midQuality;
          }
        }

        if (!bestBlob || bestBlob.size > targetBytes) {
          let scale = 0.9;
          while (scale > 0.3) {
            const newWidth = Math.round(width * scale);
            const newHeight = Math.round(height * scale);
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            blob = await tryCompress(0.85);
            if (blob.size <= targetBytes) {
              resolve(blob);
              return;
            }
            scale -= 0.1;
          }
          
          canvas.width = Math.round(width * 0.3);
          canvas.height = Math.round(height * 0.3);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          blob = await tryCompress(0.7);
          resolve(blob);
          return;
        }

        resolve(bestBlob);
      };

      findOptimalQuality().catch(reject);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const ImageUpload = ({
  value,
  onChange,
  folder = 'uploads',
  className,
  aspectRatio = 'video',
  maxSizeKB = 200,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Accepted: PNG, JPG, JPEG, WEBP, GIF';
    }
    
    if (file.size > 20 * 1024 * 1024) {
      return 'File too large. Maximum size is 20MB';
    }
    
    return null;
  };

  const uploadImage = async (file: File) => {
    setError(null);
    setCompressionProgress(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsUploading(true);

    try {
      setCompressionProgress('Converting to WebP...');
      const compressedBlob = await compressToWebP(file, maxSizeKB);
      
      const originalSizeKB = Math.round(file.size / 1024);
      const compressedSizeKB = Math.round(compressedBlob.size / 1024);
      
      setCompressionProgress(`Compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      
      const webpFile = new File(
        [compressedBlob], 
        file.name.replace(/\.[^/.]+$/, '') + '.webp',
        { type: 'image/webp' }
      );

      const formData = new FormData();
      formData.append('file', webpFile);
      formData.append('folder', folder);

      setCompressionProgress('Uploading...');
      
      const { data, error: invokeError } = await supabase.functions.invoke('process-image', {
        body: formData,
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onChange(data.url);
      toast.success(`Image uploaded (${compressedSizeKB}KB WebP)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      setCompressionProgress(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImage(e.dataTransfer.files[0]);
    }
  }, [folder, maxSizeKB]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const aspectRatioClass = {
    square: 'aspect-square max-h-48 sm:max-h-64',
    video: 'aspect-video max-h-40 sm:max-h-52',
    wide: 'aspect-[21/9] max-h-32 sm:max-h-40',
  }[aspectRatio];

  if (value) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden border', aspectRatioClass, className)}>
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        error ? 'border-destructive' : '',
        isUploading ? 'cursor-wait' : '',
        aspectRatioClass,
        className
      )}
      onClick={handleUploadClick}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleChange}
        disabled={isUploading}
        className="hidden"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 pointer-events-none">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {compressionProgress || 'Processing...'}
            </p>
          </>
        ) : (
          <>
            {error ? (
              <AlertCircle className="h-8 w-8 text-destructive" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragActive ? 'Drop image here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Auto WebP • Max {maxSizeKB}KB
              </p>
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;