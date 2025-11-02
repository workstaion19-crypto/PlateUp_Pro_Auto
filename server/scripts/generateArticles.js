#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');
const SOURCE = path.join(__dirname, '..', 'data', 'source.json');
const OUT = path.join(__dirname, '..', 'data', 'articles.json');

function fetchMealByName(name) {
  const url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(name);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(raw);
          resolve(j.meals && j.meals[0] ? j.meals[0] : null);
        } catch (e) { resolve(null); }
      });
    }).on('error', (e) => resolve(null));
  });
}

function slugify(s) {
  return s.toString().toLowerCase().replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
}

async function run() {
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
