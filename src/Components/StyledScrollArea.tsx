import React, { useEffect, useId, useRef, useState } from 'react';

interface StyledScrollAreaProps {
  children: React.ReactNode;
  ariaLabel: string;
  role?: 'listbox' | 'region' | 'dialog';
  style?: React.CSSProperties;
  viewportStyle?: React.CSSProperties;
  className?: string;
  ariaModal?: boolean;
  ariaLabelledBy?: string;
}

const scrollbarStyles = `
  .garden-scroll-viewport { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; touch-action: pan-y; }
  .garden-scroll-viewport::-webkit-scrollbar { display: none; width: 0; height: 0; }
  /* Keep the scrollbar layout transparent so only its controls remain visible. */
  .garden-custom-scrollbar { box-sizing: border-box; flex: 0 0 16px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 2px; background: transparent; border-left: none; }
  .garden-scroll-arrow { width: 12px; height: 14px; flex: 0 0 14px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #63885A; cursor: pointer; }
  .garden-scroll-arrow:hover { background: #E2EEDC; color: #3F6F36; }
  .garden-scroll-track { position: relative; flex: 1 1 auto; width: 8px; min-height: 20px; border-radius: 999px; background: transparent; cursor: pointer; touch-action: none; outline: none; }
  .garden-scroll-track:focus-visible { box-shadow: 0 0 0 2px #A5C79A; }
  .garden-scroll-thumb { position: absolute; top: 0; left: 0; width: 100%; min-height: 22px; border-radius: 999px; background: #91B584; cursor: grab; }
  .garden-scroll-thumb:hover { background: #6F9864; }
  .garden-scroll-thumb.garden-scroll-thumb-dragging { background: #5F8954; cursor: grabbing; }
`;

// Replace browser scroll chrome with themed arrow buttons and a draggable thumb.
const StyledScrollArea = React.forwardRef<HTMLDivElement, StyledScrollAreaProps>(
  ({ children, ariaLabel, role = 'region', style, viewportStyle, className = '', ariaModal, ariaLabelledBy }, forwardedRef) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ pointerY: number; scrollTop: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const viewportId = `garden-scroll-${useId().replace(/:/g, '')}`;
    const [metrics, setMetrics] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0, trackHeight: 0 });
    const { padding, display, gap, gridTemplateColumns, gridAutoRows, ...rootStyle } = style ?? {};
    const hasOverflow = metrics.scrollHeight > metrics.clientHeight + 1;
    const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
    const thumbHeight = metrics.scrollHeight > 0
      ? Math.min(metrics.trackHeight, Math.max(22, metrics.clientHeight / metrics.scrollHeight * metrics.trackHeight))
      : 22;
    const thumbTravel = Math.max(0, metrics.trackHeight - thumbHeight);
    const thumbTop = maxScroll ? metrics.scrollTop / maxScroll * thumbTravel : 0;

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const updateMetrics = () => {
        const track = trackRef.current;
        setMetrics({
          scrollTop: viewport.scrollTop,
          scrollHeight: viewport.scrollHeight,
          clientHeight: viewport.clientHeight,
          trackHeight: track?.clientHeight ?? 0,
        });
      };

      viewport.addEventListener('scroll', updateMetrics, { passive: true });
      const observer = new ResizeObserver(updateMetrics);
      observer.observe(viewport);
      if (contentRef.current) observer.observe(contentRef.current);
      if (trackRef.current) observer.observe(trackRef.current);
      updateMetrics();
      return () => {
        viewport.removeEventListener('scroll', updateMetrics);
        observer.disconnect();
      };
    }, [hasOverflow]);

    const bindViewport = (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      // Forward the viewport element for controls that need its scroll position.
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const scrollByArrow = (direction: -1 | 1) => {
      viewportRef.current?.scrollBy({ top: direction * 48, behavior: 'smooth' });
    };

    const onTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      if (thumbRef.current?.contains(event.target as Node)) {
        dragRef.current = { pointerY: event.clientY, scrollTop: viewport.scrollTop };
        setIsDragging(true);
        return;
      }
      const bounds = track.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (event.clientY - bounds.top - thumbHeight / 2) / Math.max(1, bounds.height - thumbHeight)));
      viewport.scrollTop = fraction * maxScroll;
    };

    const onTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || !viewportRef.current) return;
      const delta = event.clientY - dragRef.current.pointerY;
      viewportRef.current.scrollTop = dragRef.current.scrollTop + delta * maxScroll / Math.max(1, thumbTravel);
    };

    const stopDragging = () => { dragRef.current = null; setIsDragging(false); };
    const onTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const page = Math.max(40, viewport.clientHeight - 40);
      const keyDeltas: Record<string, number> = {
        ArrowUp: -48, ArrowDown: 48, PageUp: -page, PageDown: page,
        Home: -viewport.scrollTop, End: maxScroll - viewport.scrollTop,
      };
      if (keyDeltas[event.key] !== undefined) {
        event.preventDefault();
        viewport.scrollBy({ top: keyDeltas[event.key] });
      }
    };

    return (
      <>
        <style>{scrollbarStyles}</style>
        <div className={`garden-scroll-area ${className}`.trim()} style={{
          ...rootStyle,
          display: 'flex', flexDirection: 'row', alignItems: 'stretch',
          boxSizing: 'border-box', minHeight: 0, overflow: 'hidden',
        }}>
          <div
            ref={bindViewport}
            id={viewportId}
            className="garden-scroll-viewport"
            style={{
              flex: '1 1 auto', minWidth: 0, minHeight: 0,
              height: rootStyle.height ? '100%' : undefined,
              maxHeight: rootStyle.maxHeight ?? '100%',
              padding,
              display: 'block',
            }}
          >
            <div ref={contentRef} role={role} aria-label={ariaLabel} aria-modal={ariaModal} aria-labelledby={ariaLabelledBy} style={{
              minWidth: 0, display: display ?? 'block', gap,
              gridTemplateColumns, gridAutoRows, ...viewportStyle,
            }}>{children}</div>
          </div>
          {hasOverflow && <div className="garden-custom-scrollbar" aria-hidden="false">
            <button type="button" className="garden-scroll-arrow" aria-label={`Scroll ${ariaLabel} up`} onClick={() => scrollByArrow(-1)}>
              <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 5 5 1l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div
              ref={trackRef}
              role="scrollbar"
              aria-label={`${ariaLabel} scroll position`}
              aria-controls={viewportId}
              aria-orientation="vertical"
              aria-valuemin={0}
              aria-valuemax={maxScroll}
              aria-valuenow={Math.round(metrics.scrollTop)}
              tabIndex={0}
              className="garden-scroll-track"
              onKeyDown={onTrackKeyDown}
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
              <div ref={thumbRef} className={`garden-scroll-thumb${isDragging ? ' garden-scroll-thumb-dragging' : ''}`}
                style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }} />
            </div>
            <button type="button" className="garden-scroll-arrow" aria-label={`Scroll ${ariaLabel} down`} onClick={() => scrollByArrow(1)}>
              <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>}
        </div>
      </>
    );
  },
);

StyledScrollArea.displayName = 'StyledScrollArea';

export default StyledScrollArea;
