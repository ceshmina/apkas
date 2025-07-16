'use client';

import { useState, useCallback, useEffect } from 'react';

interface PhotoUploadProps {
  onUploadSuccess: () => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
  timestamp: number;
}

interface ConfirmationState {
  isOpen: boolean;
  files: File[];
}

const PhotoUpload = ({ onUploadSuccess }: PhotoUploadProps) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    files: []
  });


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

    // 確認ダイアログを表示
    setConfirmation({
      isOpen: true,
      files: imageFiles
    });
  }, []);

  const uploadFile = async (file: File) => {
    const fileName = file.name;
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // アップロード状態を初期化
    setUploads(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading',
      id: uploadId,
      timestamp: Date.now()
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
        upload.id === uploadId 
          ? { ...upload, progress: 100, status: 'success', timestamp: Date.now() }
          : upload
      ));

      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'error', timestamp: Date.now() }
          : upload
      ));
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const handleConfirmUpload = () => {
    confirmation.files.forEach(file => uploadFile(file));
    setConfirmation({ isOpen: false, files: [] });
  };

  const handleCancelUpload = () => {
    setConfirmation({ isOpen: false, files: [] });
  };

  // 自動削除: 成功・エラー状態の通知を5秒後に削除
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setUploads(prev => prev.filter(upload => {
        if (upload.status === 'uploading') return true;
        return now - upload.timestamp < 5000; // 5秒
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* フロートボタン */}
      <div className="fixed bottom-6 right-6 z-40">
        <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full cursor-pointer transition-all shadow-lg hover:shadow-xl flex items-center space-x-2">
          <span className="text-xl">📸</span>
          <span className="font-medium whitespace-nowrap">
            写真を追加
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* 通知として表示 */}
      {uploads.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className={`bg-white rounded-lg shadow-lg border p-4 transform transition-all duration-300 ${
                upload.status === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : upload.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {upload.status === 'uploading' && 'アップロード中...'}
                    {upload.status === 'success' && '✅ アップロード完了'}
                    {upload.status === 'error' && '❌ アップロード失敗'}
                  </p>
                </div>
                <button
                  onClick={() => removeUpload(upload.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              {upload.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 確認ダイアログ */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              アップロード確認
            </h3>
            <p className="text-gray-600 mb-4">
              以下の{confirmation.files.length}個のファイルをアップロードしますか？
            </p>
            <div className="max-h-40 overflow-y-auto mb-6">
              <ul className="space-y-2">
                {confirmation.files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
              >
                アップロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;