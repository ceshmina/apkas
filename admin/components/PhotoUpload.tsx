'use client';

import { useState, useCallback } from 'react';

interface PhotoUploadProps {
  onUploadSuccess: () => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

const PhotoUpload = ({ onUploadSuccess }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/jpg'].includes(file.type.toLowerCase())
    );

    if (imageFiles.length === 0) {
      alert('JPEGファイルを選択してください');
      return;
    }

    imageFiles.forEach(file => uploadFile(file));
  }, []);

  const uploadFile = async (file: File) => {
    const fileName = file.name;
    
    // アップロード状態を初期化
    setUploads(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // アップロード成功
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { ...upload, progress: 100, status: 'success' }
          : upload
      ));

      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { ...upload, status: 'error' }
          : upload
      ));
    }
  };

  const clearUploads = () => {
    setUploads([]);
  };

  return (
    <div className="mb-6">
      {/* アップロードエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">📸</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              写真をドラッグ&ドロップするか、クリックして選択
            </p>
            <p className="text-sm text-gray-500 mt-1">
              JPEGファイルのみ対応
            </p>
          </div>
          <div>
            <label className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
              ファイルを選択
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* アップロード状況表示 */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">アップロード状況</h3>
            <button
              onClick={clearUploads}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              クリア
            </button>
          </div>
          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {upload.fileName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {upload.status === 'uploading' && 'アップロード中...'}
                    {upload.status === 'success' && '✅ 完了'}
                    {upload.status === 'error' && '❌ エラー'}
                  </span>
                </div>
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;