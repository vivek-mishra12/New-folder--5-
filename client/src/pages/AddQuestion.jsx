import { useState } from 'react';
import axios from 'axios';

export default function AddQuestion() {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [message, setMessage] = useState('');

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const submitQuestion = async () => {
    if (!text || options.some(opt => !opt)) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/questions/add', {
        text,
        options,
        correctIndex: Number(correctIndex)
      });
      if (res.data.ok) {
        setMessage('Question added successfully!');
        setText('');
        setOptions(['', '', '', '']);
        setCorrectIndex(0);
      } else {
        setMessage(res.data.error || 'Failed');
      }
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-10 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Add Your Question</h1>

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md space-y-4">
        <input
          type="text"
          placeholder="Question text"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
          />
        ))}

        <div className="flex items-center gap-2">
          <span className="font-semibold">Correct Option:</span>
          <select
            value={correctIndex}
            onChange={e => setCorrectIndex(e.target.value)}
            className="border border-gray-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {options.map((_, idx) => (
              <option key={idx} value={idx}>Option {idx + 1}</option>
            ))}
          </select>
        </div>

        <button
          onClick={submitQuestion}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Question
        </button>

        {message && <p className="text-center text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}
