import React, { useState, useEffect } from 'react';
import { ParsedMeal, DateSelection } from '../types/meal';
import { fetchMealsByDateRange, formatDateToYMD } from '../services/neisApi';
import { CalendarDays, X, ChevronLeft, ChevronRight, Loader2, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDate: DateSelection;
  onSelectDate: (date: DateSelection) => void;
}

export const WeeklyMealModal: React.FC<WeeklyMealModalProps> = ({
  isOpen,
  onClose,
  baseDate,
  onSelectDate,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weekMeals, setWeekMeals] = useState<Map<string, ParsedMeal[]>>(new Map());

  // Calculate Monday to Friday of the week
  const getWeekDates = (offset: number) => {
    const cur = new Date(baseDate.year, baseDate.month - 1, baseDate.day);
    cur.setDate(cur.getDate() + offset * 7);

    const day = cur.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;

    const monday = new Date(cur);
    monday.setDate(cur.getDate() + diffToMon);

    const days = [];
    const weekDayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        dateObj: d,
        ymd: formatDateToYMD(d),
        dayName: weekDayNames[i],
        displayDate: `${d.getMonth() + 1}월 ${d.getDate()}일`,
      });
    }

    return days;
  };

  const currentWeekDates = getWeekDates(weekOffset);

  useEffect(() => {
    if (!isOpen) return;

    const fetchWeek = async () => {
      setLoading(true);
      const fromYmd = currentWeekDates[0].ymd;
      const toYmd = currentWeekDates[4].ymd;

      try {
        const data = await fetchMealsByDateRange(fromYmd, toYmd);
        setWeekMeals(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchWeek();
  }, [isOpen, weekOffset, baseDate.year, baseDate.month, baseDate.day]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  양정고 주간 식단표 한눈에 보기
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentWeekDates[0].displayDate} ~ {currentWeekDates[4].displayDate} (월~금 주간 식단)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="이전 주"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                이번 주
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="다음 주"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Week Bento Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-bold">주간 식단표 불러오는 중...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {currentWeekDates.map((day) => {
                  const dayMeals = weekMeals.get(day.ymd) || [];
                  const mainMeal = dayMeals[0];

                  return (
                    <div
                      key={day.ymd}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                            {day.dayName}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {day.displayDate}
                          </span>
                        </div>

                        {mainMeal ? (
                          <div className="mt-2.5 space-y-1.5">
                            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              ⚡ {mainMeal.calories}
                            </div>
                            <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
                              {mainMeal.dishes.map((d, i) => (
                                <li key={i} className="line-clamp-1 leading-snug">
                                  • {d.cleanName}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 font-medium">
                            급식 정보 없음
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectDate({
                            year: day.dateObj.getFullYear(),
                            month: day.dateObj.getMonth() + 1,
                            day: day.dateObj.getDate(),
                          });
                          onClose();
                        }}
                        className="w-full py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        이 날짜 확인
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
