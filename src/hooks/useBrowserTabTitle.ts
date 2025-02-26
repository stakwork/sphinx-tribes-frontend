'use client';
import { useEffect } from 'react';

const concantenateTitle = (title: string) => {
  return `${title} - Sphinx Community`;
};
export const useBrowserTabTitle = (title: string) => {
  useEffect(() => {
    document.title = concantenateTitle(title);
  }, [title]);
};
