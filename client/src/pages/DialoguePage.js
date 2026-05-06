import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
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
function ReportModal({ matchId, reportedUserId, onClose, }) {
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
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4", children: done ? (_jsxs(_Fragment, { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Report submitted" }), _jsx("p", { className: "text-sm text-gray-500", children: "Thank you. We'll review this conversation." }), _jsx("button", { onClick: onClose, className: "btn-primary w-full", children: "Close" })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Report this conversation" }), _jsx("textarea", { className: "input h-24 resize-none", placeholder: "Describe what happened...", value: reason, onChange: (e) => setReason(e.target.value) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-secondary flex-1", children: "Cancel" }), _jsx("button", { onClick: submit, disabled: submitting || !reason.trim(), className: "btn-danger flex-1", children: submitting ? 'Sending...' : 'Submit report' })] })] })) }) }));
}
function MessageBubble({ message, isOwn, onDelete, }) {
    return (_jsx("div", { className: `flex ${isOwn ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-xs lg:max-w-md group relative`, children: [message.isDeleted ? (_jsx("p", { className: "text-xs text-gray-400 italic px-3 py-2", children: "Message deleted" })) : (_jsx("div", { className: `px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`, children: message.content })), _jsxs("div", { className: "flex items-center gap-2 mt-0.5 px-1", children: [_jsx("span", { className: "text-xs text-gray-400", children: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), isOwn && !message.isDeleted && (_jsx("button", { onClick: () => onDelete(message.id), className: "text-xs text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity", children: "delete" }))] })] }) }));
}
export function DialoguePage() {
    const { matchId } = useParams();
    const { user } = useAuth();
    const { messages, loading, sendMessage, deleteMessage } = useMessages(matchId);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [reportedUserId, setReportedUserId] = useState(null);
    const [showStarters, setShowStarters] = useState(false);
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSend = async () => {
        if (!draft.trim() || sending)
            return;
        setSending(true);
        await sendMessage(draft.trim());
        setDraft('');
        setSending(false);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleDelete = async (id) => {
        await deleteMessage(id);
    };
    // Find the other user's ID from messages
    const partnerId = messages.find((m) => m.senderId !== user?.id)?.senderId;
    if (loading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 flex flex-col h-[calc(100vh-56px)]", children: [_jsx("div", { className: "bg-amber-50 border-b border-amber-100 px-4 py-3 -mx-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx("p", { className: "text-xs font-semibold text-amber-800 mb-1", children: "Ground rules" }), _jsx("ul", { className: "text-xs text-amber-700 flex flex-wrap gap-x-4 gap-y-0.5", children: GROUND_RULES.map((r) => (_jsx("li", { className: "before:content-['\u2022'] before:mr-1", children: r }, r))) })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto py-6 space-y-3", children: [messages.length === 0 && (_jsxs("div", { className: "text-center space-y-4 pt-8", children: [_jsx("p", { className: "text-gray-400 text-sm", children: "No messages yet. Start the conversation." }), _jsxs("button", { onClick: () => setShowStarters((s) => !s), className: "btn-secondary text-xs", children: [showStarters ? 'Hide' : 'Show', " conversation starters"] }), showStarters && (_jsx("div", { className: "space-y-2 max-w-sm mx-auto", children: CONVERSATION_STARTERS.map((s) => (_jsxs("button", { onClick: () => setDraft(s), className: "w-full text-left text-xs bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-lg px-3 py-2 transition-colors", children: ["\"", s, "\""] }, s))) }))] })), messages.map((m) => (_jsx(MessageBubble, { message: m, isOwn: m.senderId === user?.id, onDelete: handleDelete }, m.id))), messages.length > 0 && (_jsxs("div", { className: "text-center pt-2", children: [_jsx("button", { onClick: () => setShowStarters((s) => !s), className: "text-xs text-gray-400 hover:text-gray-600", children: "Conversation starters" }), showStarters && (_jsx("div", { className: "space-y-2 mt-3 max-w-sm mx-auto", children: CONVERSATION_STARTERS.map((s) => (_jsxs("button", { onClick: () => { setDraft(s); setShowStarters(false); }, className: "w-full text-left text-xs bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-lg px-3 py-2 transition-colors", children: ["\"", s, "\""] }, s))) }))] })), _jsx("div", { ref: bottomRef })] }), _jsxs("div", { className: "border-t border-gray-100 py-4 space-y-2", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx("textarea", { className: "input flex-1 resize-none h-10 leading-normal py-2", placeholder: "Type a message...", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: handleKeyDown, rows: 1 }), _jsx("button", { onClick: handleSend, disabled: !draft.trim() || sending, className: "btn-primary px-5", children: "Send" })] }), _jsxs("div", { className: "flex justify-between items-center px-1", children: [_jsx(Link, { to: "/matches", className: "text-xs text-gray-400 hover:text-gray-600", children: "\u2190 Back to matches" }), partnerId && (_jsx("button", { onClick: () => setReportedUserId(partnerId), className: "text-xs text-red-400 hover:text-red-600", children: "Report conversation" }))] })] }), reportedUserId && matchId && (_jsx(ReportModal, { matchId: matchId, reportedUserId: reportedUserId, onClose: () => setReportedUserId(null) }))] }));
}
