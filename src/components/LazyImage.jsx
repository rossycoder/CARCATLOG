import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/dummy/red-car.png',
  width,
  height,
  onError,
  onClick
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc === placeholder && !hasError) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );
      
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, src, placeholder, hasError]);

  const handleError = () => {
    setHasError(true);
    setImageSrc(placeholder);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      width={width}
      height={height}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7,
        cursor: onClick ? 'pointer' : 'default'
      }}
    />
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onError: PropTypes.func,
  onClick: PropTypes.func
};

export default LazyImage;
