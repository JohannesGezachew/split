import { useEffect, useState } from 'react';
import { useUser, User } from '../UserContext';
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
    axios.get('/api/v1/groups/list', { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setGroups(res.data.groups));
  }, [user]);

  const showMembers = (groupId: number) => {
    setSelected(groupId);
    axios.get(`/api/v1/groups/${groupId}/members`, { headers: { 'x-telegram-id': user.telegramId } })
      .then(res => setMembers(res.data.members));
  };

  return (
    <div>
      <h3>Groups</h3>
      <ul>{groups.map((g: any) => <li key={g.group.id}><button onClick={() => showMembers(g.group.id)}>{g.group.name}</button></li>)}</ul>
      {selected && <div>
        <h4>Members</h4>
        <ul>{members.map((m: any) => <li key={m.id}>{m.user.username}</li>)}</ul>
      </div>}
    </div>
  );
} 