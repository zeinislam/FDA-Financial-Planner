import { totalExpenses, usedAmountForSection, remainingForSection, remainingCapital } from '../utils/finance';
import { formatCurrency } from '../utils/format';
import { AllocationSection, ExpenseItem } from '../types';

type SummaryCardsProps = {
  capital: number;
  sections: AllocationSection[];
  expenses: ExpenseItem[];
};

export default function SummaryCards({ capital, sections, expenses }: SummaryCardsProps) {
  const used = totalExpenses(expenses);
  const remaining = remainingCapital(capital, expenses);

  return (
    <section className="card summary-section">
      <h3>Financial Summary</h3>
      
      {/* Overall Summary Table */}
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d1d5db', background: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>Budget</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>Used</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>Total Capital</td>
              <td style={{ padding: '1rem', textAlign: 'right', color: '#2563eb' }}>{formatCurrency(capital)}</td>
              <td style={{ padding: '1rem', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(used)}</td>
              <td style={{ padding: '1rem', textAlign: 'right', color: remaining >= 0 ? '#059669' : '#dc2626' }}>
                {formatCurrency(remaining)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section Breakdown Table */}
      <h4>Section Breakdown</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d1d5db', background: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Section Name</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>Budget</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>Used</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => {
              const usedSection = usedAmountForSection(section.id, expenses);
              const remainingSection = remainingForSection(section, expenses);
              return (
                <tr key={section.id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{section.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#2563eb' }}>{formatCurrency(section.amount)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(usedSection)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: remainingSection >= 0 ? '#059669' : '#dc2626' }}>
                    {formatCurrency(remainingSection)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
