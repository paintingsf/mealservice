import React, { useState } from 'react';
import { ParsedMeal } from '../types/meal';
import { ALLERGEN_DICT } from '../constants/allergens';
import { getDishEmoji } from '../utils/foodEmoji';
import {
  Flame,
  Users,
  Copy,
  Check,
  Heart,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Utensils,
  Leaf,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface MealCardProps {
  meals: ParsedMeal[];
  activeMealIndex: number;
  onSelectMealIndex: (index: number) => void;
  userAllergies: number[];
  onOpenAllergyFilter: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meals,
  activeMealIndex,
  onSelectMealIndex,
  userAllergies,
  onOpenAllergyFilter,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showAllNutritions, setShowAllNutritions] = useState(false);
  const [selectedAllergyCode, setSelectedAllergyCode] = useState<number | null>(null);

  const meal = meals[activeMealIndex];
  if (!meal) return null;

  // Check if any dish contains user's filtered allergies
  const allergyWarningDishes = meal.dishes.filter((dish) =>
    dish.allergyCodes.some((code) => userAllergies.includes(code))
  );

  // Copy meal text to clipboard
  const handleCopyMeal = async () => {
    const dishListText = meal.dishes.map((d, i) => `${i + 1}. ${d.cleanName}`).join('\n');
    const textToCopy = `🍱 [양정고등학교 ${meal.formattedDate} ${meal.mealName}]\n${dishListText}\n\n⚡ 열량: ${meal.calories}${
      meal.headCount ? ` (${meal.headCount}명 기준)` : ''
    }`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Like / Celebrate animation
  const handleLike = (e: React.MouseEvent) => {
    setLiked(!liked);
    if (!liked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        ticks: 150,
      });
    }
  };

  // Extract calorie number
  const calorieNumber = parseFloat(meal.calories.replace(/[^0-9.]/g, '')) || 0;
  // High school student lunch recommended calorie ~ 850 - 950 kcal
  const caloriePercent = Math.min(100, Math.round((calorieNumber / 900) * 100));

  return (
    <motion.div
      id="meal-bento-grid"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full grid grid-cols-12 gap-4 sm:gap-5"
    >
      {/* ========================================================
          BENTO CELL 1: MAIN DISHES MENU CARD (col-span-12 lg:col-span-7)
         ======================================================== */}
      <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5">
        {/* Header & Meal Type Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {/* Meal type tabs if multiple (조식 / 중식 / 석식) */}
            {meals.length > 1 ? (
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 gap-1">
                {meals.map((m, idx) => {
                  const isCurrent = idx === activeMealIndex;
                  return (
                    <button
                      key={m.mealCode}
                      type="button"
                      onClick={() => onSelectMealIndex(idx)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        isCurrent
                          ? m.mealCode === '3'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : m.mealCode === '1'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {m.mealCode === '2' && <span>☀️</span>}
                      {m.mealCode === '3' && <span>🌙</span>}
                      {m.mealCode === '1' && <span>🌅</span>}
                      <span>{m.mealName}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                    meal.mealCode === '3'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800'
                      : meal.mealCode === '1'
                      ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800'
                  }`}
                >
                  {meal.mealCode === '2' && <span>☀️</span>}
                  {meal.mealCode === '3' && <span>🌙</span>}
                  {meal.mealCode === '1' && <span>🌅</span>}
                  <span>{meal.mealName}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {meal.formattedDate}
                </span>
              </div>
            )}

            {/* Dish Count & Allergy Filter Button */}
            <button
              type="button"
              onClick={onOpenAllergyFilter}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
            >
              <span>알레르기 필터</span>
              {userAllergies.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {userAllergies.length}
                </span>
              )}
            </button>
          </div>

          {/* Allergy Warning Banner if matches exist */}
          {userAllergies.length > 0 && allergyWarningDishes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold">
                  주의: 알레르기 유발 식재료가 포함된 메뉴가 있습니다! ({allergyWarningDishes.length}개)
                </div>
                <div className="text-rose-700/90 dark:text-rose-300">
                  해당 메뉴: {allergyWarningDishes.map((d) => d.cleanName).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Dish List in Bento Layout */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
              <Utensils className="w-3.5 h-3.5 text-blue-600" />
              <span>오늘의 식단 메뉴 ({meal.dishes.length}종)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meal.dishes.map((dish, index) => {
                const hasUserAllergy = dish.allergyCodes.some((c) => userAllergies.includes(c));
                const emoji = getDishEmoji(dish.cleanName);

                return (
                  <div
                    key={dish.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                      hasUserAllergy
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0" role="img" aria-label="음식 이모지">
                          {emoji}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {dish.cleanName}
                          </div>
                        </div>
                      </div>

                      {hasUserAllergy && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-bold">
                          주의
                        </span>
                      )}
                    </div>

                    {/* Allergen Badges */}
                    {dish.allergyCodes.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 pt-1">
                        {dish.allergyCodes.map((code) => {
                          const info = ALLERGEN_DICT[code];
                          const isUserAllergic = userAllergies.includes(code);

                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setSelectedAllergyCode(code)}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all flex items-center gap-0.5 ${
                                isUserAllergic
                                  ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400'
                                  : info?.badgeBg || 'bg-slate-200 text-slate-700'
                              } ${info?.badgeText || ''} hover:scale-105 active:scale-95`}
                              title={`${info?.name || code} 정보 확인`}
                            >
                              <span>{info?.shortName || `#${code}`}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allergen Quick Detail Popup / Tooltip */}
          <AnimatePresence>
            {selectedAllergyCode && ALLERGEN_DICT[selectedAllergyCode] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between gap-2 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-700 dark:text-blue-300">
                    [알레르기 {selectedAllergyCode}번]
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {ALLERGEN_DICT[selectedAllergyCode].name} ({ALLERGEN_DICT[selectedAllergyCode].category})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAllergyCode(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-0.5 rounded"
                >
                  닫기
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bento Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <button
            id="copy-meal-btn"
            type="button"
            onClick={handleCopyMeal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">식단 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>식단 텍스트 복사</span>
              </>
            )}
          </button>

          <button
            id="like-meal-btn"
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all ${
              liked
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 border border-rose-200 dark:border-rose-800 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{liked ? '오늘 식단 최고!' : '맛있겠다'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: CALORIES & NUTRITION BENTO CARDS
         ======================================================== */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 sm:gap-5">
        {/* ========================================================
            BENTO CELL 2: CALORIES & HEADCOUNT CARD
           ======================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                총 열량 분석
              </span>
            </div>
            {meal.headCount && meal.headCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{meal.headCount}명 기준</span>
              </div>
            )}
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {calorieNumber > 0 ? calorieNumber.toLocaleString() : meal.calories}
              <span className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-500 ml-1.5">
                kcal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              고등학생 1끼 권장 영양 열량 (약 900 kcal) 대비 {caloriePercent}%
            </p>
          </div>

          {/* Calorie Progress Gauge Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span>0 kcal</span>
              <span>권장량 (900 kcal)</span>
              <span>1,200+ kcal</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            BENTO CELL 3: NUTRITION BREAKDOWN CARD
           ======================================================== */}
        <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl sm:rounded-[2rem] border border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  주요 영양 성분표
                </h3>
                <p className="text-[10px] text-slate-400">
                  {meal.nutritions.length > 0 ? `${meal.nutritions.length}개 항목 분석` : '데이터 수신 완료'}
                </p>
              </div>
            </div>

            {meal.nutritions.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllNutritions(!showAllNutritions)}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
              >
                <span>{showAllNutritions ? '간략히' : '전체보기'}</span>
                {showAllNutritions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Quick Macronutrients Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {meal.nutritions
              .slice(0, showAllNutritions ? meal.nutritions.length : 4)
              .map((nut) => (
                <div
                  key={nut.name}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1"
                >
                  <div className="text-[11px] font-medium text-slate-400 line-clamp-1">{nut.name}</div>
                  <div className="text-sm font-bold text-white">
                    {nut.value} <span className="text-[11px] font-normal text-slate-400">{nut.unit}</span>
                  </div>
                  {nut.percentage !== undefined && (
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-blue-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, nut.percentage)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          BENTO CELL 4: ORIGIN OF INGREDIENTS CARD (col-span-12)
         ======================================================== */}
      {meal.origins.length > 0 && (
        <div className="col-span-12 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl sm:rounded-[2rem] border border-emerald-200/80 dark:border-emerald-900/60 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                식재료 원산지 정보 ({meal.origins.length}종)
              </h3>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                안전하고 신선한 학교 급식 식재료의 출처입니다
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
            {meal.origins.map((item, idx) => (
              <div
                key={`${item.ingredient}-${idx}`}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/60 text-xs shadow-2xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {item.ingredient}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-2 shrink-0">
                  {item.origin}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
