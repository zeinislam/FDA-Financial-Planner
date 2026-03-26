import React from 'react';
import { formatCurrency } from '../utils/format';

type CapitalFormProps = {
  capital: number;
  onSave: (capital: number) => void;
};

export default function CapitalForm({ capital, onSave }: CapitalFormProps) {
  const [value, setValue] = React.useState(capital.toString());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const numValue = Number(value);
    if (numValue > 0) {
      onSave(numValue);
    }
  };

  return (
    <section className="card">
      <h3>Total Capital</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter total capital"
            value={value}
            onChange={e => setValue(e.target.value)}
            required
          />
          <button type="submit">Set Capital</button>
        </div>
      </form>
      {capital > 0 && (
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Current Capital: {formatCurrency(capital)}
        </p>
      )}
    </section>
  );
}
