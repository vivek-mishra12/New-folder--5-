import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Question from './models/Question.js';

dotenv.config();

const sample = [
  { text: 'Capital of France?', options: ['Paris','Rome','Berlin','Madrid'], correctIndex: 0 },
  { text: '2 + 2 = ?', options: ['3','4','5','22'], correctIndex: 1 },
  { text: 'JS engine in Chrome?', options: ['SpiderMonkey','V8','Java','Chakra'], correctIndex: 1 },
  { text: 'Color of the sky at noon?', options: ['Blue','Green','Red','Yellow'], correctIndex: 0 }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Question.deleteMany({});
    await Question.insertMany(sample);
    console.log('✅ Seeded questions:', sample.length);
  } catch (e) {
    console.error('❌ Seed error:', e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
