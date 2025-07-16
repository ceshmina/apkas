'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

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

interface PhotoDetailPanelProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
}

const PhotoDetailPanel = ({ photo, isOpen, onClose }: PhotoDetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESCキーでパネルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 背景クリックでパネルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFileName = () => {
    const originalKey = photo.original_key || photo.original_file?.key;
    if (originalKey) {
      return originalKey.split('/').pop() || originalKey;
    }
    return photo.photo_id;
  };

  const getDisplayDate = () => {
    const displayDate = photo.date_taken || photo.created_at;
    if (displayDate) {
      return new Date(displayDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '日時不明';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex"
      onClick={handleBackgroundClick}
    >
      {/* デスクトップ: 右側パネル */}
      <div className="hidden md:block flex-1" onClick={handleBackgroundClick} />
      <div
        ref={panelRef}
        className={`bg-white md:w-[480px] w-full h-full md:shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen 
            ? 'translate-x-0' 
            : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">写真詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 写真表示 */}
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={`/api/photos/${photo.photo_id}/medium`}
                alt={`Photo ${photo.photo_id}`}
                width={photo.resized_files?.medium?.dimensions?.width || 600}
                height={photo.resized_files?.medium?.dimensions?.height || 400}
                className="w-full h-auto object-contain"
                sizes="480px"
              />
            </div>
          </div>

          {/* 基本情報 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">ファイル名</h3>
              <p className="text-gray-800 break-all">{getFileName()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">撮影日時</h3>
              <p className="text-gray-800">{getDisplayDate()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">写真ID</h3>
              <p className="text-gray-800 font-mono text-sm">{photo.photo_id}</p>
            </div>

            {/* ファイルサイズ情報 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">ファイルサイズ</h3>
              <div className="space-y-1 text-sm">
                {photo.original_file?.size && (
                  <div className="flex justify-between">
                    <span>オリジナル:</span>
                    <span>{formatFileSize(photo.original_file.size)}</span>
                  </div>
                )}
                {photo.resized_files?.large?.size && (
                  <div className="flex justify-between">
                    <span>大:</span>
                    <span>{formatFileSize(photo.resized_files.large.size)}</span>
                  </div>
                )}
                {photo.resized_files?.medium?.size && (
                  <div className="flex justify-between">
                    <span>中:</span>
                    <span>{formatFileSize(photo.resized_files.medium.size)}</span>
                  </div>
                )}
                {photo.resized_files?.thumbnail?.size && (
                  <div className="flex justify-between">
                    <span>サムネイル:</span>
                    <span>{formatFileSize(photo.resized_files.thumbnail.size)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 画像サイズ情報 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">画像サイズ</h3>
              <div className="space-y-1 text-sm">
                {photo.resized_files?.large?.dimensions && (
                  <div className="flex justify-between">
                    <span>大:</span>
                    <span>{photo.resized_files.large.dimensions.width} × {photo.resized_files.large.dimensions.height}</span>
                  </div>
                )}
                {photo.resized_files?.medium?.dimensions && (
                  <div className="flex justify-between">
                    <span>中:</span>
                    <span>{photo.resized_files.medium.dimensions.width} × {photo.resized_files.medium.dimensions.height}</span>
                  </div>
                )}
                {photo.resized_files?.thumbnail?.dimensions && (
                  <div className="flex justify-between">
                    <span>サムネイル:</span>
                    <span>{photo.resized_files.thumbnail.dimensions.width} × {photo.resized_files.thumbnail.dimensions.height}</span>
                  </div>
                )}
              </div>
            </div>

            {/* EXIF情報 */}
            {photo.exif_data && Object.keys(photo.exif_data).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">EXIF情報</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-1 text-sm">
                    {Object.entries(photo.exif_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="text-gray-800 text-right ml-2 break-all">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPanel;