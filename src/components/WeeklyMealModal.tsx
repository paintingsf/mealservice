import React, { useState, useEffect } from 'react';
import { ParsedMeal, DateSelection } from '../types/meal';
import { fetchMealsByDateRange, formatDateToYMD } from '../services/neisApi';
import { CalendarDays, X, ChevronLeft, ChevronRight, Loader2, Sun, Moon, Utensils, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDate: DateSelection;
  onSelectDate: (date: DateSelection) => void;
}

type MealFilterType = '2' | '3' | '1' | 'ALL'; // 2: 중식, 3: 석식, 1: 조식, ALL: 전체

export const WeeklyMealModal: React.FC<WeeklyMealModalProps> = ({
  isOpen,
  onClose,
  baseDate,
  onSelectDate,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weekMeals, setWeekMeals] = useState<Map<string, ParsedMeal[]>>(new Map());
  const [mealFilter, setMealFilter] = useState<MealFilterType>('2'); // default to 중식
  // Per-day selected meal override (for days with multiple meals)
  const [dayMealOverrides, setDayMealOverrides] = useState<Record<string, string>>({});

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  양정고 주간 식단표 한눈에 보기
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentWeekDates[0].displayDate} ~ {currentWeekDates[4].displayDate} (월~금 5일간 식단)
                </p>
              </div>
            </div>

            {/* Week Stepper & Close */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="이전 주"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                이번 주
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="다음 주"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Meal Type Tabs (중식 / 석식 / 조식 / 전체) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 px-2">
                식사 구분:
              </span>
              <button
                type="button"
                onClick={() => {
                  setMealFilter('2');
                  setDayMealOverrides({});
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  mealFilter === '2'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>중식 (점심)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMealFilter('3');
                  setDayMealOverrides({});
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  mealFilter === '3'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>석식 (저녁)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMealFilter('1');
                  setDayMealOverrides({});
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mealFilter === '1'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>조식</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMealFilter('ALL');
                  setDayMealOverrides({});
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mealFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>전체 식단</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-2 font-medium">
              💡 중식 / 석식 탭을 클릭하여 주간 식단을 비교할 수 있습니다.
            </div>
          </div>

          {/* Week Bento Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-bold">주간 식단표 불러오는 중...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {currentWeekDates.map((day) => {
                  const dayMeals = weekMeals.get(day.ymd) || [];

                  // Determine which meal to display for this day
                  const activeOverride = dayMealOverrides[day.ymd];
                  let targetMeal: ParsedMeal | undefined;

                  if (activeOverride) {
                    targetMeal = dayMeals.find((m) => m.mealCode === activeOverride);
                  } else if (mealFilter !== 'ALL') {
                    targetMeal = dayMeals.find((m) => m.mealCode === mealFilter);
                  } else {
                    targetMeal = dayMeals[0];
                  }

                  // If user filtered by specific meal (e.g. 석식) but only other meals exist
                  const hasOtherMeals = dayMeals.length > 0 && !targetMeal;

                  return (
                    <div
                      key={day.ymd}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800/60 transition-all"
                    >
                      <div className="space-y-2.5">
                        {/* Day Card Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
                          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                            {day.dayName}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {day.displayDate}
                          </span>
                        </div>

                        {/* If day has multiple meals, show quick toggle tabs right on the card */}
                        {dayMeals.length > 1 && mealFilter !== 'ALL' && (
                          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60">
                            {dayMeals.map((m) => {
                              const isCurrentActive =
                                (activeOverride && activeOverride === m.mealCode) ||
                                (!activeOverride && targetMeal?.mealCode === m.mealCode);

                              return (
                                <button
                                  key={m.mealCode}
                                  type="button"
                                  onClick={() =>
                                    setDayMealOverrides((prev) => ({
                                      ...prev,
                                      [day.ymd]: m.mealCode,
                                    }))
                                  }
                                  className={`flex-1 py-1 rounded-md text-[10px] font-extrabold transition-all ${
                                    isCurrentActive
                                      ? m.mealCode === '2'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : m.mealCode === '3'
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'bg-amber-600 text-white shadow-2xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                  }`}
                                >
                                  {m.mealName}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Meal Details */}
                        {mealFilter === 'ALL' && dayMeals.length > 0 ? (
                          <div className="space-y-3">
                            {dayMeals.map((m) => (
                              <div
                                key={m.mealCode}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                                      m.mealCode === '2'
                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    }`}
                                  >
                                    {m.mealName}
                                  </span>
                                  <span className="font-bold text-amber-600 dark:text-amber-400">
                                    {m.calories}
                                  </span>
                                </div>
                                <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200 pt-1">
                                  {m.dishes.map((d, i) => (
                                    <li key={i} className="line-clamp-1 leading-snug">
                                      • {d.cleanName}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : targetMeal ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                  targetMeal.mealCode === '2'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : targetMeal.mealCode === '3'
                                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {targetMeal.mealName}
                              </span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                ⚡ {targetMeal.calories}
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 pt-1">
                              {targetMeal.dishes.map((d, i) => (
                                <li key={i} className="line-clamp-1 leading-snug font-medium">
                                  • {d.cleanName}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : hasOtherMeals ? (
                          <div className="py-6 px-2 text-center rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="text-xs text-slate-400 font-bold">
                              {mealFilter === '2'
                                ? '중식 미운영'
                                : mealFilter === '3'
                                ? '석식 미운영'
                                : '해당 식단 없음'}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDayMealOverrides((prev) => ({
                                  ...prev,
                                  [day.ymd]: dayMeals[0].mealCode,
                                }));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold hover:underline inline-block"
                            >
                              {dayMeals[0].mealName} 메뉴 보기
                            </button>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 font-medium">
                            급식 정보 없음
                          </div>
                        )}
                      </div>

                      {/* Select Date Button */}
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
                        className="w-full py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                      >
                        이 날짜로 이동
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
