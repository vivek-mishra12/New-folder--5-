export default function QuestionCard({ text, options, onChoose, disabled }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{text}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onChoose(idx)}
            disabled={disabled}
            className="w-full bg-indigo-100 text-indigo-800 py-2 rounded hover:bg-indigo-200 transition disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
