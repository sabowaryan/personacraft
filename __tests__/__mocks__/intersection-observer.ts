/**
 * Mock IntersectionObserver for testing
 */

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  mockIntersectionObserver.mockReturnValue({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  });

  return mockIntersectionObserver;
};

export const mockIntersectionObserverEntry = (
  target: Element,
  isIntersecting: boolean = true,
  intersectionRatio: number = 1
) => ({
  target,
  isIntersecting,
  intersectionRatio,
  intersectionRect: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  boundingClientRect: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  rootBounds: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  },
  time: Date.now()
});