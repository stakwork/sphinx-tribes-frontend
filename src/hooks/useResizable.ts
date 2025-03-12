import { useState, useCallback, useRef } from 'react';

interface UseResizableOptions {
  initialLeftWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface UseResizableReturn {
  leftWidth: number;
  containerRef: React.RefObject<HTMLDivElement>;
  startResize: (e: React.MouseEvent | React.TouchEvent) => void;
  setLeftWidth: (width: number) => void;
}

export function useResizable({
  initialLeftWidth = 50,
  minWidth = 10,
  maxWidth = 90
}: UseResizableOptions = {}): UseResizableReturn {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isResizing.current = true;
      document.body.style.cursor = 'col-resize';

      const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
        const { current: isCurrentlyResizing } = isResizing;
        const { current: container } = containerRef;
        
        if (!isCurrentlyResizing || !container) return;

        const { left, width: containerWidth } = container.getBoundingClientRect();

        const clientX = 'clientX' in moveEvent 
          ? moveEvent.clientX 
          : moveEvent.touches?.[0]?.clientX ?? 0;

        if (!clientX) return;

        const leftPixelWidth = clientX - left;
        const leftPercentWidth = (leftPixelWidth / containerWidth) * 100;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, leftPercentWidth));

        setLeftWidth(newWidth);

        const { cancelable } = moveEvent;
        cancelable && moveEvent.preventDefault();
      };

      const stopResize = () => {
        isResizing.current = false;
        document.body.style.cursor = '';
        
        const eventHandlers = [
          { event: 'mousemove', handler: handleMouseMove },
          { event: 'mouseup', handler: stopResize },
          { event: 'touchmove', handler: handleMouseMove },
          { event: 'touchend', handler: stopResize }
        ];
        
        eventHandlers.forEach(({ event, handler }) => {
          document.removeEventListener(event, handler as EventListener);
        });
      };

      const eventListenerConfigs = [
        { event: 'mousemove', handler: handleMouseMove },
        { event: 'mouseup', handler: stopResize },
        { event: 'touchmove', handler: handleMouseMove, options: { passive: false } },
        { event: 'touchend', handler: stopResize }
      ];
      
      eventListenerConfigs.forEach(({ event, handler, options }) => {
        document.addEventListener(event, handler as EventListener, options);
      });

      e.preventDefault();
    },
    [minWidth, maxWidth]
  );

  return {
    leftWidth,
    containerRef,
    startResize,
    setLeftWidth
  };
}