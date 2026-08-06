export interface NeisMealRow {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  MMEAL_SC_CODE: string; // 1: 조식, 2: 중식, 3: 석식
  MMEAL_SC_NM: string; // 조식, 중식, 석식
  MLSV_YMD: string; // YYYYMMDD
  MLSV_FGR?: number; // 급식인원수
  DDISH_NM: string; // 메뉴명 (HTML br 태그 포함)
  ORPLC_INFO?: string; // 원산지 정보
  CAL_INFO?: string; // 칼로리 정보
  NTR_INFO?: string; // 영양 정보
  MLSV_FROM_YMD?: string;
  MLSV_TO_YMD?: string;
}

export interface NeisApiResponse {
  mealServiceDietInfo?: [
    {
      head: Array<{
        list_total_count?: number;
        RESULT?: {
          CODE: string;
          MESSAGE: string;
        };
      }>;
    },
    {
      row: NeisMealRow[];
    }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

export interface DishItem {
  id: string;
  rawName: string;
  cleanName: string;
  allergyCodes: number[];
  hasHighlight?: boolean;
}

export interface NutritionItem {
  name: string;
  value: number;
  unit: string;
  standardValue?: number; // 일일 권장치 대비
  percentage?: number;
}

export interface OriginItem {
  ingredient: string;
  origin: string;
}

export interface ParsedMeal {
  mealCode: string; // "1" | "2" | "3"
  mealName: string; // "조식" | "중식" | "석식"
  dateString: string; // YYYYMMDD
  formattedDate: string; // YYYY.MM.DD (요일)
  schoolName: string;
  headCount?: number;
  calories: string;
  numericCalories: number;
  dishes: DishItem[];
  nutritions: NutritionItem[];
  origins: OriginItem[];
  allAllergyCodes: number[];
}

export interface DateSelection {
  year: number;
  month: number;
  day: number;
}
