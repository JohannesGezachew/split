import { useEffect, useState } from 'react';
import { useUser, User } from '../UserContext';
import axios from 'axios';

interface Friend {
  id: number;
  requester: User;
  addressee: User;
  status: string;
}

interface PendingRequest {
  id: number;
  requester: User;
}

interface SearchResult {
  id: number;
  username: string;
}

export default function FriendList() {
  const user = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    axios.get('/api/v1/friends/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setFriends(res.data.friends));
    axios.get('/api/v1/friends/pending', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setPending(res.data.pending));
  }, [user]);

  const handleSearch = () => {
    axios.get('/api/v1/users/search?username=' + search, { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setResults(res.data.users));
  };

  const sendRequest = (id: number) => {
    axios.post('/api/v1/friends/request', { toUserId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const accept = (id: number) => {
    axios.post('/api/v1/friends/accept', { requestId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const reject = (id: number) => {
    axios.post('/api/v1/friends/reject', { requestId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  return (
    <div>
      <h3>Friends</h3>
      <ul>{friends.map((f: any) => <li key={f.id}>{f.requester.username} / {f.addressee.username}</li>)}</ul>
      <h4>Pending Requests</h4>
      <ul>{pending.map((p: any) => <li key={p.id}>{p.requester.username} <button onClick={() => accept(p.id)}>Accept</button> <button onClick={() => reject(p.id)}>Reject</button></li>)}</ul>
      <h4>Add/Search Friends</h4>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>{results.map((r: any) => <li key={r.id}>{r.username} <button onClick={() => sendRequest(r.id)}>Add</button></li>)}</ul>
    </div>
  );
} 