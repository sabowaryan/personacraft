/**
 * Mock ResizeObserver for testing
 */

export const createMockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  mockResizeObserver.mockReturnValue({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  });

  return mockResizeObserver;
};

export const mockResizeObserverEntry = (
  target: Element,
  contentRect: DOMRectReadOnly = {
    bottom: 100,
    height: 100,
    left: 0,
    right: 100,
    top: 0,
    width: 100,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  }
) => ({
  target,
  contentRect,
  borderBoxSize: [{
    blockSize: contentRect.height,
    inlineSize: contentRect.width
  }],
  contentBoxSize: [{
    blockSize: contentRect.height,
    inlineSize: contentRect.width
  }],
  devicePixelContentBoxSize: [{
    blockSize: contentRect.height,
    inlineSize: contentRect.width
  }]
});