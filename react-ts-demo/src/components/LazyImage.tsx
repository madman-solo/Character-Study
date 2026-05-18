import { useRef, useEffect, useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
}

const LazyImage = ({
  src,
  placeholder = "",
  alt,
  ...props
}: LazyImageProps) => {
  const [loaded, setSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      //回调函数：监听目标发生变化时触发
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }, //预加载200px，元素距离视口还有200px时触发加载，避免用户看到空白等待
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={loaded} alt={alt} {...props} />;
};

export default LazyImage;
