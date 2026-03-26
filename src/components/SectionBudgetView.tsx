
import { useState } from 'react';
import { AllocationSection, ExpenseItem } from '../types';
import { remainingForSection, usedAmountForSection } from '../utils/finance';
import { formatCurrency } from '../utils/format';

type SectionBudgetViewProps = {
  sections: AllocationSection[];
  expenses: ExpenseItem[];
  onBack: () => void;
};

export default function SectionBudgetView({ sections, expenses, onBack }: SectionBudgetViewProps) {
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(new Set());
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleUnlockSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const enteredPassword = passwordInputs[sectionId] || '';

    if (!section?.phoneNumber) {
      setPasswordErrors(prev => ({ ...prev, [sectionId]: 'No phone number set for this section' }));
      return;
    }

    if (enteredPassword === section.phoneNumber) {
      setUnlockedSections(prev => new Set([...prev, sectionId]));
      setPasswordErrors(prev => ({ ...prev, [sectionId]: '' }));
      setPasswordInputs(prev => ({ ...prev, [sectionId]: '' }));
    } else {
      setPasswordErrors(prev => ({ ...prev, [sectionId]: 'Incorrect phone number' }));
    }
  };

  const handlePasswordChange = (sectionId: string, value: string) => {
    setPasswordInputs(prev => ({ ...prev, [sectionId]: value }));
    setPasswordErrors(prev => ({ ...prev, [sectionId]: '' }));
  };
  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <img src="/kermesse-saint-marc-logo.png" alt="Kermesse Saint Marc Logo" style={{ maxWidth: '200px', height: 'auto' }} />
      </div>
      <h1>FDA 2026 Financial Planner</h1>
      <p>Public view of all section budgets and remaining amounts.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {sections.map(section => {
          const isUnlocked = unlockedSections.has(section.id);
          const usedAmount = usedAmountForSection(section.id, expenses);
          const remainingAmount = remainingForSection(section, expenses);

          return (
            <div key={section.id} className="card" style={{ margin: 0 }}>
              <h3 style={{ marginTop: 0 }}>{section.name}</h3>

              {!isUnlocked ? (
                // Locked state
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Section is locked</p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="password"
                      placeholder="Enter phone number"
                      value={passwordInputs[section.id] || ''}
                      onChange={(e) => handlePasswordChange(section.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}
                    />
                    {passwordErrors[section.id] && (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        {passwordErrors[section.id]}
                      </div>
                    )}
                    <button
                      onClick={() => handleUnlockSection(section.id)}
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Unlock Section
                    </button>
                  </div>
                </div>
              ) : (
                // Unlocked state - show full details
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f3f4f6', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Budget</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                        {formatCurrency(section.amount)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f3f4f6', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Used</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                        {formatCurrency(usedAmount)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    background: remainingAmount >= 0 ? '#d1fae5' : '#fee2e2',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Remaining Budget</div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      color: remainingAmount >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {formatCurrency(remainingAmount)}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>Recent Expenses</h4>
                    {expenses.filter(e => e.sectionId === section.id).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.5rem 0' }}>No expenses yet</p>
                    ) : (
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {expenses
                          .filter(e => e.sectionId === section.id)
                          .slice(-3)
                          .reverse()
                          .map(expense => (
                            <div key={expense.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.25rem 0',
                              fontSize: '0.8rem',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              <span>{expense.date} - {expense.description}</span>
                              <span style={{ fontWeight: 'bold' }}>{formatCurrency(expense.amount)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={onBack} style={{ background: '#6b7280', padding: '0.75rem 1.5rem' }}>
          Back to Main
        </button>
      </div>
    </div>
  );
}
