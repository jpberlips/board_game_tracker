import React, { useState } from 'react';

const FileUpload = ({ 
  accept, 
  onFileUpload, 
  currentFile, 
  onRemove, 
  label, 
  maxSize = 16 * 1024 * 1024, // 16MB default
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file) => {
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      const fieldName = accept.includes('image') ? 'photo' : 'pdf';
      formData.append(fieldName, file);

      const endpoint = accept.includes('image') ? '/api/upload/photo' : '/api/upload/rulebook';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        onFileUpload(result.file_path, result.url);
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getFileIcon = () => {
    if (accept.includes('image')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const getAcceptText = () => {
    if (accept.includes('image')) {
      return 'PNG, JPG, JPEG, GIF, WEBP';
    } else {
      return 'PDF files only';
    }
  };

  if (currentFile) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-green-600 dark:text-green-400">
              {getFileIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                File uploaded successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {currentFile.split('/').pop()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="cursor-pointer"
        >
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            {getFileIcon()}
          </div>
          {uploading ? (
            <div className="space-y-2">
              <div className="text-blue-600 dark:text-blue-400">Uploading...</div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '50%'}}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {getAcceptText()} (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUpload;