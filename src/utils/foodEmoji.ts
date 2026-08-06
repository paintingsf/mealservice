/**
 * Utility to assign an appropriate food emoji based on dish name
 */
export function getDishEmoji(dishName: string): string {
  const name = dishName.toLowerCase();

  // Rice / Grain
  if (name.includes('밥') || name.includes('라이스') || name.includes('덮밥') || name.includes('비빔밥') || name.includes('볶음밥') || name.includes('주먹밥') || name.includes('초밥')) {
    return '🍚';
  }

  // Soups & Stews & Noodles
  if (name.includes('국') || name.includes('탕') || name.includes('찌개') || name.includes('스프') || name.includes('전골') || name.includes('수제비') || name.includes('육수')) {
    return '🥘';
  }
  if (name.includes('우동') || name.includes('라면') || name.includes('국수') || name.includes('칼국수') || name.includes('짬뽕') || name.includes('짜장') || name.includes('모밀') || name.includes('소바')) {
    return '🍜';
  }
  if (name.includes('파스타') || name.includes('스파게티')) {
    return '🍝';
  }

  // Poultry
  if (name.includes('닭') || name.includes('치킨') || name.includes('닭갈비') || name.includes('닭강정') || name.includes('너겟') || name.includes('봉') || name.includes('윙') || name.includes('삼계')) {
    return '🍗';
  }

  // Meat (Pork, Beef, Steak, Cutlet)
  if (
    name.includes('고기') ||
    name.includes('불고기') ||
    name.includes('갈비') ||
    name.includes('돈까스') ||
    name.includes('까스') ||
    name.includes('스테이크') ||
    name.includes('삼겹') ||
    name.includes('수육') ||
    name.includes('족발') ||
    name.includes('함박') ||
    name.includes('너비아니') ||
    name.includes('제육') ||
    name.includes('소시지') ||
    name.includes('햄') ||
    name.includes('베이컨') ||
    name.includes('떡갈비') ||
    name.includes('장조림')
  ) {
    return '🥩';
  }

  // Seafood
  if (
    name.includes('생선') ||
    name.includes('연어') ||
    name.includes('고등어') ||
    name.includes('꽁치') ||
    name.includes('오징어') ||
    name.includes('새우') ||
    name.includes('낙지') ||
    name.includes('쭈꾸미') ||
    name.includes('가자미') ||
    name.includes('꽃게') ||
    name.includes('조개') ||
    name.includes('어묵') ||
    name.includes('참치') ||
    name.includes('장어') ||
    name.includes('해물') ||
    name.includes('명태') ||
    name.includes('대구') ||
    name.includes('동태')
  ) {
    return '🐟';
  }

  // Eggs
  if (name.includes('계란') || name.includes('달걀') || name.includes('오믈렛') || name.includes('후라이') || name.includes('스크램블')) {
    return '🍳';
  }

  // Kimchi
  if (name.includes('김치') || name.includes('깍두기') || name.includes('겉절이') || name.includes('열무') || name.includes('석박지') || name.includes('총각')) {
    return '🥬';
  }

  // Salad, Veggies, Side dishes
  if (name.includes('샐러드') || name.includes('나물') || name.includes('무침') || name.includes('야채') || name.includes('채소') || name.includes('시금치') || name.includes('콩나물') || name.includes('도라지') || name.includes('오이') || name.includes('쌈') || name.includes('생채')) {
    return '🥗';
  }

  // Dim sum, Dumplings, Fried
  if (name.includes('만두') || name.includes('전') || name.includes('부침') || name.includes('튀김') || name.includes('감자') || name.includes('고구마') || name.includes('김말이') || name.includes('탕수육') || name.includes('춘권')) {
    return '🥟';
  }

  // Bakery & Dessert
  if (name.includes('빵') || name.includes('토스트') || name.includes('샌드위치') || name.includes('와플') || name.includes('도넛') || name.includes('마카롱') || name.includes('쿠키') || name.includes('떡') || name.includes('케익') || name.includes('푸딩') || name.includes('파이') || name.includes('츄러스')) {
    return '🥐';
  }

  // Dairy & Drinks
  if (name.includes('우유') || name.includes('요구르트') || name.includes('주스') || name.includes('쥬스') || name.includes('에이드') || name.includes('음료') || name.includes('라떼') || name.includes('스무디') || name.includes('식혜')) {
    return '🧃';
  }

  // Fruit
  if (
    name.includes('사과') ||
    name.includes('바나나') ||
    name.includes('딸기') ||
    name.includes('포도') ||
    name.includes('수박') ||
    name.includes('멜론') ||
    name.includes('오렌지') ||
    name.includes('귤') ||
    name.includes('키위') ||
    name.includes('자두') ||
    name.includes('복숭아') ||
    name.includes('파인애플') ||
    name.includes('토마토') ||
    name.includes('과일')
  ) {
    return '🍎';
  }

  return '🍱';
}
