const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const participantId = '001';
const participantVocabPath = path.join(process.cwd(), `participant_${participantId}`, 'vocabulary.csv');
console.log('Looking for:', participantVocabPath);
console.log('Exists:', fs.existsSync(participantVocabPath));

if (fs.existsSync(participantVocabPath)) {
  const content = fs.readFileSync(participantVocabPath, 'utf-8');
  console.log('File content length:', content.length);
  const records = parse(content, { columns: true, skip_empty_lines: true });
  console.log('Records parsed:', records.length);
  const words = records.map(r => r.word).filter(w => w && w.toLowerCase() !== 'happy');
  console.log('Words found:', words.length);
  console.log('First 5 words:', words.slice(0, 5));
} else {
  console.log('File not found');
}