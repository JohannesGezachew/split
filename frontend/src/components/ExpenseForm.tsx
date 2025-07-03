import { useState } from 'react';
import type { FormEvent } from 'react';
import { useUser } from '../UserContext';
import api from '../api';;

export default function ExpenseForm() {
  const user = useUser();
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  const [splits, setSplits] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.post('/api/v1/expenses/add', {
        amount: parseFloat(amount),
        groupId: groupId ? Number(groupId) : undefined,
        splits: JSON.parse(splits),
        note,
        date,
      }, { headers: { 'x-telegram-id': user.telegramId } });
      setMsg('Expense added!');
    } catch {
      setMsg('Failed to add expense.');
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <input placeholder="Group ID (optional)" value={groupId} onChange={e => setGroupId(e.target.value)} />
      <input placeholder="Splits (JSON)" value={splits} onChange={e => setSplits(e.target.value)} />
      <input placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
      <input placeholder="Date (YYYY-MM-DD)" value={date} onChange={e => setDate(e.target.value)} />
      <button type="submit">Add</button>
      <div>{msg}</div>
    </form>
  );
} 