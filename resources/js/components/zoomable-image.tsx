'use client';

import { useState, useEffect, useRef } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
    maxHeight?: string;
    onClick?: () => void;
}

export default function ZoomableImage({ src, alt, className = '', maxHeight = '300px', onClick }: ZoomableImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current || !isZoomed) return;

        const bounds = imageRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const xPercent = (x / bounds.width) * 100;
        const yPercent = (y / bounds.height) * 100;

        setPosition({ x: xPercent, y: yPercent });
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    useEffect(() => {
        if (imageRef.current && isZoomed) {
            imageRef.current.style.transformOrigin = `${position.x}% ${position.y}%`;
        }
    }, [position, isZoomed]);

    return (
        <div 
            ref={containerRef}
            className={`relative overflow-hidden cursor-zoom-in ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className={`max-w-full rounded-md transition-transform ${isZoomed ? 'scale-200' : 'hover:scale-105'} ${className}`}
                style={{ 
                    maxHeight, 
                    transformOrigin: `${position.x}% ${position.y}%`,
                    transform: isZoomed ? 'scale(2)' : 'scale(1)'
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            
            {onClick && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded">
                    Klik untuk memperbesar
                </div>
            )}
            
            {isZoomed && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded">
                    Gunakan mouse untuk melihat detail
                </div>
            )}
        </div>
    );
}
