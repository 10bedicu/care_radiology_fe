import { useEffect, useState } from "react";
import { apis } from "@/apis";

export interface CurrentUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  user_type: string;
}

export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apis.user
      .getCurrent()
      .then((data) => setUser(data as CurrentUser))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
