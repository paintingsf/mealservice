import React from 'react';
import { CalendarX, Sparkles, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyMealStateProps {
  dateString: string;
  formattedDate: string;
  isWeekend: boolean;
  onFindNextMeal?: () => void;
  isLoadingNextMeal?: boolean;
}

export const EmptyMealState: React.FC<EmptyMealStateProps> = ({
  formattedDate,
  isWeekend,
  onFindNextMeal,
  isLoadingNextMeal,
}) => {
  return (
    <motion.div
      id="empty-meal-state"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
        {isWeekend ? <Coffee className="w-8 h-8" /> : <CalendarX className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {isWeekend ? '즐거운 주말입니다! 🎉' : '등록된 급식 정보가 없습니다'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isWeekend
            ? `${formattedDate}은(는) 주말로 학교 급식이 운영되지 않습니다. 편안한 휴일 보내세요!`
            : `${formattedDate}은(는) 방학, 재량휴업일, 공휴일 또는 아직 나이스(NEIS)에 식단이 등록되지 않은 날입니다.`}
        </p>
      </div>

      {onFindNextMeal && (
        <button
          id="find-next-meal-btn"
          type="button"
          onClick={onFindNextMeal}
          disabled={isLoadingNextMeal}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isLoadingNextMeal ? '다음 급식일 탐색 중...' : '가장 가까운 다음 급식일 확인하기'}</span>
        </button>
      )}
    </motion.div>
  );
};
