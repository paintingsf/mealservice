import React, { useMemo } from 'react';
import { SpringWheelColumn } from './SpringWheelColumn';
import { DateSelection } from '../types/meal';
import { Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpringDatePickerProps {
  date: DateSelection;
  onChange: (date: DateSelection) => void;
  onQuickJumpToday: () => void;
  onQuickJumpTomorrow: () => void;
  onQuickJumpYesterday: () => void;
  onQuickJumpNextMeal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SpringDatePicker: React.FC<SpringDatePickerProps> = ({
  date,
  onChange,
  onQuickJumpToday,
  onQuickJumpTomorrow,
  onQuickJumpYesterday,
  onQuickJumpNextMeal,
  soundEnabled,
}) => {
  // Years options: from current year - 3 to current year + 2
  const currentYear = new Date().getFullYear();
  const yearItems = useMemo(() => {
    const list = [];
    for (let y = currentYear - 3; y <= currentYear + 2; y++) {
      list.push({
        value: y,
        label: `${y}`,
      });
    }
    return list;
  }, [currentYear]);

  // Month options: 1 to 12
  const monthItems = useMemo(() => {
    const list = [];
    for (let m = 1; m <= 12; m++) {
      list.push({
        value: m,
        label: String(m).padStart(2, '0'),
      });
    }
    return list;
  }, []);

  // Days in selected Month & Year
  const dayItems = useMemo(() => {
    const daysInMonth = new Date(date.year, date.month, 0).getDate();
    const list = [];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(date.year, date.month - 1, d);
      const dayOfWeek = weekDays[dateObj.getDay()];
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

      list.push({
        value: d,
        label: String(d).padStart(2, '0'),
        subLabel: `(${dayOfWeek})`,
        isWeekend,
      });
    }
    return list;
  }, [date.year, date.month]);

  // Handle Year Change
  const handleYearChange = (newYear: number) => {
    const maxDays = new Date(newYear, date.month, 0).getDate();
    const clampedDay = Math.min(date.day, maxDays);
    onChange({
      year: newYear,
      month: date.month,
      day: clampedDay,
    });
  };

  // Handle Month Change
  const handleMonthChange = (newMonth: number) => {
    const maxDays = new Date(date.year, newMonth, 0).getDate();
    const clampedDay = Math.min(date.day, maxDays);
    onChange({
      year: date.year,
      month: newMonth,
      day: clampedDay,
    });
  };

  // Handle Day Change
  const handleDayChange = (newDay: number) => {
    onChange({
      ...date,
      day: newDay,
    });
  };

  // Day step navigation (-1 day, +1 day)
  const handlePrevDay = () => {
    const cur = new Date(date.year, date.month - 1, date.day);
    cur.setDate(cur.getDate() - 1);
    onChange({
      year: cur.getFullYear(),
      month: cur.getMonth() + 1,
      day: cur.getDate(),
    });
  };

  const handleNextDay = () => {
    const cur = new Date(date.year, date.month - 1, date.day);
    cur.setDate(cur.getDate() + 1);
    onChange({
      year: cur.getFullYear(),
      month: cur.getMonth() + 1,
      day: cur.getDate(),
    });
  };

  // Check if current selection is today
  const today = new Date();
  const isSelectedToday =
    date.year === today.getFullYear() &&
    date.month === today.getMonth() + 1 &&
    date.day === today.getDate();

  // Current selected day of week string
  const selectedDateObj = new Date(date.year, date.month - 1, date.day);
  const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = weekDays[selectedDateObj.getDay()];
  const isWeekend = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 6;

  return (
    <div
      id="spring-date-picker-card"
      className="w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Bento Header: Selected Date with Badges & Stepper */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>조회 일자</span>
              {isSelectedToday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  오늘
                </span>
              )}
              {isWeekend && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  주말
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {date.year}년 {date.month}월 {date.day}일{' '}
              <span className={isWeekend ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}>
                ({dayName})
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Chevron Buttons */}
        <div className="flex items-center gap-1">
          <button
            id="prev-day-btn"
            type="button"
            onClick={handlePrevDay}
            title="하루 전으로 이동"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="next-day-btn"
            type="button"
            onClick={handleNextDay}
            title="다음 날로 이동"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 쫀득한 3D Drum Wheel Picker Columns (Year, Month, Day) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 my-2 px-1">
        <SpringWheelColumn
          id="picker-col-year"
          items={yearItems}
          selectedValue={date.year}
          onChange={handleYearChange}
          unit="년"
          soundEnabled={soundEnabled}
        />
        <SpringWheelColumn
          id="picker-col-month"
          items={monthItems}
          selectedValue={date.month}
          onChange={handleMonthChange}
          unit="월"
          soundEnabled={soundEnabled}
        />
        <SpringWheelColumn
          id="picker-col-day"
          items={dayItems}
          selectedValue={date.day}
          onChange={handleDayChange}
          unit="일"
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Quick Jump Bento Preset Chips */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            id="quick-yesterday-btn"
            type="button"
            onClick={onQuickJumpYesterday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            어제
          </button>
          <button
            id="quick-today-btn"
            type="button"
            onClick={onQuickJumpToday}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all ${
              isSelectedToday
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100'
            }`}
          >
            오늘
          </button>
          <button
            id="quick-tomorrow-btn"
            type="button"
            onClick={onQuickJumpTomorrow}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            내일
          </button>
        </div>

        {onQuickJumpNextMeal && (
          <button
            id="quick-next-meal-btn"
            type="button"
            onClick={onQuickJumpNextMeal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>다음 급식일로 이동</span>
          </button>
        )}
      </div>
    </div>
  );
};
