import { useCallback } from 'react';

type ScrollOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
};

const defaultOptions: ScrollOptions = {
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest'
};

const useScrollToElement = (options: ScrollOptions = defaultOptions) => {
  const scrollToElement = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView(options);
      }
    },
    [options]
  );

  return scrollToElement;
};

export default useScrollToElement;
