import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true, validate: v => v.length === 4 },
  correctIndex: { type: Number, required: true, min: 0, max: 3 }
}, { timestamps: true });

export default mongoose.model('Question', QuestionSchema);
