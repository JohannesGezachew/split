import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import type { User } from '../UserContext';
import api from '../api';

interface Group {
  group: {
    id: number;
    name: string;
  };
}

interface GroupMember {
  id: number;
  user: User;
}

export default function GroupList() {
  const user = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/api/v1/groups/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setGroups(res.data.groups));
  }, [user]);

  const showMembers = (groupId: number) => {
    if (!user) return;
    setSelected(groupId);
    api.get(`/api/v1/groups/${groupId}/members`, { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setMembers(res.data.members));
  };

  const createGroup = () => {
    if (!user || !newGroupName) return;
    api.post('/api/v1/groups/create', { name: newGroupName }, { headers: { 'x-telegram-id': user.telegramId } })
      .then(() => {
        setNewGroupName('');
        // Refresh group list
        api.get('/api/v1/groups/list', { headers: { 'x-telegram-id': user.telegramId } })
          .then(res => setGroups(res.data.groups));
      });
  };

  const joinGroup = (groupId: number) => {
    if (!user) return;
    api.post('/api/v1/groups/join', { groupId }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  const leaveGroup = (groupId: number) => {
    if (!user) return;
    api.post('/api/v1/groups/leave', { groupId }, { headers: { 'x-telegram-id': user.telegramId } });
  };

  if (!user) return null;

  return (
    <div>
      <h3>Groups</h3>
      <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="New group name" />
      <button onClick={createGroup}>Create Group</button>
      <ul>
        {groups.map((g: Group) => (
          <li key={g.group.id}>
            <button onClick={() => showMembers(g.group.id)}>{g.group.name}</button>
            <button onClick={() => joinGroup(g.group.id)}>Join</button>
            <button onClick={() => leaveGroup(g.group.id)}>Leave</button>
          </li>
        ))}
      </ul>
      {selected && <div>
        <h4>Members</h4>
        <ul>{members.map((m: GroupMember) => <li key={m.id}>{m.user.username}</li>)}</ul>
      </div>}
    </div>
  );
} 