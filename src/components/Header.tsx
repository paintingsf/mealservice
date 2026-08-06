import React from 'react';
import { UtensilsCrossed, CalendarDays, ShieldAlert, Moon, Sun, School, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenWeeklyModal: () => void;
  onOpenAllergyModal: () => void;
  userAllergiesCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenWeeklyModal,
  onOpenAllergyModal,
  userAllergiesCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header id="app-header" className="w-full space-y-4 mb-5">
      {/* Top Bento Utility Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[1.75rem] border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: School Badge with Live Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <School className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">부산 양정고등학교</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NEIS 연동
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              교육행정정보시스템 급식 식단 데이터 실시간 조회
            </p>
          </div>
        </div>

        {/* Right: Bento Quick Action Cluster */}
        <div className="flex items-center gap-1.5">
          <button
            id="open-weekly-modal-btn"
            type="button"
            onClick={onOpenWeeklyModal}
            title="주간 식단표 보기"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>주간 식단표</span>
          </button>

          <button
            id="open-allergy-modal-btn"
            type="button"
            onClick={onOpenAllergyModal}
            title="알레르기 필터 설정"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              userAllergiesCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>알레르기</span>
            {userAllergiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {userAllergiesCount}
              </span>
            )}
          </button>

          <button
            id="sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? '스크롤 효과음 끄기' : '스크롤 효과음 켜기'}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Title Hero Section */}
      <div className="text-center py-2 space-y-1.5">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span>양정고 급식 정보</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          원하는 날짜를 아래 휠 스크롤로 쫀득하게 선택해보세요
        </p>
      </div>
    </header>
  );
};
