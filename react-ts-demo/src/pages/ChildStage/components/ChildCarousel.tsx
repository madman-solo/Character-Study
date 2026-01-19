import { useState, useEffect } from 'react';
import '../../../styles/ChildStageCss/ChildCarousel.css';

interface ChildCarouselProps {
  items: Array<{ id: string; image: string; title?: string }>;
  autoPlayInterval?: number;
  height?: string;
}

const ChildCarousel = ({
  items,
  autoPlayInterval = 3000,
  height = '400px'
}: ChildCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="child-carousel" style={{ height }}>
      <div className="child-carousel-inner">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`child-carousel-item ${
              index === currentIndex ? 'child-active' : ''
            }`}
          >
            <img
              src={item.image}
              alt={item.title || `Slide ${index + 1}`}
              className="child-carousel-image"
            />
            {item.title && (
              <div className="child-carousel-caption">
                {item.title}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="child-carousel-control child-carousel-prev"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="child-carousel-control child-carousel-next"
        onClick={goToNext}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className="child-carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`child-carousel-indicator ${
              index === currentIndex ? 'child-active' : ''
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ChildCarousel;
