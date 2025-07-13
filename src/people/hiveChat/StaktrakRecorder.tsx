import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';
import { generatePlaywrightTest } from '../../utils/staktrakUtils';

interface StaktrakRecorderProps {
  iframeUrl: string;
}

interface Toast {
  id: string;
  title: string;
  color: 'success' | 'danger' | 'warning' | 'primary';
  text: string;
}

const RecorderContainer = styled.div<{ isRecording: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 15px;
  background-color: ${({ isRecording }) => (isRecording ? '#f44336' : '#4285f4')};
  padding: 8px 16px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  color: white;
  z-index: 9999;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: ${({ isRecording }) => (isRecording ? '#d32f2f' : '#1a73e8')};
  }
`;

const RecorderIcon = styled(MaterialIcon)`
  margin-right: 8px;
  font-size: 20px !important;
`;

const RecorderText = styled.span`
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
`;

const CustomToastContainer = styled.div`
  position: fixed;
  right: 20px;
  bottom: 55px;
  z-index: 10000;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  pointer-events: none;
`;

const CustomToast = styled.div<{ color: string }>`
  background-color: white;
  color: #333;
  border-left: 4px solid
    ${({ color }) => {
      switch (color) {
        case 'success':
          return '#00B8A9';
        case 'danger':
          return '#F8333C';
        case 'warning':
          return '#FCAB10';
        case 'primary':
          return '#2B50AA';
        default:
          return '#00B8A9';
      }
    }};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  margin-bottom: 8px;
  width: 280px;
  animation: slideIn 0.3s ease-out;
  pointer-events: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ToastHeader = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 4px;
`;

const ToastMessage = styled.div`
  font-size: 16px;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const CloseToastButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  padding: 0;
  margin-left: 8px;

  &:hover {
    color: #333;
  }
`;

const ResultsModal = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #202124;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: #202124;
  }
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  max-height: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: ${({ $primary }) => ($primary ? '#4285f4' : '#f1f3f4')};
  color: ${({ $primary }) => ($primary ? 'white' : '#5f6368')};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ $primary }) => ($primary ? '#3367d6' : '#e4e7eb')};
  }
`;

