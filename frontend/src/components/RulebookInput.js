import React, { useState } from 'react';
import FileUpload from './FileUpload';

const RulebookInput = ({ 
  onFileUpload, 
  onUrlChange,
  currentFile, 
  currentUrl,
  onRemoveFile,
  onRemoveUrl,
  className = "" 
}) => {
  const [inputType, setInputType] = useState(currentFile ? 'file' : currentUrl ? 'url' : 'file');
  const [urlInput, setUrlInput] = useState(currentUrl || '');

  const handleTypeChange = (type) => {
    setInputType(type);
    // Clear the other input when switching types
    if (type === 'file' && currentUrl) {
      onRemoveUrl();
      setUrlInput('');
    } else if (type === 'url' && currentFile) {
      onRemoveFile();
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlChange(urlInput.trim());
    }
  };

  const handleUrlInputChange = (e) => {
    setUrlInput(e.target.value);
    // Auto-submit when user finishes typing (debounced)
    if (e.target.value.trim()) {
      clearTimeout(window.rulebookUrlTimeout);
      window.rulebookUrlTimeout = setTimeout(() => {
        onUrlChange(e.target.value.trim());
      }, 1000);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Rulebook (optional)
      </label>
      
      {/* Type selector */}
      <div className="flex space-x-4 mb-3">
        <label className="flex items-center">
          <input
            type="radio"
            name="rulebook-type"
            value="file"
            checked={inputType === 'file'}
            onChange={() => handleTypeChange('file')}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Upload PDF</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="rulebook-type"
            value="url"
            checked={inputType === 'url'}
            onChange={() => handleTypeChange('url')}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Link to PDF</span>
        </label>
      </div>

      {/* File upload */}
      {inputType === 'file' && (
        <FileUpload
          accept="application/pdf"
          onFileUpload={onFileUpload}
          currentFile={currentFile}
          onRemove={onRemoveFile}
          label=""
          maxSize={16 * 1024 * 1024}
        />
      )}

      {/* URL input */}
      {inputType === 'url' && (
        <div>
          {currentUrl ? (
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    PDF Link Added
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 break-all">
                    {currentUrl}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveUrl}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlInputChange}
                  placeholder="https://example.com/rulebook.pdf"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || !isValidUrl(urlInput)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {urlInput && !isValidUrl(urlInput) && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Please enter a valid URL (starting with http:// or https://)
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter a direct link to a PDF rulebook online
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RulebookInput;