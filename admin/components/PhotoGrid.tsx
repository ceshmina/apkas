'use client';

import Image from 'next/image';

interface Photo {
  photo_id: string;
  original_file: {
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
}

interface PhotoGridProps {
  photos: Photo[];
}

const PhotoGrid = ({ photos }: PhotoGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">写真がありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <div key={photo.photo_id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <Image
              src={`/api/photos/${photo.photo_id}/thumbnail`}
              alt={`Photo ${photo.photo_id}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
            />
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-500 truncate">
              {photo.original_file?.key || photo.photo_id}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {photo.created_at ? new Date(photo.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '日時不明'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;