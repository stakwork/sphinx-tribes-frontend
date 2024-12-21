import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import React, { ChangeEvent, useState } from 'react';
import { UiStore } from 'store/ui';
import { useDropzone } from 'react-dropzone';

const StyledTextArea = styled.textarea`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 100%;
  resize: vertical;
  min-height: 300px;

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  :focus {
    border: 2px solid #82b4ff;
  }
`;

interface TicketTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ui: UiStore;
}

export const TicketTextAreaComp = ({ value, onChange, placeholder, ui }: TicketTextAreaProps) => {
  // eslint-disable-next-line no-unused-vars
  const [picsrc, setPicsrc] = useState<string>('');

  const uploadBase64Pic = async (img_base64: string, img_type: string, placeholder: string) => {
    try {
      const info = ui.meInfo;
      if (!info) {
        alert('You are not logged in.');
        return;
      }

      console.log('User info:', ui.meInfo);
      const URL = 'https://people.sphinx.chat';
      const response = await fetch(`${URL}/public_pic`, {
        method: 'POST',
        body: JSON.stringify({ img_base64, img_type }),
        headers: {
          'x-jwt': info.jwt,
          'Content-Type': 'application/json'
        }
      });

      const text = await response.text();
      console.log('Raw server response:', text);

      let j: { success: boolean; response?: { img: string }; error?: string };
      try {
        j = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Server returned invalid JSON');
      }

      if (j.success && j.response && j.response.img) {
        setPicsrc(img_base64);
        const finalMarkdown = `![image](${j.response.img})\n`;
        const updatedValue = value.replace(placeholder, finalMarkdown);
        onChange(updatedValue);
      } else {
        throw new Error(j.error || 'Image upload failed');
      }
    } catch (e) {
      console.error('ERROR UPLOADING IMAGE', e);
      const failurePlaceholder = `![Upload failed]()\n`;
      const updatedValue = value.replace(placeholder, failurePlaceholder);
      onChange(updatedValue);
    }
  };

  const handleImageUpload = async (file: File) => {
    const uniqueId = uuidv4();
    const placeholder = `![Uploading ${uniqueId}...]()\n`;

    const textArea = document.querySelector('textarea');
    const cursorPosition = textArea?.selectionStart || value.length;
    const newValue = value.slice(0, cursorPosition) + placeholder + value.slice(cursorPosition);
    onChange(newValue);

    try {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const base64String = event.target?.result as string;
        const base64Data = base64String.split(',')[1];
        await uploadBase64Pic(base64Data, file.type, placeholder);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      const failurePlaceholder = `![Failed to upload ${uniqueId}...]()\n`;
      const updatedValue = value.replace(placeholder, failurePlaceholder);
      onChange(updatedValue);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !file.type.startsWith('image/')) return;
    await handleImageUpload(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { items } = e.clipboardData;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    noClick: true,
    noKeyboard: true
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <StyledTextArea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
      />
    </div>
  );
};
