// src/components/LazyImage.jsx
import { useEffect, useRef, useState } from 'react';

// SVG placeholder — green leaf on light bg
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e8f5ec'/%3E%3Cpath d='M200 80c-40 20-70 60-60 110 10-30 40-60 60-70-20 30-25 65-15 90 5-40 30-70 50-80-15 30-15 65-5 90 40-50 40-120-30-140z' fill='%2352b788' opacity='0.5'/%3E%3C/svg%3E`;

/**
 * Lazy-loaded image with blur-up reveal and green placeholder.
 * Props: src, alt, className, style, aspectRatio (e.g. "4/3")
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  style = {},
  aspectRatio = '4/3',
  borderRadius = '0',
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '200px' }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        background: '#e8f5ec',
        borderRadius,
        ...style,
      }}
    >
      {/* Shimmer placeholder (shown until image loads) */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #e8f5ec 25%, #d4edd8 50%, #e8f5ec 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}>
          {/* Leaf icon centered */}
          <svg
            viewBox="0 0 24 24"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.3 }}
            width="48" height="48" fill="#2d6a4f"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>
          </svg>
        </div>
      )}

      {/* Actual image — loads when in viewport */}
      {(inView || !src) && !error && (
        <img
          src={src || PLACEHOLDER_SVG}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.4s ease, filter 0.4s ease',
            opacity: loaded ? 1 : 0,
            filter: loaded ? 'blur(0)' : 'blur(8px)',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Error state */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#e8f5ec', gap: '8px',
        }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="#52b788" opacity="0.6">
            <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z"/>
          </svg>
          <span style={{ fontSize: '12px', color: '#52b788', opacity: 0.8 }}>Sin imagen</span>
        </div>
      )}
    </div>
  );
}
