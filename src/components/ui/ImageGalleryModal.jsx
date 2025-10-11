import React, { useState } from 'react';
import Modal from './Modal';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from './Button';

const ImageGalleryModal = ({ isOpen, onClose, images, title, currentIndex = 0 }) => {
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  if (!images?.length) return null;

  const currentImage = images?.[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex(prev => prev === 0 ? images?.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setSelectedIndex(prev => prev === images?.length - 1 ? 0 : prev + 1);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="xl"
    >
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <Image
            src={currentImage?.url || currentImage}
            alt={currentImage?.alt || `Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {/* Navigation Buttons */}
          {images?.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
              >
                <Icon name="ChevronLeft" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
              >
                <Icon name="ChevronRight" size={20} />
              </Button>
            </>
          )}
          
          {/* Image Counter */}
          {images?.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
              {selectedIndex + 1} / {images?.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images?.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === selectedIndex 
                    ? 'border-primary' :'border-border hover:border-muted-foreground'
                }`}
              >
                <Image
                  src={image?.url || image}
                  alt={image?.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Details */}
        {currentImage?.description && (
          <div className="text-sm text-muted-foreground">
            {currentImage?.description}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageGalleryModal;