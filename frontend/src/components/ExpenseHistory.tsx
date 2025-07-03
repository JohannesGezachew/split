import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import api from '../api';;

interface Expense {
  id: number;
  amount: number;
  paidById: number;
  date: string;
  note?: string;
}

export default function ExpenseHistory({ groupId }: { groupId?: number }) {
  const user = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get('/api/v1/expenses/history' + (groupId ? `?groupId=${groupId}` : ''), { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setExpenses(res.data.expenses));
  }, [user, groupId]);

  if (!user) return null;

  return (
    <div>
      <h3>Expense History</h3>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {e.amount} paid by {e.paidById} on {new Date(e.date).toLocaleDateString()} - {e.note}
          </li>
        ))}
      </ul>
    </div>
  );
} 