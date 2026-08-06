import React, { useState, useEffect, useCallback } from 'react';
import { DateSelection, ParsedMeal } from './types/meal';
import { fetchMealsByDate, formatYMDToKoreanDate, findNextMealDate } from './services/neisApi';
import { Header } from './components/Header';
import { SpringDatePicker } from './components/SpringDatePicker';
import { MealCard } from './components/MealCard';
import { EmptyMealState } from './components/EmptyMealState';
import { AllergyFilterModal } from './components/AllergyFilterModal';
import { WeeklyMealModal } from './components/WeeklyMealModal';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Initialize date to current system date
  const [selectedDate, setSelectedDate] = useState<DateSelection>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  });

  const [meals, setMeals] = useState<ParsedMeal[]>([]);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchingNextMeal, setSearchingNextMeal] = useState(false);

  // Modals & User preferences
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yangjeong_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Dark mode preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yangjeong_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // User Allergies preference
  const [userAllergies, setUserAllergies] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yangjeong_user_allergies');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('yangjeong_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Toggle Sound
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('yangjeong_sound_enabled', String(next));
      return next;
    });
  };

  // Toggle Allergy
  const handleToggleAllergy = (code: number) => {
    setUserAllergies((prev) => {
      const exists = prev.includes(code);
      const updated = exists ? prev.filter((c) => c !== code) : [...prev, code].sort((a, b) => a - b);
      localStorage.setItem('yangjeong_user_allergies', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset Allergies
  const handleResetAllergies = () => {
    setUserAllergies([]);
    localStorage.setItem('yangjeong_user_allergies', JSON.stringify([]));
  };

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Current formatted YMD string
  const currentYmd = `${selectedDate.year}${String(selectedDate.month).padStart(2, '0')}${String(
    selectedDate.day
  ).padStart(2, '0')}`;

  // Fetch meals on date change
  const loadMealForDate = useCallback(async (ymd: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMealsByDate(ymd);
      setMeals(result);
      setActiveMealIndex(0);
    } catch (err: unknown) {
      console.error('Fetch meal error:', err);
      setError('급식 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMealForDate(currentYmd);
  }, [currentYmd, loadMealForDate]);

  // Quick Jump Presets
  const jumpToToday = () => {
    const now = new Date();
    setSelectedDate({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    });
  };

  const jumpToTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    });
  };

  const jumpToYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    });
  };

  // Find next available meal day
  const handleFindNextMeal = async () => {
    setSearchingNextMeal(true);
    try {
      const nextYmd = await findNextMealDate(currentYmd);
      if (nextYmd) {
        setSelectedDate({
          year: Number(nextYmd.slice(0, 4)),
          month: Number(nextYmd.slice(4, 6)),
          day: Number(nextYmd.slice(6, 8)),
        });
      } else {
        const d = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
        d.setDate(d.getDate() + 7);
        setSelectedDate({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
        });
      }
    } finally {
      setSearchingNextMeal(false);
    }
  };

  // Selected date info
  const dateObj = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const formattedDate = formatYMDToKoreanDate(currentYmd);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* Bento Layout Container */}
      <main className="w-full max-w-4xl lg:max-w-5xl flex flex-col space-y-5">
        {/* Bento Top Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenWeeklyModal={() => setIsWeeklyModalOpen(true)}
          onOpenAllergyModal={() => setIsAllergyModalOpen(true)}
          userAllergiesCount={userAllergies.length}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        {/* Bento Hero Card: 쫀득한 3D Drum Date Picker */}
        <SpringDatePicker
          date={selectedDate}
          onChange={setSelectedDate}
          onQuickJumpToday={jumpToToday}
          onQuickJumpTomorrow={jumpToTomorrow}
          onQuickJumpYesterday={jumpToYesterday}
          onQuickJumpNextMeal={meals.length === 0 ? handleFindNextMeal : undefined}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        {/* Meal Bento Showcase Area */}
        <section id="meal-content-section" className="w-full min-h-[300px] flex flex-col">
          {loading ? (
            <div className="w-full h-72 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center gap-3.5 text-slate-500 dark:text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {selectedDate.month}월 {selectedDate.day}일 급식 정보를 불러오는 중...
              </p>
            </div>
          ) : error ? (
            <div className="w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-rose-200 dark:border-rose-900 p-8 shadow-sm flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-9 h-9 text-rose-500" />
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
              <button
                type="button"
                onClick={() => loadMealForDate(currentYmd)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>다시 불러오기</span>
              </button>
            </div>
          ) : meals.length > 0 ? (
            <MealCard
              meals={meals}
              activeMealIndex={activeMealIndex}
              onSelectMealIndex={setActiveMealIndex}
              userAllergies={userAllergies}
              onOpenAllergyFilter={() => setIsAllergyModalOpen(true)}
            />
          ) : (
            <EmptyMealState
              dateString={currentYmd}
              formattedDate={formattedDate}
              isWeekend={isWeekend}
              onFindNextMeal={handleFindNextMeal}
              isLoadingNextMeal={searchingNextMeal}
            />
          )}
        </section>

        {/* Footer info */}
        <footer className="pt-6 pb-2 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <p>출처: 교육부 NEIS(나이스) 교육행정정보 개방포털 OpenAPI</p>
          <p>© 부산 양정고등학교 급식 정보 서비스</p>
        </footer>
      </main>

      {/* Allergy Settings Modal */}
      <AllergyFilterModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        selectedAllergies={userAllergies}
        onToggleAllergy={handleToggleAllergy}
        onResetAllergies={handleResetAllergies}
      />

      {/* Weekly Meals Preview Modal */}
      <WeeklyMealModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        baseDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  );
}
