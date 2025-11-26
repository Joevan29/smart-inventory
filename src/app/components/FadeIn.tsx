'use client';

import { useEffect, useState } from 'react';

export default function FadeIn({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: React.ReactNode, 
  delay?: number,
  className?: string 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}