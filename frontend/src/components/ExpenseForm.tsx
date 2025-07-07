import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useUser } from '../UserContext';
import api from '../api';
import type { User } from '../UserContext';

interface Friend {
  id: number;
  requester: User;
  addressee: User;
}

export default function ExpenseForm() {
  const user = useUser();
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [splits, setSplits] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (!user) return;
    api.get('/api/v1/friends/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setFriends(res.data.friends));
  }, [user]);

  const handleSplitChange = (friendId: number, value: string) => {
    setSplits((prev: { [key: number]: number }) => ({ ...prev, [friendId]: parseFloat(value) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const splitData = Object.entries(splits)
      .filter(([, amount]) => !isNaN(amount as number) && (amount as number) > 0)
      .map(([userId, amount]) => ({ userId: Number(userId), amount: amount as number }));

    if (splitData.length === 0) {
      setMsg('Please enter at least one split amount.');
      return;
    }

    try {
      await api.post('/api/v1/expenses/add', {
        amount: parseFloat(amount),
        groupId: groupId ? Number(groupId) : undefined,
        splits: splitData,
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
      <input placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
      <input placeholder="Date (YYYY-MM-DD)" value={date} onChange={e => setDate(e.target.value)} />
      <h4>Splits</h4>
      <ul>
        {friends.map((friend: Friend) => {
          const friendUser = friend.requester.id === user.id ? friend.addressee : friend.requester;
          return (
            <li key={friendUser.id}>
              {friendUser.username}
              <input
                type="number"
                placeholder="Amount"
                onChange={e => handleSplitChange(friendUser.id, e.target.value)}
              />
            </li>
          );
        })}
      </ul>
      <button type="submit">Add</button>
      <div>{msg}</div>
    </form>
  );
} 