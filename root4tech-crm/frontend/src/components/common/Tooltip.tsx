import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom';
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 50
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeBelow: boolean }>({
    top: 0,
    left: 0,
    placeBelow: false
  });
  const timeoutRef = useRef<number | null>(null);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const placeBelow = position === 'bottom' || rect.top < 45;

    // Center horizontally relative to viewport
    const left = Math.round(rect.left + rect.width / 2);
    // Position vertically above or below
    const top = placeBelow
      ? Math.round(rect.bottom + 6)
      : Math.round(rect.top - 6);

    setCoords({ top, left, placeBelow });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      calculatePosition(target);
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Clone child element to attach event handlers and standard accessibility
  const child = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      handleMouseEnter(e);
      if (children.props.onMouseEnter) children.props.onMouseEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      handleMouseLeave();
      if (children.props.onMouseLeave) children.props.onMouseLeave(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      calculatePosition(e.currentTarget);
      setIsVisible(true);
      if (children.props.onFocus) children.props.onFocus(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      setIsVisible(false);
      if (children.props.onBlur) children.props.onBlur(e);
    },
    'aria-label': content,
    title: content // Native fallback for search & assistive devices
  });

  return (
    <>
      {child}
      {isVisible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placeBelow
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -100%)'
            }}
            className={`fixed z-[99999] pointer-events-none px-2.5 py-1 rounded-md bg-slate-900/95 text-white text-[11px] font-semibold tracking-tight shadow-xl backdrop-blur-xs whitespace-nowrap transition-all duration-150 border border-slate-700/70 select-none animate-in fade-in zoom-in-95 ${className}`}
          >
            {content}
            {/* Tooltip caret indicator */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45 border-slate-700/70 ${
                coords.placeBelow
                  ? '-top-1 border-t border-l'
                  : '-bottom-1 border-b border-r'
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
};
