import React from 'react';
import { ALL_ALLERGEN_LIST } from '../constants/allergens';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AllergyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllergies: number[];
  onToggleAllergy: (code: number) => void;
  onResetAllergies: () => void;
}

export const AllergyFilterModal: React.FC<AllergyFilterModalProps> = ({
  isOpen,
  onClose,
  selectedAllergies,
  onToggleAllergy,
  onResetAllergies,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  알레르기 유발 식품 필터
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  선택한 알레르기 식품이 포함된 메뉴는 식단에서 즉시 강조됩니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Allergen List (1 ~ 19) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_ALLERGEN_LIST.map((item) => {
                const isSelected = selectedAllergies.includes(item.code);

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onToggleAllergy(item.code)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                        #{item.code}
                      </div>
                      <div className="text-xs font-bold leading-tight">{item.shortName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.category}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResetAllergies}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>선택 초기화</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95"
            >
              완료 ({selectedAllergies.length}개 선택)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
