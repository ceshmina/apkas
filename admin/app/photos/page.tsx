'use client';

import { useState, useEffect } from 'react';
import PhotoGrid from '@/components/PhotoGrid';

interface Photo {
  photo_id: string;
  original_key?: string;
  original_file?: {
    key: string;
    size: number;
  };
  resized_files: {
    thumbnail: {
      key: string;
      dimensions: { width: number; height: number };
      size: number;
    };
    medium: {
      key: string;
      dimensions: { width: number; height: number };
      size: number;
    };
    large: {
      key: string;
      dimensions: { width: number; height: number };
      size: number;
    };
  };
  exif_data?: {
    [key: string]: any;
  };
  created_at: string;
  date_taken?: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data.photos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">写真</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">写真</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">写真</h1>
        <p className="text-sm md:text-base text-gray-600">{photos.length}枚の写真</p>
      </div>
      <PhotoGrid photos={photos} />
    </div>
  );
}