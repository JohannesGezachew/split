import { useEffect, useState } from 'react';
import { useUser, User } from '../UserContext';
import axios from 'axios';

interface DebtDetail {
  id: number;
  amount: number;
  settled: boolean;
}

interface LedgerInfo {
  total: number;
  details: DebtDetail[];
}

export default function DebtSummary() {
  const user = useUser();
  const [ledger, setLedger] = useState<Record<string, LedgerInfo>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('/api/v1/debts/ledger', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setLedger(res.data.ledger));
  }, [user]);

  const settle = (debtId: number) => {
    axios.post('/api/v1/debts/settle', { debtId }, { headers: { 'x-telegram-id': user.telegramId } })
      .then(() => setMsg('Settled!'));
  };

  return (
    <div>
      <h3>Debt Summary</h3>
      {Object.entries(ledger).map(([userId, info]) => (
        <div key={userId}>
          <b>User {userId}:</b> {info.total}
          <ul>
            {info.details.map((d) => <li key={d.id}>{d.amount} {d.settled ? '(settled)' : <button onClick={() => settle(d.id)}>Settle</button>}</li>)}
          </ul>
        </div>
      ))}
      <div>{msg}</div>
    </div>
  );
} 