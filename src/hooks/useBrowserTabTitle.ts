'use client';
import { useEffect } from 'react';

const concantenateTitle = (title: string) => {
  return `${title} - Sphinx Community`;
};
export const useBrowserTabTitle = (title?: string) => {
  useEffect(() => {
    const defaultTitle = 'Sphinx Community';
    document.title = title ? concantenateTitle(title) : defaultTitle;
  }, [title]);
};
