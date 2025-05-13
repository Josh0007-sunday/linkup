// ImageUploadButton.tsx
import React, { useState } from 'react';

interface ImageUploadButtonProps {
  onUpload: (url: string) => void;
  className?: string;
  children: React.ReactNode;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onUpload, className, children }) => {
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onUpload(imageUrl);
      setImageUrl('');
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {children}
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Image
        </button>
      </form>
    </div>
  );
};

export default ImageUploadButton;