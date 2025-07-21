'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface VirtualScrollOptions {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
    threshold?: number;
}

interface VirtualScrollResult<T> {
    containerProps: {
        style: React.CSSProperties;
        onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
        ref: React.RefObject<HTMLDivElement | null>;
    };
    wrapperProps: {
        style: React.CSSProperties;
    };
    visibleItems: Array<{
        index: number;
        item: T;
        style: React.CSSProperties;
    }>;
    scrollToIndex: (index: number) => void;
    isScrolling: boolean;
}

/**
 * Hook for virtual scrolling large lists
 * Optimizes performance by only rendering visible items
 */
export function useVirtualScroll<T>(
    items: T[],
    options: VirtualScrollOptions
): VirtualScrollResult<T> {
    const {
        itemHeight,
        containerHeight,
        overscan = 5,
        threshold = 100,
    } = options;

    const [scrollTop, setScrollTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<number | undefined>(undefined);

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

    // Generate visible items with positioning
    const visibleItems = useMemo(() => {
        const { startIndex, endIndex } = visibleRange;
        const result = [];

        for (let i = startIndex; i <= endIndex; i++) {
            if (items[i]) {
                result.push({
                    index: i,
                    item: items[i],
                    style: {
                        position: 'absolute' as const,
                        top: i * itemHeight,
                        left: 0,
                        right: 0,
                        height: itemHeight,
                    },
                });
            }
        }

        return result;
    }, [visibleRange, items, itemHeight]);

    // Handle scroll events
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = e.currentTarget.scrollTop;

        // Only update if scroll difference is above threshold
        if (Math.abs(newScrollTop - scrollTop) > threshold) {
            setScrollTop(newScrollTop);
        }

        // Set scrolling state
        setIsScrolling(true);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set timeout to detect scroll end
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 150) as unknown as number;
    }, [scrollTop, threshold]);

    // Scroll to specific index
    const scrollToIndex = useCallback((index: number) => {
        if (containerRef.current) {
            const targetScrollTop = index * itemHeight;
            containerRef.current.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth',
            });
        }
    }, [itemHeight]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Container props
    const containerProps = {
        style: {
            height: containerHeight,
            overflow: 'auto' as const,
            position: 'relative' as const,
        },
        onScroll: handleScroll,
        ref: containerRef,
    };

    // Wrapper props for total height
    const wrapperProps = {
        style: {
            height: items.length * itemHeight,
            position: 'relative' as const,
        },
    };

    return {
        containerProps,
        wrapperProps,
        visibleItems,
        scrollToIndex,
        isScrolling,
    };
}

/**
 * Hook for virtual grid scrolling
 */
export function useVirtualGrid<T>(
    items: T[],
    options: {
        itemWidth: number;
        itemHeight: number;
        containerWidth: number;
        containerHeight: number;
        gap?: number;
        overscan?: number;
    }
) {
    const {
        itemWidth,
        itemHeight,
        containerWidth,
        containerHeight,
        gap = 0,
        overscan = 5,
    } = options;

    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate grid dimensions
    const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / columnsPerRow);

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
        const endRow = Math.min(
            totalRows - 1,
            Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
        );

        const startIndex = startRow * columnsPerRow;
        const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsPerRow - 1);

        return { startIndex, endIndex, startRow, endRow };
    }, [scrollTop, itemHeight, containerHeight, gap, overscan, totalRows, columnsPerRow, items.length]);

    // Generate visible items
    const visibleItems = useMemo(() => {
        const { startIndex, endIndex } = visibleRange;
        const result = [];

        for (let i = startIndex; i <= endIndex; i++) {
            if (items[i]) {
                const row = Math.floor(i / columnsPerRow);
                const col = i % columnsPerRow;

                result.push({
                    index: i,
                    item: items[i],
                    style: {
                        position: 'absolute' as const,
                        top: row * (itemHeight + gap),
                        left: col * (itemWidth + gap),
                        width: itemWidth,
                        height: itemHeight,
                    },
                });
            }
        }

        return result;
    }, [visibleRange, items, itemWidth, itemHeight, gap, columnsPerRow]);

    // Handle scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
        setScrollLeft(e.currentTarget.scrollLeft);
    }, []);

    return {
        containerProps: {
            style: {
                width: containerWidth,
                height: containerHeight,
                overflow: 'auto' as const,
                position: 'relative' as const,
            },
            onScroll: handleScroll,
            ref: containerRef,
        },
        wrapperProps: {
            style: {
                width: columnsPerRow * (itemWidth + gap) - gap,
                height: totalRows * (itemHeight + gap) - gap,
                position: 'relative' as const,
            },
        },
        visibleItems,
        scrollToIndex: (index: number) => {
            if (containerRef.current) {
                const row = Math.floor(index / columnsPerRow);
                const targetScrollTop = row * (itemHeight + gap);
                containerRef.current.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth',
                });
            }
        },
    };
}