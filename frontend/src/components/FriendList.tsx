import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import type { User } from '../UserContext';
import api from '../api';

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

interface Group {
  group: {
    id: number;
    name: string;
  };
}

export default function FriendList() {
  const user = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get('/api/v1/friends/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setFriends(res.data.friends));
    api.get('/api/v1/friends/pending', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setPending(res.data.pending));
    api.get('/api/v1/groups/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setGroups(res.data.groups));
  }, [user]);

  const handleSearch = () => {
    if (!user) return;
    api.get('/api/v1/users/search?username=' + search, { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setResults(res.data.users));
  };

  const sendRequest = (id: number) => {
    if (!user) return;
    api.post('/api/v1/friends/request', { toUserId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const accept = (id: number) => {
    if (!user) return;
    api.post('/api/v1/friends/accept', { requestId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const reject = (id: number) => {
    if (!user) return;
    api.post('/api/v1/friends/reject', { requestId: id }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const addToGroup = (groupId: number) => {
    if (!user || !selectedFriend) return;
    api.post('/api/v1/groups/join', { groupId, userId: selectedFriend }, { headers: { 'x-telegram-id': user.telegramId } });
    setSelectedFriend(null);
  };

  if (!user) return null;

  return (
    <div>
      <h3>Friends</h3>
      <ul>
        {friends.map((f: Friend) => (
          <li key={f.id}>
            {f.requester.id === user.id ? f.addressee.username : f.requester.username}
            <button onClick={() => setSelectedFriend(f.requester.id === user.id ? f.addressee.id : f.requester.id)}>Add to Group</button>
          </li>
        ))}
      </ul>
      {selectedFriend && (
        <div>
          <h4>Add to Group</h4>
          <ul>
            {groups.map((g: Group) => (
              <li key={g.group.id}>
                {g.group.name}
                <button onClick={() => addToGroup(g.group.id)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h4>Pending Requests</h4>
      <ul>{pending.map((p: PendingRequest) => <li key={p.id}>{p.requester.username} <button onClick={() => accept(p.id)}>Accept</button> <button onClick={() => reject(p.id)}>Reject</button></li>)}</ul>
      <h4>Add/Search Friends</h4>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>{results.map((r: SearchResult) => <li key={r.id}>{r.username} <button onClick={() => sendRequest(r.id)}>Add</button></li>)}</ul>
    </div>
  );
} 