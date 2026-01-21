```
import { renderHook, act } from '@testing-library/react-hooks';
import useScrollToElement from '../../hooks/useScrollToElement';

describe('useScrollToElement', () => {
  test('scrolls to element when element exists', () => {
    const mockScrollIntoView = jest.fn();
    const elementId = 'test-section';

    const mockElement = document.createElement('div');
    mockElement.id = elementId;
    document.body.appendChild(mockElement);

    Element.prototype.scrollIntoView = mockScrollIntoView;

    const { result } = renderHook(() => useScrollToElement());

    act(() => {
      result.current(elementId);
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });

    document.body.removeChild(mockElement);
  });

  test('does nothing when element does not exist', () => {
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    const { result } = renderHook(() => useScrollToElement());

    act(() => {
      result.current('non-existent-id');
    });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  test('uses custom scroll options when provided', () => {
    const mockScrollIntoView = jest.fn();
    const elementId = 'test-section';
    const customOptions = { behavior: 'auto' as const, block: 'center' as const };

    const mockElement = document.createElement('div');
    mockElement.id = elementId;
    document.body.appendChild(mockElement);

    Element.prototype.scrollIntoView = mockScrollIntoView;

    const { result } = renderHook(() => useScrollToElement(customOptions));

    act(() => {
      result.current(elementId);
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith(customOptions);

    document.body.removeChild(mockElement);
  });
});
```