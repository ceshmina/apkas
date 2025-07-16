'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhotoDetailPanel from './PhotoDetailPanel';

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

interface PhotoGridProps {
  photos: Photo[];
  onPhotoDelete: (photoId: string) => void;
}

const PhotoGrid = ({ photos, onPhotoDelete }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPhoto(null);
  };

  const handlePhotoDelete = (photoId: string) => {
    onPhotoDelete(photoId);
    handleCloseDetail();
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">写真がありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.photo_id} 
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePhotoClick(photo)}
          >
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <Image
              src={`/api/photos/${photo.photo_id}/thumbnail`}
              alt={`Photo ${photo.photo_id}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          </div>
          <div className="p-2 md:p-3">
            <p className="text-xs text-gray-500 truncate">
              {(() => {
                // original_keyまたはoriginal_file.keyからファイル名を抽出
                const originalKey = photo.original_key || photo.original_file?.key;
                if (originalKey) {
                  // "path/to/filename.ext" から "filename.ext" を抽出
                  return originalKey.split('/').pop() || originalKey;
                }
                return photo.photo_id;
              })()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {(() => {
                // 撮影時刻を優先、なければ保存時刻を使用
                const displayDate = photo.date_taken || photo.created_at;
                if (displayDate) {
                  return new Date(displayDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                }
                return '日時不明';
              })()}
            </p>
          </div>
          </div>
        ))}
      </div>
      
      {selectedPhoto && (
        <PhotoDetailPanel
          photo={selectedPhoto}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onDelete={handlePhotoDelete}
        />
      )}
    </>
  );
};

export default PhotoGrid;