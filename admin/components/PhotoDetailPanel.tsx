'use client';

import { useEffect, useRef, useState } from 'react';
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
  onDelete: (photoId: string) => void;
}

const PhotoDetailPanel = ({ photo, isOpen, onClose, onDelete }: PhotoDetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const formatExposureTime = (value: any) => {
    if (typeof value === 'string' && value.includes('/')) {
      return value; // 既に分数表記の場合
    }
    
    const num = parseFloat(String(value));
    if (isNaN(num)) return String(value);
    
    if (num >= 1) {
      return `${num}s`;
    }
    
    // 1秒未満の場合、分数表記に変換
    const denominator = Math.round(1 / num);
    return `1/${denominator}s`;
  };

  const formatFocalLength = (value: any) => {
    const num = parseFloat(String(value));
    if (isNaN(num)) return String(value);
    return `${num}mm`;
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(photo.photo_id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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

            {/* EXIF情報 */}
            {photo.exif_data && (() => {
              const allowedKeys = ['Model', 'LensModel', 'FocalLength', 'FocalLengthIn35mmFilm', 'FNumber', 'ExposureTime', 'ISOSpeedRatings'];
              const filteredExif = Object.entries(photo.exif_data).filter(([key]) => allowedKeys.includes(key));
              return filteredExif.length > 0;
            })() && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">EXIF情報</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-1 text-sm">
                    {(() => {
                      const allowedKeys = ['Model', 'LensModel', 'FocalLength', 'FocalLengthIn35mmFilm', 'FNumber', 'ExposureTime', 'ISOSpeedRatings'];
                      return allowedKeys.filter(key => photo.exif_data?.[key] !== undefined).map(key => {
                        const value = photo.exif_data?.[key];
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="text-gray-800 text-right ml-2 break-all">
                              {key === 'ExposureTime' 
                                ? formatExposureTime(value)
                                : (key === 'FocalLength' || key === 'FocalLengthIn35mmFilm')
                                  ? formatFocalLength(value)
                                  : typeof value === 'object' ? JSON.stringify(value) : String(value)
                              }
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 削除ボタン */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleDeleteClick}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗑️</span>
                <span>この写真を削除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              写真を削除
            </h3>
            <p className="text-gray-600 mb-6">
              この写真を削除してもよろしいですか？<br />
              この操作は取り消すことができません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoDetailPanel;