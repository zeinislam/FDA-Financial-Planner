import React from 'react';
import { AllocationSection } from '../types';
import { formatCurrency } from '../utils/format';

type AllocationsTableProps = {
  sections: AllocationSection[];
  capital: number;
  onAddSection: (name: string, percentage: number, phoneNumber?: string) => void;
  onDeleteSection: (id: string) => void;
};

export default function AllocationsTable({ sections, capital, onAddSection, onDeleteSection }: AllocationsTableProps) {
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState<number>(0);
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const totalAllocated = sections.reduce((sum, s) => sum + (capital * s.percentage / 100), 0);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || amount <= 0 || totalAllocated + amount > capital) {
      return;
    }
    const newPercentage = (amount / capital) * 100;
    const phone = phoneNumber.trim() || undefined;
    onAddSection(name, newPercentage, phone);
    setName('');
    setAmount(0);
    setPhoneNumber('');
  };

  return (
    <section className="card">
      <h3>Allocation Sections</h3>
      <form onSubmit={handleAdd}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="Section (e.g. Rent)" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Amount (EGP)" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
          <input placeholder="Phone (SMS)" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
          <button type="submit">Add</button>
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Amount</th>
            <th>SMS Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(section => {
            const amount = (capital * section.percentage) / 100;
            return (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{formatCurrency(amount)}</td>
                <td>{section.phoneNumber || 'Not set'}</td>
                <td>
                  <button onClick={() => onDeleteSection(section.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
