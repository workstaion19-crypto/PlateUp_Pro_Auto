async function run() {
  // تحقق إذا كان SOURCE موجود، لو مش موجود أنشئ ملف فارغ
  if (!fs.existsSync(SOURCE)) {
    fs.writeFileSync(SOURCE, JSON.stringify({ items: [], domain: '' }, null, 2), 'utf8');
    console.log('Created empty source.json');
  }

  // بعد كده اقرأ الملف بأمان
  const src = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const items = src.items || [];
  const domain = src.domain || '';
  const written = [];

  for (let name of items) {
    try {
      console.log('Fetching', name);
      const meal = await fetchMealByName(name);
      if (!meal) { console.warn('Not found', name); continue; }
      const slug = slugify(meal.strMeal || name);
      const ingredients = [];
      for (let i=1;i<=20;i++) {
        const ing = meal['strIngredient'+i];
        const mea = meal['strMeasure'+i] || '';
        if (ing && ing.trim()) ingredients.push((mea + ' ' + ing).trim());
      }
      const article = {
        id: meal.idMeal,
        title: meal.strMeal,
        slug: slug,
        thumb: meal.strMealThumb || '',
        category: meal.strCategory || '',
        area: meal.strArea || '',
        instructions: meal.strInstructions || '',
        ingredients: ingredients,
        english: true,
        arabic_subtitle: 'وصفة صحية سريعة',
        canonical: (domain? domain + '/articles/' + slug : '/articles/' + slug)
      };
      written.push(article);
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error('Error', e && e.message);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ ts: Date.now(), list: written }, null, 2), 'utf8');
  console.log('Wrote', OUT, 'items=', written.length);
}

run().catch(e => { console.error(e); process.exit(1); });
