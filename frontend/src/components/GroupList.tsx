import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import type { User } from '../UserContext';
import axios from 'axios';

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
  const [selected, setSelected] = useState<number|null>(null);

  useEffect(() => {
    if (!user) return;
    axios.get('/api/v1/groups/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setGroups(res.data.groups));
  }, [user]);

  const showMembers = (groupId: number) => {
    if (!user) return;
    setSelected(groupId);
    axios.get(`/api/v1/groups/${groupId}/members`, { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setMembers(res.data.members));
  };

  if (!user) return null;

  return (
    <div>
      <h3>Groups</h3>
      <ul>{groups.map((g) => <li key={g.group.id}><button onClick={() => showMembers(g.group.id)}>{g.group.name}</button></li>)}</ul>
      {selected && <div>
        <h4>Members</h4>
        <ul>{members.map((m) => <li key={m.id}>{m.user.username}</li>)}</ul>
      </div>}
    </div>
  );
} 