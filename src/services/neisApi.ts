import { NeisApiResponse, NeisMealRow, ParsedMeal, DishItem, NutritionItem, OriginItem } from '../types/meal';

const NEIS_BASE_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
export const YANGJEONG_OFFICE_CODE = 'C10'; // 부산광역시교육청
export const YANGJEONG_SCHOOL_CODE = '7150152'; // 양정고등학교
export const YANGJEONG_SCHOOL_NAME = '양정고등학교';

// In-memory cache to ensure snappy performance
const mealCache = new Map<string, ParsedMeal[]>();

/**
 * Format Date object to YYYYMMDD string
 */
export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Format YYYYMMDD to Korean display string with Day of Week
 */
export function formatYMDToKoreanDate(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  const y = ymd.slice(0, 4);
  const m = ymd.slice(4, 6);
  const d = ymd.slice(6, 8);
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = weekDays[dateObj.getDay()];
  return `${y}년 ${Number(m)}월 ${Number(d)}일 (${dayOfWeek})`;
}

/**
 * Parse a raw dish string like "백미밥 <br/>계란빵 (1.2.5.6)<br/>쇠고기미역국(양정) (5.6.16)"
 */
export function parseDishes(rawDdish: string): DishItem[] {
  if (!rawDdish) return [];

  // Replace <br/>, <br>, \n with a delimiter
  const lines = rawDdish
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, idx) => {
    // Extract allergy code numbers inside parentheses, e.g. (1.2.5.6) or (13) or (5.6.10.13)
    const allergyMatch = line.match(/\(([\d\.\s]+)\)/);
    let allergyCodes: number[] = [];

    if (allergyMatch && allergyMatch[1]) {
      allergyCodes = allergyMatch[1]
        .split('.')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 19);
    }

    // Clean dish name: remove (1.2.5) and keep or clean redundant brackets if appropriate
    let cleanName = line.replace(/\(([\d\.\s]+)\)/g, '').trim();
    // Clean trailing empty spaces or symbols
    cleanName = cleanName.replace(/\s+/g, ' ');

    return {
      id: `dish-${idx}-${cleanName}`,
      rawName: line,
      cleanName: cleanName,
      allergyCodes,
    };
  });
}

/**
 * Parse nutrition info string like "탄수화물(g) : 139.3<br/>단백질(g) : 45.4..."
 */
export function parseNutritions(rawNtr?: string): NutritionItem[] {
  if (!rawNtr) return [];

  const lines = rawNtr
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: NutritionItem[] = [];

  for (const line of lines) {
    // Format is "항목명(단위) : 수치"
    const match = line.match(/^([^:(]+)(?:\(([^)]+)\))?\s*:\s*([\d.]+)/);
    if (match) {
      const name = match[1].trim();
      const unit = match[2]?.trim() || 'g';
      const value = parseFloat(match[3]);

      let standardValue = 0;
      if (name.includes('탄수화물')) standardValue = 324;
      else if (name.includes('단백질')) standardValue = 55;
      else if (name.includes('지방')) standardValue = 54;
      else if (name.includes('칼슘')) standardValue = 700;
      else if (name.includes('철분')) standardValue = 12;
      else if (name.includes('비타민C')) standardValue = 100;

      const percentage = standardValue > 0 ? Math.min(100, Math.round((value / standardValue) * 100)) : undefined;

      results.push({
        name,
        value,
        unit,
        standardValue: standardValue > 0 ? standardValue : undefined,
        percentage,
      });
    }
  }

  return results;
}

/**
 * Parse origin of ingredients string
 */
export function parseOrigins(rawOrigins?: string): OriginItem[] {
  if (!rawOrigins) return [];

  const lines = rawOrigins
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: OriginItem[] = [];

  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const ingredient = parts[0].trim();
      const origin = parts.slice(1).join(':').trim();
      if (ingredient && origin && ingredient !== '비고') {
        results.push({
          ingredient,
          origin,
        });
      }
    }
  }

  return results;
}

/**
 * Convert raw Neis row to ParsedMeal object
 */
