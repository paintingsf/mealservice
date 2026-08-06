import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { playTactileTickSound, triggerHapticTick } from '../utils/haptics';

interface SpringWheelColumnProps {
  id: string;
  items: Array<{ value: number; label: string; subLabel?: string; isWeekend?: boolean }>;
  selectedValue: number;
  onChange: (value: number) => void;
  unit: string;
  soundEnabled?: boolean;
}

const ITEM_HEIGHT = 46; // pixels per item in the drum
const VISIBLE_COUNT = 5; // number of visible items
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const HALF_HEIGHT = CONTAINER_HEIGHT / 2;

export const SpringWheelColumn: React.FC<SpringWheelColumnProps> = ({
  id,
  items,
  selectedValue,
  onChange,
  unit,
  soundEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastTickIndexRef = useRef<number>(-1);

  // Find index of selected value
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === selectedValue)
  );

  // Motion value for vertical offset
  const targetOffset = -selectedIndex * ITEM_HEIGHT;
  const offsetMotion = useMotionValue(targetOffset);
  const springOffset = useSpring(offsetMotion, {
    stiffness: 340,
    damping: 28,
    mass: 0.8,
  });

  const [currentDisplayOffset, setCurrentDisplayOffset] = useState(targetOffset);

  // Synchronize when selectedValue changes externally
  useEffect(() => {
    const newTarget = -selectedIndex * ITEM_HEIGHT;
    offsetMotion.set(newTarget);
    lastTickIndexRef.current = selectedIndex;
  }, [selectedIndex, offsetMotion]);

  // Track the spring's actual current value for 3D item rendering
  useEffect(() => {
    const unsubscribe = springOffset.on('change', (latest) => {
      setCurrentDisplayOffset(latest);

      // Check if we crossed into a new item during drag/momentum for tick feedback
      const approxIndex = Math.round(-latest / ITEM_HEIGHT);
      if (
        approxIndex >= 0 &&
        approxIndex < items.length &&
        approxIndex !== lastTickIndexRef.current
      ) {
        lastTickIndexRef.current = approxIndex;
        if (soundEnabled) {
          playTactileTickSound(700 + approxIndex * 15);
        }
        triggerHapticTick();
      }
    });
    return () => unsubscribe();
  }, [springOffset, items.length, soundEnabled]);

  // Snap to nearest item index
  const snapToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const newOffset = -clampedIndex * ITEM_HEIGHT;
      offsetMotion.set(newOffset);
      if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
        onChange(items[clampedIndex].value);
        if (soundEnabled) playTactileTickSound(850);
        triggerHapticTick();
      }
    },
    [items, selectedValue, onChange, offsetMotion, soundEnabled]
  );

  // Handle Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;
    const direction = delta > 0 ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + direction));
    snapToIndex(nextIndex);
  };

  // Pointer Down (Drag Start)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startOffsetRef.current = offsetMotion.get();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move (Dragging)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    let newOffset = startOffsetRef.current + deltaY;

    // Elastic resistance bounds
    const minOffset = -(items.length - 1) * ITEM_HEIGHT;
    const maxOffset = 0;

    if (newOffset > maxOffset) {
      newOffset = maxOffset + (newOffset - maxOffset) * 0.35; // rubber band top
    } else if (newOffset < minOffset) {
      newOffset = minOffset + (newOffset - minOffset) * 0.35; // rubber band bottom
    }

    offsetMotion.set(newOffset);
  };

  // Pointer Up (Drag End & Snap)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const current = offsetMotion.get();
    const nearestIndex = Math.round(-current / ITEM_HEIGHT);
    snapToIndex(nearestIndex);
  };

  // Step up / down buttons
  const handleStepPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      snapToIndex(selectedIndex - 1);
    }
  };

  const handleStepNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < items.length - 1) {
      snapToIndex(selectedIndex + 1);
    }
  };

  return (
    <div
      id={id}
      className="relative flex flex-col items-center select-none touch-none group"
      style={{ width: '100%', maxWidth: '140px' }}
    >
      {/* Unit label at top */}
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
        {unit}
      </div>

      {/* Up Quick Arrow Button */}
      <button
        id={`${id}-prev-btn`}
        type="button"
        onClick={handleStepPrev}
        disabled={selectedIndex <= 0}
        aria-label={`${unit} 이전 선택`}
        className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 disabled:opacity-20 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 mb-1"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Drum Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner"
        style={{
          height: `${CONTAINER_HEIGHT}px`,
          perspective: '1000px',
        }}
      >
        {/* Center Active Focus Highlight Band (Layered behind items with z-0) */}
        <div
          className="absolute left-1.5 right-1.5 pointer-events-none rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border-2 border-blue-500/70 dark:border-blue-400/70 shadow-xs z-0"
          style={{
            top: `${HALF_HEIGHT - ITEM_HEIGHT / 2}px`,
            height: `${ITEM_HEIGHT}px`,
          }}
        >
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600 dark:text-blue-400 select-none">
            {unit}
          </div>
        </div>

        {/* Top/Bottom Gradient Shadows for 3D depth */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent pointer-events-none z-20" />

        {/* Roller Items Container (Layered above highlight band with z-10) */}
        <motion.div
          className="absolute inset-x-0 will-change-transform z-10"
          style={{
            top: `${HALF_HEIGHT - ITEM_HEIGHT / 2}px`,
            y: springOffset,
          }}
        >
          {items.map((item, index) => {
            const itemCenterOffset = index * ITEM_HEIGHT;
            const distance = (currentDisplayOffset + itemCenterOffset) / ITEM_HEIGHT;
            const absDistance = Math.abs(distance);

            const rotateX = Math.max(-65, Math.min(65, distance * 25));
            const opacity = Math.max(0.2, 1 - absDistance * 0.3);
            const scale = Math.max(0.8, 1 - absDistance * 0.08);
            const isSelected = index === selectedIndex;

            return (
              <div
                key={item.value}
                onClick={(e) => {
                  e.stopPropagation();
                  snapToIndex(index);
                }}
                className="h-[46px] flex items-center justify-center px-2 cursor-pointer transition-colors duration-150"
                style={{
                  transform: `rotateX(${rotateX}deg) scale(${scale}) translateZ(${Math.max(0, 10 - absDistance * 12)}px)`,
                  transformOrigin: 'center center',
                  opacity: isSelected ? 1 : opacity,
                }}
              >
                <span
                  className={`transition-all tracking-tight ${
                    isSelected
                      ? 'text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 scale-110 drop-shadow-xs'
                      : item.isWeekend
                      ? 'text-base font-medium text-amber-600 dark:text-amber-400'
                      : 'text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>
                {item.subLabel && (
                  <span
                    className={`ml-1 transition-all ${
                      isSelected
                        ? 'text-xs font-black text-blue-600 dark:text-blue-400'
                        : item.isWeekend
                        ? 'text-xs font-semibold text-amber-600 dark:text-amber-400'
                        : 'text-xs font-medium text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.subLabel}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Down Quick Arrow Button */}
      <button
        id={`${id}-next-btn`}
        type="button"
        onClick={handleStepNext}
        disabled={selectedIndex >= items.length - 1}
        aria-label={`${unit} 다음 선택`}
        className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 disabled:opacity-20 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 mt-1"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