const StaktrakRecorder: React.FC<StaktrakRecorderProps> = ({ iframeUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<string | null>(null);
  const [, setRecordingData] = useState<any>(null);
  const [hasReceivedResults, setHasReceivedResults] = useState(false);
  const parentClicksRef = useRef<any[]>([]);
  const parentInputChangesRef = useRef<any[]>([]);
  const startTimeRef = useRef<number>(0);
  const wasRecordingRef = useRef<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts((currentToasts) => currentToasts.slice(1));
    }, 3000);

    return () => clearTimeout(timer);
  }, [toasts]);

  const dismissToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleParentInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;

      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
      }

      let selector = '';

      if (target.dataset && target.dataset.testid) {
        selector = `[data-testid="${target.dataset.testid}"]`;
      } else if (target.id) {
        selector = `#${target.id}`;
      } else if (target.placeholder) {
        selector = `${target.tagName.toLowerCase()}[placeholder="${target.placeholder}"]`;
      } else if (target.classList && target.classList.length) {
        const classes = Array.from(target.classList);
        const specialClass = classes.find(
          (cls) =>
            cls.includes('TextArea') ||
            cls.includes('textarea') ||
            cls.includes('TitleInput') ||
            cls.includes('titleInput') ||
            cls.includes('Input')
        );

        if (specialClass) {
          selector = `${target.tagName.toLowerCase()}.${specialClass}`;
        } else {
          const allClasses = classes.join('.');
          selector = `${target.tagName.toLowerCase()}.${allClasses}`;
        }
      } else {
        selector = target.tagName.toLowerCase();
      }

      console.log('Parent window input captured:', selector, 'Value:', target.value);

      parentInputChangesRef.current.push({
        elementSelector: selector,
        value: target.value,
        timestamp: Date.now() - startTimeRef.current,
        action: 'complete'
      });
    };

    let debounceTimer: number | null = null;
    const handleInputWithDebounce = (e: Event) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(() => {
        handleParentInput(e);
        debounceTimer = null;
      }, 300);
    };

    document.addEventListener('input', handleInputWithDebounce, true);
    document.addEventListener('change', handleParentInput, true);

    return () => {
      document.removeEventListener('input', handleInputWithDebounce, true);
      document.removeEventListener('change', handleParentInput, true);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return;

    const handleParentClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-staktrak-recorder]')) {
        return;
      }

      const path = [];
      let element = e.target as HTMLElement;
      let depth = 0;
      const maxDepth = 5;

      let bestSelector = '';

      if (
        element.closest('button[active]') ||
        element.closest('[role="tab"]') ||
        element.closest('[class*="TabButton"]')
      ) {
        const tabElement =
          element.closest('button[active]') ||
          element.closest('[role="tab"]') ||
          element.closest('[class*="TabButton"]');
        if (tabElement) {
          const tabText = tabElement.textContent?.trim();
          if (tabText) {
            bestSelector = `text=${tabText}`;
          } else if (tabElement.id) {
            bestSelector = `#${tabElement.id}`;
          } else {
            const classes = Array.from(tabElement.classList);
            if (classes.length > 0) {
              const tabClass =
                classes.find((c) => c.includes('Tab') || c.includes('tab')) || classes[0];
              bestSelector = `${tabElement.tagName.toLowerCase()}.${tabClass}`;
            } else {
              bestSelector = `${tabElement.tagName.toLowerCase()}[role="tab"]`;
            }
          }
        }
      }

      if (!bestSelector) {
        while (element && depth < maxDepth) {
          let selector = element.tagName.toLowerCase();

          if (element.dataset && element.dataset.testid) {
            selector += `[data-testid="${element.dataset.testid}"]`;
          } else {
            if (element.id) {
              selector += `#${element.id}`;
            } else if (element.classList && element.classList.length) {
              const classes = Array.from(element.classList).join('.');
              if (classes) {
                selector += `.${classes}`;
              }
            } else if (
              (element.tagName === 'BUTTON' || element.tagName === 'A') &&
              element.textContent &&
              element.textContent.trim()
            ) {
              selector = `text=${element.textContent.trim()}`;
            }
          }

          path.unshift(selector as never);
          element = element.parentElement as HTMLElement;
          depth++;
        }

        bestSelector = path.join(' > ');
      }

      console.log('Parent window click captured:', bestSelector);

      parentClicksRef.current.push({
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        selector: bestSelector,
        timestamp: Date.now() - startTimeRef.current
      });
    };

    document.addEventListener('click', handleParentClick, true);

    return () => {
      document.removeEventListener('click', handleParentClick, true);
    };
  }, [isRecording]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        console.log('Received message from iframe:', event.data.type);

        switch (event.data.type) {
          case 'staktrak-setup':
            console.log('Staktrak is ready in the iframe with status:', event.data.status);
            break;

          case 'staktrak-results': {
            console.log('Received staktrak results:', event.data.data);
            setHasReceivedResults(true);

            const mergedData = event.data.data;

            if (parentClicksRef.current.length > 0) {
              console.log('Adding parent window clicks:', parentClicksRef.current);

              if (!mergedData.clicks) {
                mergedData.clicks = { clickCount: 0, clickDetails: [] };
              }

              if (!mergedData.clicks.clickDetails) {
                mergedData.clicks.clickDetails = [];
              }

              parentClicksRef.current.forEach((click) => {
                mergedData.clicks.clickCount++;
                mergedData.clicks.clickDetails.push([
                  click.x,
                  click.y,
                  click.selector,
                  click.timestamp
                ]);
              });
            }

            if (parentInputChangesRef.current.length > 0) {
              console.log('Adding parent window input changes:', parentInputChangesRef.current);

              if (!mergedData.inputChanges) {
                mergedData.inputChanges = [];
              }

              mergedData.inputChanges = [
                ...mergedData.inputChanges,
                ...parentInputChangesRef.current
              ];
            }

            setRecordingData(mergedData);

            const url = iframeUrl || window.location.href;
            const testCode = generatePlaywrightTest(url, mergedData);

            console.log('Generated Playwright test:');
            console.log(testCode);

            setGeneratedTest(testCode);

            if (wasRecordingRef.current && !isRecording) {
              setIsModalOpen(true);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeUrl]);

  useEffect(() => {
    if (!isRecording && !hasReceivedResults) {
      if (!wasRecordingRef.current) return;

      const timeoutId = setTimeout(() => {
        if (!hasReceivedResults && parentClicksRef.current.length > 0) {
          console.log('No iframe results received, generating test with parent clicks only');

          const clickDetails: Array<[number, number, string, number]> = parentClicksRef.current.map(
            (click) => [click.x, click.y, click.selector, click.timestamp]
          );

          const testData = {
            clicks: {
              clickCount: clickDetails.length,
              clickDetails: clickDetails
            },
            inputChanges: parentInputChangesRef.current,
            userInfo: { windowSize: [window.innerWidth, window.innerHeight] }
          };

          const url = iframeUrl || window.location.href;
          const testCode = generatePlaywrightTest(url, testData);

          console.log('Generated Playwright test with parent clicks:');
          console.log(testCode);

          setGeneratedTest(testCode);
          setIsModalOpen(true);
          setHasReceivedResults(true);
        } else if (!hasReceivedResults && isRecording === false) {
          console.log('No recording results received, generating empty test');
          const url = iframeUrl || window.location.href;
          const emptyTest = generatePlaywrightTest(url, {
            clicks: { clickDetails: [] },
            inputChanges: [],
            userInfo: { windowSize: [window.innerWidth, window.innerHeight] }
          });

          console.log('Generated empty Playwright test:');
          console.log(emptyTest);

          setGeneratedTest(emptyTest);
          setIsModalOpen(true);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isRecording, hasReceivedResults, iframeUrl]);

  useEffect(() => {
    if (isRecording) {
      wasRecordingRef.current = true;
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      console.log('Stopping recording...');
      setHasReceivedResults(false);

      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          if (iframe.contentWindow) {
            console.log('Sending stop message to iframe:', iframe);
            iframe.contentWindow.postMessage({ type: 'staktrak-stop' }, '*');
          }
        } catch (error) {
          console.error('Error sending stop message to iframe:', error);
          setToasts([
            {
              id: `${Date.now()}-stop-error`,
              title: 'Error',
              color: 'danger',
              text: 'Failed to stop recording in iframe'
            }
          ]);
        }
      });
      setIsRecording(false);
      setToasts([
        {
          id: `${Date.now()}-stop-success`,
          title: 'Recording Stopped',
          color: 'success',
          text: 'Test recording has been stopped and is being processed'
        }
      ]);
    } else {
      console.log('Starting recording...');
      setRecordingData(null);
      setGeneratedTest(null);
      setHasReceivedResults(false);
      parentClicksRef.current = [];
      parentInputChangesRef.current = [];
      startTimeRef.current = Date.now();

      const iframes = document.querySelectorAll('iframe');
      let iframeFound = false;

      iframes.forEach((iframe) => {
        try {
          if (iframe.contentWindow) {
            console.log('Sending start message to iframe:', iframe);
            iframe.contentWindow.postMessage({ type: 'staktrak-start' }, '*');
            iframeFound = true;
          }
        } catch (error) {
          console.error('Error sending start message to iframe:', error);
          setToasts([
            {
              id: `${Date.now()}-start-error`,
              title: 'Error',
              color: 'danger',
              text: 'Failed to start recording in iframe'
            }
          ]);
        }
      });

      if (!iframeFound) {
        setToasts([
          {
            id: `${Date.now()}-start-success`,
            title: 'Recording Started',
            color: 'success',
            text: 'Test recording has started. Interact with the page to record actions.'
          }
        ]);
      }

      setIsRecording(true);
    }
  };

  const copyTestToClipboard = () => {
    if (generatedTest) {
      navigator.clipboard
        .writeText(generatedTest)
        .then(() => {
          setToasts([
            {
              id: `${Date.now()}-copy-success`,
              title: 'Success',
              color: 'success',
              text: 'Test code copied to clipboard!'
            }
          ]);
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
          setToasts([
            {
              id: `${Date.now()}-copy-error`,
              title: 'Error',
              color: 'danger',
              text: 'Failed to copy test code to clipboard'
            }
          ]);
        });
    }
  };

  useEffect(() => {
    if (generatedTest && isModalOpen) {
      setToasts([
        {
          id: `${Date.now()}-test-generated`,
          title: 'Test Generated',
          color: 'success',
          text: 'Playwright test has been successfully generated'
        }
      ]);
    }
  }, [generatedTest, isModalOpen]);

  return (
    <>
      <RecorderContainer
        isRecording={isRecording}
        onClick={toggleRecording}
        data-staktrak-recorder="true"
      >
        <RecorderIcon icon={isRecording ? 'stop' : 'fiber_manual_record'} />
        <RecorderText>{isRecording ? 'Stop Recording' : 'Record Test'}</RecorderText>
      </RecorderContainer>

      <ResultsModal isVisible={isModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Generated Playwright Test</ModalTitle>
            <CloseButton
              onClick={() => {
                setIsModalOpen(false);
                wasRecordingRef.current = false;
              }}
            >
              <MaterialIcon icon="close" />
            </CloseButton>
          </ModalHeader>

          {generatedTest && <CodeBlock>{generatedTest}</CodeBlock>}

          <ButtonGroup>
            <ActionButton
              onClick={() => {
                setIsModalOpen(false);
                wasRecordingRef.current = false;
              }}
            >
              Close
            </ActionButton>
            <ActionButton $primary onClick={copyTestToClipboard}>
              Copy to Clipboard
            </ActionButton>
          </ButtonGroup>
        </ModalContent>
      </ResultsModal>

      <CustomToastContainer>
        {toasts.map((toast) => (
          <CustomToast key={toast.id} color={toast.color}>
            <ToastContent>
              <ToastHeader>{toast.title}</ToastHeader>
              <ToastMessage>{toast.text}</ToastMessage>
            </ToastContent>
            <CloseToastButton onClick={() => dismissToast(toast.id)}>×</CloseToastButton>
          </CustomToast>
        ))}
      </CustomToastContainer>
    </>
  );
};

export default StaktrakRecorder;
