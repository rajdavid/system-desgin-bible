/**
 * Extract all 265 questions from system_design_bible.html
 * Outputs structured JSON data for questions.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '../../system_design_bible.html'), 'utf8');

// Determine which bucket/tab each question belongs to
const bucketRanges = [];
const panelMatches = [...html.matchAll(/id="panel-(b\d+)"[\s\S]*?(?=id="panel-b|$)/g)];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[()\/&]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function parseDifficulty(tags) {
  if (tags.includes('tg-e')) return 'Easy';
  if (tags.includes('tg-m')) return 'Medium';
  if (tags.includes('tg-h')) return 'Hard';
  return 'Medium';
}

function parseFrequency(tagsHtml) {
  const freqMatch = tagsHtml.match(/tg-f">(.*?)<\/span>/);
  return freqMatch ? freqMatch[1] : null;
}

function parseTags(tagsHtml) {
  const concepts = [];
  const re = /tg tg-c">(.*?)<\/span>/g;
  let m;
  while ((m = re.exec(tagsHtml)) !== null) {
    concepts.push(m[1]);
  }
  return concepts;
}

function parseCompanies(tagsHtml) {
  const match = tagsHtml.match(/tg tg-co">(.*?)<\/span>/);
  if (!match) return [];
  return match[1].split(/\s+/).filter(c => c.length > 1);
}

function parseResources(qbHtml) {
  const resources = [];
  const re = /<a\s+href="(.*?)"[^>]*>(.*?)<\/a>/g;
  let m;
  while ((m = re.exec(qbHtml)) !== null) {
    resources.push({ url: m[1], label: m[2].trim() });
  }
  return resources;
}

function parseAnswer(qbHtml) {
  // Get the .at content
  const atMatch = qbHtml.match(/<div class="at">([\s\S]*?)<\/div>(?:\s*<div class="dg">|<div class="sl">|$)/);
  if (!atMatch) return '';
  let text = atMatch[1];
  // Strip HTML but keep structure
  text = text.replace(/<h4>(.*?)<\/h4>/g, '\n### $1\n');
  text = text.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  text = text.replace(/<code>(.*?)<\/code>/g, '`$1`');
  text = text.replace(/<p>/g, '');
  text = text.replace(/<\/p>/g, '\n');
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function parseDiagramNodes(dgHtml) {
  if (!dgHtml) return null;
  const nodes = [];
  const nodeRe = /<div class="nd ([^"]+)">([\s\S]*?)<\/div>/g;
  let m;
  let id = 0;
  while ((m = nodeRe.exec(dgHtml)) !== null) {
    const cls = m[1];
    let content = m[2].replace(/<small>(.*?)<\/small>/g, '|$1').replace(/<[^>]*>/g, '').trim();
    const [label, subtitle] = content.split('|');
    let type = 'service';
    if (cls.includes('nd-ext')) type = 'client'; 
    else if (cls.includes('nd-svc')) type = 'service';
    else if (cls.includes('nd-db')) type = 'database';
    else if (cls.includes('nd-cache')) type = 'cache';
    else if (cls.includes('nd-q')) type = 'queue';
    else if (cls.includes('nd-dec')) type = 'decision';
    else if (cls.includes('nd-warn')) type = 'warning';
    else if (cls.includes('nd-ok')) type = 'success';
    nodes.push({ id: `n${id++}`, type, label: label.trim(), subtitle: subtitle?.trim() });
  }
  return nodes.length ? nodes : null;
}

function parseDiagramTitle(dgHtml) {
  if (!dgHtml) return null;
  const m = dgHtml.match(/<div class="dg-title">(.*?)<\/div>/);
  return m ? m[1].trim() : null;
}

// Find all <div class="qc"...> matches with their positions
const qcMatches = [...html.matchAll(/<div class="qc"[^>]*>/g)];
const questions = [];

// Find bucket panel positions in the original HTML
const b2Pos = html.indexOf('id="panel-b2"');
const b3Pos = html.indexOf('id="panel-b3"');
const b4Pos = html.indexOf('id="panel-b4"');

for (let idx = 0; idx < qcMatches.length; idx++) {
  const qcMatch = qcMatches[idx];
  const startPos = qcMatch.index + qcMatch[0].length;
  const endPos = idx + 1 < qcMatches.length ? qcMatches[idx + 1].index : html.length;
  const block = html.slice(startPos, endPos);

  // Get number from <span class="qr">#N</span>
  const numMatch = block.match(/<span class="qr">#(\d+)<\/span>/);
  if (!numMatch) continue;
  const num = parseInt(numMatch[1]);

  // Title
  const titleMatch = block.match(/<div class="qt">([\s\S]*?)<\/div>/);
  if (!titleMatch) continue;
  let title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
  
  // Tags HTML
  const tagsMatch = block.match(/<div class="tags">([\s\S]*?)<\/div>/);
  const tagsHtml = tagsMatch ? tagsMatch[1] : '';
  
  // Answer body
  const qbMatch = block.match(/<div class="qb">([\s\S]*?)$/);
  const qbHtml = qbMatch ? qbMatch[1] : '';

  // Diagram data
  const dgMatch = block.match(/<div class="dg">([\s\S]*?)<\/div>\s*<div class="sl">/);
  const dgHtml = dgMatch ? dgMatch[1] : null;

  // Determine bucket by this question's actual position in the HTML
  const qPos = qcMatch.index;
  let bucket = 1;
  if (b4Pos > 0 && qPos > b4Pos) bucket = 4;
  else if (b3Pos > 0 && qPos > b3Pos) bucket = 3;
  else if (b2Pos > 0 && qPos > b2Pos) bucket = 2;

  // Tier within bucket
  let tier = null;
  const precedingHtml = html.slice(Math.max(0, qPos - 2000), qPos);
  if (precedingHtml.includes('Tier 1')) tier = 1;
  else if (precedingHtml.includes('Tier 2')) tier = 2;
  else if (precedingHtml.includes('Tier 3')) tier = 3;

  const q = {
    number: num,
    slug: slugify(title),
    title,
    difficulty: parseDifficulty(tagsHtml),
    frequency: parseFrequency(tagsHtml),
    tags: parseTags(tagsHtml),
    companies: parseCompanies(tagsHtml),
    answer: parseAnswer(qbHtml),
    resources: parseResources(qbHtml),
    diagramTitle: parseDiagramTitle(dgHtml),
    diagramNodes: parseDiagramNodes(dgHtml),
    bucket,
    tier,
    status: 'coming-soon',
  };
  questions.push(q);
}

// Override URL Shortener with original curated data
const urlShortener = questions.find(q => q.title.includes('URL Shortener'));
if (urlShortener) {
  urlShortener.slug = 'url-shortener';
  urlShortener.subtitle = 'TinyURL / Bit.ly';
  urlShortener.summary = 'Generate short unique aliases for long URLs. Handles 500M new URLs/month with a 100:1 read:write ratio — roughly 200K redirects per second. Classic problem for reasoning about caching layers, connection pooling, key generation services, and consensus coordination.';
  urlShortener.status = 'available';
  urlShortener.tags = ['Hashing', 'DB Design', 'Caching', 'Key Generation', 'Sharding'];
}

console.log(`Extracted ${questions.length} questions`);
console.log(`Bucket 1: ${questions.filter(q => q.bucket === 1).length}`);
console.log(`Bucket 2: ${questions.filter(q => q.bucket === 2).length}`);
console.log(`Bucket 3: ${questions.filter(q => q.bucket === 3).length}`);
console.log(`Bucket 4: ${questions.filter(q => q.bucket === 4).length}`);

// Write as JS module
const output = `// Auto-generated from system_design_bible.html — ${questions.length} questions
// Buckets: 1=Product Design, 2=Infrastructure, 3=AI/ML & GenAI, 4=AI Interview Gotcha

export const BUCKETS = [
  { id: 1, label: 'Product Design', count: ${questions.filter(q=>q.bucket===1).length} },
  { id: 2, label: 'Infrastructure', count: ${questions.filter(q=>q.bucket===2).length} },
  { id: 3, label: 'AI/ML & GenAI', count: ${questions.filter(q=>q.bucket===3).length} },
  { id: 4, label: 'AI Interview Gotcha', count: ${questions.filter(q=>q.bucket===4).length} },
];

export const questions = ${JSON.stringify(questions, null, 2)};

export const getQuestion = (slug) => questions.find((q) => q.slug === slug);
export const getQuestionsByBucket = (bucket) => questions.filter((q) => q.bucket === bucket);
`;

writeFileSync(join(__dirname, '../src/data/questions.js'), output);
console.log('Written to src/data/questions.js');
