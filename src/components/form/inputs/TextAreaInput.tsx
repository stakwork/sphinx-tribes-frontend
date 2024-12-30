import React, { useState } from 'react';
import styled from 'styled-components';
import { EuiIcon } from '@elastic/eui';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import { CopyButtonGroup } from 'people/widgetViews/workspace/style';
import { colors } from '../../../config/colors';
import type { Props } from './propsType';
import { FieldEnv, FieldTextArea, Note } from './index';

const StyleOnText = {
  'Description *': {
    height: '172px',
    width: '100%'
  },
  Deliverables: {
    height: '135px',
    width: '192px'
  }
};

const defaultHeight = '135px';
const defaultWidth = '100%';

interface styledProps {
  color?: any;
}

const OuterContainer = styled.div<styledProps>`
  .euiFormRow_active {
    border: 1px solid ${(p: any) => p?.color && p?.color.blue2};
    .euiFormRow__labelWrapper {
      margin-bottom: 0px;
      margin-top: -9px;
      padding-left: 10px;
      height: 14px;
      label {
        color: ${(p: any) => p?.color && p?.color.grayish.G300} !important;
        background: ${(p: any) => p?.color && p?.color.pureWhite};
        z-index: 10;
      }
    }
  }
  .euiFormRow_filed {
    .euiFormRow__labelWrapper {
      margin-bottom: 0px;
      margin-top: -9px;
      padding-left: 10px;
      height: 14px;
      label {
        color: ${(p: any) => p?.color && p?.color.grayish.G300} !important;
        background: ${(p: any) => p?.color && p?.color.pureWhite};
        z-index: 10;
      }
    }
  }
`;

const ExtraText = styled.div<styledProps>`
  color: ${(p: any) => p?.color && p?.color.grayish.G760};
  padding: 10px 10px 25px 10px;
  max-width: calc(100% - 20px);
  word-break: break-all;
  font-size: 14px;
`;

const E = styled.div<styledProps>`
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(p: any) => p?.color && p?.color.blue3};
  pointer-events: none;
  user-select: none;
`;
const R = styled.div`
  position: relative;
`;
const SwitcherContainer = styled.div`
  display: flex;
  background-color: rgb(238, 231, 231);
  border-radius: 20px;
  padding: 4px;
  width: fit-content;
  margin-bottom: 12px;
  align-self: flex-end;
`;

const SwitcherButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  ${(props: { isActive: boolean }) =>
    props.isActive
      ? `
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
  `
      : `
    background-color: transparent;
    color: #333;
    &:hover {
      background-color: rgba(0, 123, 255, 0.1);
    }
  `}
`;
export default function TextAreaInput({
  error,
  note,
  label,
  value,
  handleChange,
  handleBlur,
  handleFocus,
  readOnly,
  extraHTML,
  borderType,
  github_state
}: Props) {
  const color = colors['light'];
  const [active, setActive] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'preview' | 'edit'>('edit');
  const normalizeAndTrimText = (text: string) => text.split('\n').join('\n');

  const handleTextChange = (e: any) => {
    const newText = normalizeAndTrimText(e.target.value.trimStart());
    handleChange(newText);
  };

  const handleTextBlur = (e: any) => {
    const normalizedText = normalizeAndTrimText(e.target.value);
    handleChange(normalizedText);
    handleBlur(e);
    setActive(false);
  };

  return (
    <OuterContainer color={color}>
      <CopyButtonGroup>
        <SwitcherContainer>
          <SwitcherButton
            isActive={activeMode === 'preview'}
            onClick={() => setActiveMode('preview')}
          >
            Preview
          </SwitcherButton>
          <SwitcherButton isActive={activeMode === 'edit'} onClick={() => setActiveMode('edit')}>
            Edit
          </SwitcherButton>
        </SwitcherContainer>
      </CopyButtonGroup>
      <FieldEnv
        color={color}
        onClick={() => {
          setActive(true);
        }}
        className={active ? 'euiFormRow_active' : (value ?? '') === '' ? '' : 'euiFormRow_filed'}
        border={borderType}
        label={label}
        height={StyleOnText[label]?.height ?? defaultHeight}
        width={StyleOnText[label]?.width ?? defaultWidth}
      >
        <R>
          {activeMode === 'edit' ? (
            <FieldTextArea
              color={color}
              height={StyleOnText[label]?.height ?? defaultHeight}
              width={StyleOnText[label]?.width ?? defaultWidth}
              name="first"
              value={value || ''}
              readOnly={readOnly || github_state || false}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onFocus={(e: any) => {
                handleFocus(e);
                setActive(true);
              }}
              rows={label === 'Description' ? 8 : 6}
              data-testid={`checktextarea`}
            />
          ) : (
            <div className="p-4">{renderMarkdown(value)}</div>
          )}
          {error && (
            <E color={color}>
              <EuiIcon type="alert" size="m" style={{ width: 20, height: 20 }} />
            </E>
          )}
        </R>
      </FieldEnv>
      {note && <Note color={color}>*{note}</Note>}
      <ExtraText
        color={color}
        style={{ display: value && extraHTML ? 'block' : 'none' }}
        dangerouslySetInnerHTML={{ __html: extraHTML || '' }}
      />
    </OuterContainer>
  );
}
