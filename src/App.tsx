import { useEffect, useMemo, useRef, useState } from 'react';
import CapitalForm from './components/CapitalForm';
import AllocationsTable from './components/AllocationsTable';
import ExpenseForm from './components/ExpenseForm';
import SummaryCards from './components/SummaryCards';
import SectionBudgetView from './components/SectionBudgetView';
import { FinancialState } from './types';
import { loadState, saveState } from './utils/db';
import { computeAmountFromPercent, remainingForSection } from './utils/finance';
import { formatCurrency } from './utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function createId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function App() {
  const [capital, setCapital] = useState<number>(0);
  const [sections, setSections] = useState<FinancialState['sections']>([]);
  const [expenses, setExpenses] = useState<FinancialState['expenses']>([]);
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [showSectionView, setShowSectionView] = useState(false);
  const [storedPassword, setStoredPassword] = useState(() => {
    const saved = localStorage.getItem('appPassword');
    return saved || 'zeinislam';
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const isInitialLoad = useRef(true);

  useEffect(() => {
    async function init() {
      const saved = await loadState();
      setCapital(saved.capital);
      setSections(saved.sections);
      setExpenses(saved.expenses);
      isInitialLoad.current = false;
    }

    init().catch(console.error);
  }, []);

  // Autosave whenever data changes
  useEffect(() => {
    if (isInitialLoad.current) return;

    saveState({ capital, sections, expenses }).catch(console.error);
  }, [capital, sections, expenses]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const enrichedSections = useMemo(
    () => sections.map(section => ({ ...section, amount: computeAmountFromPercent(capital, section.percentage) })),
    [capital, sections]
  );

  const handleAddSection = (name: string, percentage: number, phoneNumber?: string) => {
    const newSection = {
      id: createId(),
      name,
      percentage,
      amount: computeAmountFromPercent(capital, percentage),
      phoneNumber
    };
    setSections(prev => [...prev, newSection]);
  };

  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
    setExpenses(prev => prev.filter(expense => expense.sectionId !== id));
  };

  const handleAddExpense = (sectionId: string, description: string, amount: number, date: string, image?: string) => {
    const newExpense = {
      id: createId(),
      sectionId,
      description,
      amount,
      date,
      image
    };
    setExpenses(prev => [...prev, newExpense]);

    // Send SMS message if section has a phone number
    const section = enrichedSections.find(s => s.id === sectionId);
    if (section?.phoneNumber) {
      const remainingBudget = remainingForSection(section, [...expenses, newExpense]);
      const message = `FDA 2026 Financial Planner Update:\n\nSection: ${section.name}\nExpense Added: ${description}\nAmount: EGP ${amount.toFixed(2)}\nRemaining Budget: EGP ${remainingBudget.toFixed(2)}\n\nThank you for your expense submission!`;

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = section.phoneNumber.replace(/\D/g, '');

      // Open SMS app with the message
      const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    }
  };

  const totalAllocated = enrichedSections.reduce((sum, s) => sum + s.amount, 0);

  const handleUnlock = () => {
    if (password === storedPassword) {
      setUnlocked(true);
    }
    setPassword('');
  };

  const handleReset = () => {
    if (resetPassword === storedPassword) {
      setCapital(0);
      setSections([]);
      setExpenses([]);
      setShowResetModal(false);
      setResetPassword('');
      setUnlocked(false);
      alert('All data has been reset successfully!');
    } else {
      alert('Incorrect password!');
      setResetPassword('');
    }
  };

  const handleChangePassword = () => {
    if (currentPasswordInput !== storedPassword) {
      alert('Current password is incorrect!');
      setCurrentPasswordInput('');
      return;
    }
    
    if (newPasswordInput !== newPasswordConfirm) {
      alert('New passwords do not match!');
      setNewPasswordInput('');
      setNewPasswordConfirm('');
      return;
    }

    if (newPasswordInput.length < 1) {
      alert('Password cannot be empty!');
      return;
    }

    setStoredPassword(newPasswordInput);
    localStorage.setItem('appPassword', newPasswordInput);
    setShowChangePasswordModal(false);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setNewPasswordConfirm('');
    alert('Password changed successfully!');
  };

  const handleBackToMain = () => {
    setShowSectionView(false);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => !prev);
  };

  const exportToPDF = async () => {
    const summaryElement = document.querySelector('.summary-section');
    const expensesElement = document.querySelector('.expenses-section');
    if (!summaryElement || !expensesElement) return;
    const canvas1 = await html2canvas(summaryElement as HTMLElement);
    const imgData1 = canvas1.toDataURL('image/png');
    const canvas2 = await html2canvas(expensesElement as HTMLElement);
    const imgData2 = canvas2.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData1, 'PNG', 10, 10, 180, 60);
    pdf.addPage();
    pdf.addImage(imgData2, 'PNG', 10, 10, 180, 100);
    pdf.save('financial-summary.pdf');
  };

  return (
    <div className="app-container">
      {showSectionView ? (
        <SectionBudgetView
          sections={enrichedSections}
          expenses={expenses}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h1>FDA 2026 Financial Planner</h1>
            <button 
              onClick={toggleDarkMode}
              style={{ 
                background: darkMode ? '#334155' : '#f1f5f9', 
                color: darkMode ? '#e2e8f0' : '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.3s ease'
              }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <p>Enter your capital, split into sections, and track expenses per section.</p>
          
          {/* Expense Form - Always Available */}
          <div className="full-width"><ExpenseForm sections={enrichedSections} onAdd={handleAddExpense} /></div>
          
          {!unlocked ? (
            <div className="card">
              <h3>Enter Password to Access Summary and Expenses</h3>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button onClick={handleUnlock}>Unlock</button>
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => setShowSectionView(true)} style={{ background: '#059669' }}>
                  View Public Budget Overview
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row">
                <CapitalForm capital={capital} onSave={setCapital} />
                <section className="card">
                  <h3>Allocation status</h3>
                  <p>Allocated: {formatCurrency(totalAllocated)} (of {formatCurrency(capital)})</p>
                  {totalAllocated > capital && <p style={{ color: 'crimson' }}>Warning: allocation exceeds capital!</p>}
                  {totalAllocated < capital && <p style={{ color: '#9a9a9a' }}>Suggestion: distribute remaining amount.</p>}
                </section>
              </div>
              <div className="full-width"><AllocationsTable sections={enrichedSections} capital={capital} onAddSection={handleAddSection} onDeleteSection={handleDeleteSection} /></div>
              <div className="full-width summary-section"><SummaryCards capital={capital} sections={enrichedSections} expenses={expenses} /></div>
              <section className="card expenses-section" style={{ marginTop: '1rem' }}>
                <h3>Expense list</h3>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={exportToPDF}>Export to PDF</button>
                  <button onClick={() => setShowChangePasswordModal(true)} style={{ background: '#8b5cf6' }}>
                    Change Password
                  </button>
                  <button onClick={() => setShowResetModal(true)} style={{ background: '#dc2626' }}>
                    Reset All Data
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Section</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr><td colSpan={4}>No expenses recorded.</td></tr>
                    ) : (
                      expenses.map(e => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <td>{enrichedSections.find(s => s.id === e.sectionId)?.name ?? 'Unknown'}</td>
                          <td>{e.description}</td>
                          <td>{formatCurrency(e.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#e2e8f0' : 'black',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '300px'
          }}>
            <h3>Reset All Data</h3>
            <p>Enter your password to reset all data. This action cannot be undone.</p>
            <input
              type="password"
              placeholder="Enter password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                background: darkMode ? '#334155' : '#f3f4f6',
                color: darkMode ? '#e2e8f0' : 'black',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleReset} style={{ background: '#dc2626', flex: 1 }}>
                Reset
              </button>
              <button onClick={() => {
                setShowResetModal(false);
                setResetPassword('');
              }} style={{ background: '#6b7280', flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#e2e8f0' : 'black',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '300px'
          }}>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current password"
              value={currentPasswordInput}
              onChange={e => setCurrentPasswordInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                boxSizing: 'border-box',
                background: darkMode ? '#334155' : '#f3f4f6',
                color: darkMode ? '#e2e8f0' : 'black',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPasswordInput}
              onChange={e => setNewPasswordInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                boxSizing: 'border-box',
                background: darkMode ? '#334155' : '#f3f4f6',
                color: darkMode ? '#e2e8f0' : 'black',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={newPasswordConfirm}
              onChange={e => setNewPasswordConfirm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                background: darkMode ? '#334155' : '#f3f4f6',
                color: darkMode ? '#e2e8f0' : 'black',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleChangePassword} style={{ background: '#8b5cf6', flex: 1 }}>
                Change Password
              </button>
              <button onClick={() => {
                setShowChangePasswordModal(false);
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setNewPasswordConfirm('');
              }} style={{ background: '#6b7280', flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
