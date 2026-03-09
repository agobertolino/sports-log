import { useEffect, useState } from 'react';
import { getUser, type User } from '@/db/users';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const u = getUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { user, loading, refresh };
}
