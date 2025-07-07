import { useEffect, useState } from 'react'
import './App.css'
import api from './api';
import FriendList from './components/FriendList';
import GroupList from './components/GroupList';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';
import DebtSummary from './components/DebtSummary';
import { UserContext } from './UserContext';
import type { User } from './UserContext';

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // @ts-expect-error: Telegram WebApp is only available in Telegram Mini App
    const tg = window.Telegram?.WebApp
    const tgUser = tg?.initDataUnsafe?.user
    if (!tgUser) {
      setError('Not running inside Telegram or user info not available.')
      setLoading(false)
      return
    }
    api.post('/api/v1/users/upsert', {
      telegramId: tgUser.id,
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
    })
      .then(res => {
        setUser(res.data.user)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to authenticate with backend.')
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{color: 'red'}}>{error}</div>
  if (!user) return <div>No user info.</div>

  return (
    <UserContext.Provider value={user}>
      <div style={{padding: 24}}>
        <h2>Welcome, {user.firstName}!</h2>
        <p>Telegram ID: {user.telegramId.toString()}</p>
        <p>Username: @{user.username}</p>
        <p>Name: {user.firstName} {user.lastName}</p>
        <p>Signed up: {new Date(user.createdAt).toLocaleString()}</p>
        <FriendList />
        <GroupList />
        <ExpenseForm />
        <ExpenseHistory />
        <DebtSummary />
      </div>
    </UserContext.Provider>
  )
}

export default App
