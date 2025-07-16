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
  const [currentPage, setCurrentPage] = useState(1);
  
  const photosPerPage = 50;

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

  // ページネーション計算
  const totalPages = Math.ceil(photos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const currentPhotos = photos.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
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
        {currentPhotos.map((photo) => (
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

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 mb-24">
          <div className="text-center text-sm text-gray-600 mb-4">
            {Math.min(startIndex + 1, photos.length)} - {Math.min(endIndex, photos.length)} / {photos.length}枚
          </div>
          <div className="flex justify-center items-center space-x-2">
            <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
          </div>
        </div>
      )}
      
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