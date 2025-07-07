import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import api from '../api';

interface Debt {
  id: number;
  amount: number;
  settled: boolean;
  fromUserId: number;
  toUserId: number;
}

export default function DebtSummary() {
  const user = useUser();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [netDebts, setNetDebts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!user) return;
    api.get('/api/v1/debts/summary', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => {
        setDebts(res.data.debts);
        setNetDebts(res.data.netDebts);
      });
  }, [user]);

  const settleUp = (otherUserId: number) => {
    if (!user) return;
    const debtsToSettle = debts.filter((d: Debt) => d.fromUserId === user.id && d.toUserId === otherUserId && !d.settled);
    Promise.all(debtsToSettle.map((d: Debt) => api.post('/api/v1/debts/settle', { debtId: d.id }, { headers: { 'x-telegram-id': user.telegramId } })))
      .then(() => {
        // Refresh debts
        api.get('/api/v1/debts/summary', { headers: { 'x-telegram-id': user.telegramId } })
          .then(res => {
            setDebts(res.data.debts);
            setNetDebts(res.data.netDebts);
          });
      });
  };

  if (!user) return null;

  return (
    <div>
      <h3>Debt Summary</h3>
      <ul>
        {Object.entries(netDebts).map(([otherUserId, amount]) => (
          <li key={otherUserId}>
            User {otherUserId}: {(amount as number).toFixed(2)}
            {(amount as number) > 0 && <button onClick={() => settleUp(Number(otherUserId))}>Settle Up</button>}
          </li>
        ))}
      </ul>
    </div>
  );
} 