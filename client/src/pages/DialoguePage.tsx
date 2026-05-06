import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import type { Message } from '@political-dialogue/shared';

const GROUND_RULES = [
  'No personal attacks — critique ideas, not people',
  'Assume good faith',
  'Listen to understand, not to win',
];

const CONVERSATION_STARTERS = [
  'What life experience most shaped this view for you?',
  'Is there any part of the other side\'s argument you find compelling?',
  'What would change your mind on this?',
  'What do you think we actually agree on?',
  'Which issue matters most to you personally, and why?',
];

function ReportModal({
  matchId,
  reportedUserId,
  onClose,
}: {
  matchId: string;
  reportedUserId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await apiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ matchId, reportedUserId, reason }),
    });
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
        {done ? (
          <>
            <h3 className="font-semibold text-gray-900">Report submitted</h3>
            <p className="text-sm text-gray-500">Thank you. We'll review this conversation.</p>
            <button onClick={onClose} className="btn-primary w-full">Close</button>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900">Report this conversation</h3>
            <textarea
              className="input h-24 resize-none"
              placeholder="Describe what happened..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={submit}
                disabled={submitting || !reason.trim()}
                className="btn-danger flex-1"
              >
                {submitting ? 'Sending...' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  onDelete,
}: {
  message: Message;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md group relative`}>
        {message.isDeleted ? (
          <p className="text-xs text-gray-400 italic px-3 py-2">Message deleted</p>
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isOwn
                ? 'bg-violet-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}
          >
            {message.content}
          </div>
        )}
        <div className="flex items-center gap-2 mt-0.5 px-1">
          <span className="text-xs text-gray-400">
            {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && !message.isDeleted && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-xs text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DialoguePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useMessages(matchId!);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [reportedUserId, setReportedUserId] = useState<string | null>(null);
  const [showStarters, setShowStarters] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    await sendMessage(draft.trim());
    setDraft('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
  };

  // Find the other user's ID from messages
  const partnerId = messages.find((m) => m.senderId !== user?.id)?.senderId;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 flex flex-col h-[calc(100vh-56px)]">
      {/* Ground rules banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 -mx-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-amber-800 mb-1">Ground rules</p>
          <ul className="text-xs text-amber-700 flex flex-wrap gap-x-4 gap-y-0.5">
            {GROUND_RULES.map((r) => (
              <li key={r} className="before:content-['•'] before:mr-1">{r}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center space-y-4 pt-8">
            <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
            <button
              onClick={() => setShowStarters((s) => !s)}
              className="btn-secondary text-xs"
            >
              {showStarters ? 'Hide' : 'Show'} conversation starters
            </button>
            {showStarters && (
              <div className="space-y-2 max-w-sm mx-auto">
                {CONVERSATION_STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDraft(s)}
                    className="w-full text-left text-xs bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwn={m.senderId === user?.id}
            onDelete={handleDelete}
          />
        ))}

        {messages.length > 0 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowStarters((s) => !s)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Conversation starters
            </button>
            {showStarters && (
              <div className="space-y-2 mt-3 max-w-sm mx-auto">
                {CONVERSATION_STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setDraft(s); setShowStarters(false); }}
                    className="w-full text-left text-xs bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 py-4 space-y-2">
        <div className="flex gap-3">
          <textarea
            className="input flex-1 resize-none h-10 leading-normal py-2"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="btn-primary px-5"
          >
            Send
          </button>
        </div>
        <div className="flex justify-between items-center px-1">
          <Link to="/matches" className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to matches
          </Link>
          {partnerId && (
            <button
              onClick={() => setReportedUserId(partnerId)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Report conversation
            </button>
          )}
        </div>
      </div>

      {/* Report modal */}
      {reportedUserId && matchId && (
        <ReportModal
          matchId={matchId}
          reportedUserId={reportedUserId}
          onClose={() => setReportedUserId(null)}
        />
      )}
    </div>
  );
}
