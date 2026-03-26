import React, { useState } from 'react';
import { AllocationSection } from '../types';

type ExpenseFormProps = {
  sections: AllocationSection[];
  onAdd: (sectionId: string, description: string, amount: number, date: string, image?: string) => void;
};

export default function ExpenseForm({ sections, onAdd }: ExpenseFormProps) {
  const [sectionId, setSectionId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!sectionId || !description.trim() || amount <= 0) return;
    const imageData = imagePreview || undefined;
    onAdd(sectionId, description, amount, date, imageData);
    setDescription('');
    setAmount(0);
    setSectionId('');
    setImagePreview(null);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <select value={sectionId} onChange={e => setSectionId(e.target.value)} required>
          <option value="">Select section</option>
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '0.5rem' }} />
        )}
      </div>
      <button type="submit" style={{ marginTop: '0.6rem' }}>Add Expense</button>
    </form>
  );
}
