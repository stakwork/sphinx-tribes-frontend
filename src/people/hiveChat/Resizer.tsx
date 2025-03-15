import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizableDividerProps {
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  onChange?: (width: number) => void;
  onResizeEnd?: () => void;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({
  minLeftWidth = 20,
  maxLeftWidth = 80,
  onChange,
  onResizeEnd
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const resize = useCallback(
    (clientX: number) => {
      if (!isResizing || !dividerRef.current) return;

      const { parentElement } = dividerRef.current;
      if (!parentElement) return;

      const { left, width } = parentElement.getBoundingClientRect();
      const leftWidth = ((clientX - left) / width) * 100;

      const newWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, leftWidth));
      onChange?.(newWidth);
    },
    [isResizing, minLeftWidth, maxLeftWidth, onChange]
  );

  const stopResize = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    onResizeEnd?.();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    window.dispatchEvent(new Event('resizeComplete'));
  }, [isResizing, onResizeEnd]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = ({ clientX }: MouseEvent) => resize(clientX);

    const handleTouchMove = (e: TouchEvent) => {
      const { touches } = e;
      if (touches?.[0]) {
        resize(touches[0].clientX);
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchend', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  const dividerStyle = {
    width: '8px',
    background: '#e0e0e0',
    cursor: 'col-resize',
    position: 'relative',
    zIndex: 10
  } as const;

  const handleStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    height: '30px',
    width: '4px',
    backgroundColor: '#757575',
    borderRadius: '2px'
  } as const;

  return (
    <div ref={dividerRef} onMouseDown={startResize} onTouchStart={startResize} style={dividerStyle}>
      <div style={handleStyle} />
    </div>
  );
};

export default ResizableDivider;
