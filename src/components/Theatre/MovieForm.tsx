import React, { useState } from 'react';

interface MovieFormProps {
  onSave: (movie: { title: string; duration: number; genre: string }) => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [genre, setGenre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, duration, genre });
    setTitle('');
    setDuration(0);
    setGenre('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add/Edit Movie</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="number"
        min={0}
        placeholder="Duration (min)"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
      <input
        type="text"
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />
      <button type="submit">Save Movie</button>
    </form>
  );
};

export default MovieForm;
