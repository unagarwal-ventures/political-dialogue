import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api';
import type { Message } from '@political-dialogue/shared';

export function useMessages(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fetch history
    apiFetch<Message[]>(`/api/messages/${matchId}`).then(({ data, error: err }) => {
      if (!mounted) return;
      if (err) setError(err);
      else setMessages(data ?? []);
      setLoading(false);
    });

    // Subscribe to realtime inserts
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [matchId]);

  const sendMessage = async (content: string) => {
    const { error: err } = await apiFetch(`/api/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return err;
  };

  const deleteMessage = async (messageId: string) => {
    const { error: err } = await apiFetch(`/api/messages/${messageId}`, { method: 'DELETE' });
    return err;
  };

  return { messages, loading, error, sendMessage, deleteMessage };
}
