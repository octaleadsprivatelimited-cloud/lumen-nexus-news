import { useState, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ImageCropDialog from './ImageCropDialog';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxSizeKB?: number;
  enableCropping?: boolean;
}

// Convert image to WebP and compress to target size
const compressToWebP = async (
  file: File | Blob,
  maxSizeKB: number = 200
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Start with original dimensions
      let width = img.width;
      let height = img.height;
      
      // Max dimension to prevent huge images
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

      // Binary search for optimal quality
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
        // First try highest quality
        let blob = await tryCompress(maxQuality);
        
        if (blob.size <= targetBytes) {
          resolve(blob);
          return;
        }

        // Binary search for optimal quality
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

        // If still too large, reduce dimensions
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
          
          // Final attempt with minimum settings
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
    
    if (file instanceof File) {
      img.src = URL.createObjectURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
};

export const ImageUpload = ({
  value,
  onChange,
  folder = 'uploads',
  className,
  aspectRatio = 'video',
  maxSizeKB = 200,
  enableCropping = true,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  
  // Cropping state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('image');

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Accepted: PNG, JPG, JPEG, WEBP, GIF';
    }
    
    // Max 20MB upload (before compression)
    if (file.size > 20 * 1024 * 1024) {
      return 'File too large. Maximum size is 20MB';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setCompressionProgress(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setOriginalFileName(file.name);

    if (enableCropping) {
      // Show crop dialog
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImageSrc(reader.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct upload without cropping
      uploadImage(file);
    }
  };

  const uploadImage = async (fileOrBlob: File | Blob) => {
    setIsUploading(true);

    try {
      // Compress to WebP client-side
      setCompressionProgress('Converting to WebP...');
      const compressedBlob = await compressToWebP(fileOrBlob, maxSizeKB);
      
      const originalSizeKB = Math.round(fileOrBlob.size / 1024);
      const compressedSizeKB = Math.round(compressedBlob.size / 1024);
      
      setCompressionProgress(`Compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      
      // Create a new File from the blob
      const webpFile = new File(
        [compressedBlob], 
        originalFileName.replace(/\.[^/.]+$/, '') + '.webp',
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

  const handleCropComplete = (croppedBlob: Blob) => {
    setShowCropDialog(false);
    setSelectedImageSrc(null);
    uploadImage(croppedBlob);
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    setSelectedImageSrc(null);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [enableCropping, folder, maxSizeKB]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  }[aspectRatio];

  const cropAspectPreset = {
    square: 'square' as const,
    video: 'video' as const,
    wide: 'wide' as const,
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
    <>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          error ? 'border-destructive' : '',
          aspectRatioClass,
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
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
                  {enableCropping ? 'Crop & resize • ' : ''}Auto WebP • Max {maxSizeKB}KB
                </p>
                {error && (
                  <p className="text-xs text-destructive mt-2">{error}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedImageSrc && (
        <ImageCropDialog
          open={showCropDialog}
          onClose={handleCropCancel}
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          aspectRatioPreset={cropAspectPreset}
        />
      )}
    </>
  );
};

export default ImageUpload;