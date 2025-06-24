import React from 'react';
import LoomViewerRecorder from '../../../people/utils/LoomViewerRecorder';
import type { Props } from './propsType';

export default function LoomVideoInput({ value, handleChange, handleBlur, handleFocus }: Props) {
  return (
    <>
      <LoomViewerRecorder
        data-testid="loom-video-input-component"
        name="loomVideo"
        onChange={(e: any) => {
          handleChange(e);
        }}
        loomEmbedUrl={value}
        onBlur={handleBlur}
        onFocus={handleFocus}
        style={{ marginBottom: 10 }}
      />
    </>
  );
}