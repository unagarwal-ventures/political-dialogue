import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export function useAuth() {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);
    const signOut = () => supabase.auth.signOut();
    return { user, session, loading, signOut };
}
