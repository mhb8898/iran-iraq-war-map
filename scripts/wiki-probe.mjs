// Dev helper: prints coordinates for Wikipedia titles, 50 per Action API call.
const titles = process.argv.slice(2);
for (let i = 0; i < titles.length; i += 50) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', formatversion: '2', redirects: '1', prop: 'coordinates|pageimages', piprop: 'name', titles: titles.slice(i, i + 50).join('|') }).forEach(([k, v]) => u.searchParams.set(k, v));
  const j = await (await fetch(u, { headers: { 'User-Agent': 'iran-iraq-war-map/0.1 (hobby project)' } })).json();
  for (const p of j.query.pages) console.log(`${p.missing ? 'MISSING ' : ''}${p.title} ${p.coordinates ? p.coordinates[0].lat.toFixed(3) + ',' + p.coordinates[0].lon.toFixed(3) : '-'} ${p.pageimage ? 'img' : ''}`);
}