export function convertRowToParsedMeal(row: NeisMealRow): ParsedMeal {
  const dishes = parseDishes(row.DDISH_NM);
  const nutritions = parseNutritions(row.NTR_INFO);
  const origins = parseOrigins(row.ORPLC_INFO);

  // Extract all distinct allergy codes present in all dishes
  const allAllergySet = new Set<number>();
  dishes.forEach((d) => d.allergyCodes.forEach((c) => allAllergySet.add(c)));
  const allAllergyCodes = Array.from(allAllergySet).sort((a, b) => a - b);

  // Parse numeric calorie
  let numericCalories = 0;
  if (row.CAL_INFO) {
    const calMatch = row.CAL_INFO.match(/([\d.]+)/);
    if (calMatch) {
      numericCalories = parseFloat(calMatch[1]);
    }
  }

  return {
    mealCode: row.MMEAL_SC_CODE,
    mealName: row.MMEAL_SC_NM || (row.MMEAL_SC_CODE === '1' ? '조식' : row.MMEAL_SC_CODE === '2' ? '중식' : '석식'),
    dateString: row.MLSV_YMD,
    formattedDate: formatYMDToKoreanDate(row.MLSV_YMD),
    schoolName: row.SCHUL_NM || YANGJEONG_SCHOOL_NAME,
    headCount: row.MLSV_FGR,
    calories: row.CAL_INFO || (numericCalories > 0 ? `${numericCalories} Kcal` : '칼로리 정보 없음'),
    numericCalories,
    dishes,
    nutritions,
    origins,
    allAllergyCodes,
  };
}

/**
 * Fetch meals for a specific date (YYYYMMDD)
 */
export async function fetchMealsByDate(ymd: string): Promise<ParsedMeal[]> {
  if (mealCache.has(ymd)) {
    return mealCache.get(ymd)!;
  }

  const url = `${NEIS_BASE_URL}?ATPT_OFCDC_SC_CODE=${YANGJEONG_OFFICE_CODE}&SD_SCHUL_CODE=${YANGJEONG_SCHOOL_CODE}&MLSV_YMD=${ymd}&type=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NeisApiResponse = await response.json();

    // Check if result is empty or no meal
    if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
      mealCache.set(ymd, []);
      return [];
    }

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1]?.row) {
      const rows = data.mealServiceDietInfo[1].row;
      const parsed = rows.map(convertRowToParsedMeal);
      // Sort by meal code (1: 조식, 2: 중식, 3: 석식)
      parsed.sort((a, b) => Number(a.mealCode) - Number(b.mealCode));
      mealCache.set(ymd, parsed);
      return parsed;
    }

    mealCache.set(ymd, []);
    return [];
  } catch (error) {
    console.warn(`Failed to fetch meal for date ${ymd}:`, error);
    // Don't cache network errors so retry is possible
    throw error;
  }
}

/**
 * Fetch meals for a date range (YYYYMMDD to YYYYMMDD)
 */
export async function fetchMealsByDateRange(fromYmd: string, toYmd: string): Promise<Map<string, ParsedMeal[]>> {
  const url = `${NEIS_BASE_URL}?ATPT_OFCDC_SC_CODE=${YANGJEONG_OFFICE_CODE}&SD_SCHUL_CODE=${YANGJEONG_SCHOOL_CODE}&MLSV_FROM_YMD=${fromYmd}&MLSV_TO_YMD=${toYmd}&type=json`;

  const resultMap = new Map<string, ParsedMeal[]>();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NeisApiResponse = await response.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1]?.row) {
      const rows = data.mealServiceDietInfo[1].row;
      for (const row of rows) {
        const meal = convertRowToParsedMeal(row);
        const list = resultMap.get(meal.dateString) || [];
        list.push(meal);
        resultMap.set(meal.dateString, list);
        // Also save to global cache
        mealCache.set(meal.dateString, list);
      }
    }

    return resultMap;
  } catch (error) {
    console.warn(`Failed to fetch date range ${fromYmd}~${toYmd}:`, error);
    throw error;
  }
}

/**
 * Find next available meal day from current date
 */
export async function findNextMealDate(currentYmd: string): Promise<string | null> {
  const curY = Number(currentYmd.slice(0, 4));
  const curM = Number(currentYmd.slice(4, 6)) - 1;
  const curD = Number(currentYmd.slice(6, 8));

  const startDate = new Date(curY, curM, curD + 1);
  const endDate = new Date(curY, curM, curD + 14); // check within next 2 weeks

  const fromYmd = formatDateToYMD(startDate);
  const toYmd = formatDateToYMD(endDate);

  try {
    const rangeMap = await fetchMealsByDateRange(fromYmd, toYmd);
    const sortedDates = Array.from(rangeMap.keys()).sort();
    for (const d of sortedDates) {
      if (rangeMap.get(d) && rangeMap.get(d)!.length > 0) {
        return d;
      }
    }
  } catch (e) {
    console.error('Error finding next meal date:', e);
  }
  return null;
}
