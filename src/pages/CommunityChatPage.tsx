import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Users,
  Phone,
  Video,
  LogOut,
  X,
  Radio,
  Flag,
  Volume2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ChatMessage } from '@/types';

export default function CommunityChatPage() {
  const {
    chatMessages,
    onlineUsers,
    sendMessage,
    joinChat,
    leaveChat,
    chatUsername,
    setChatUsername,
    setCurrentPage,
  } = useApp();

  const [input, setInput] = useState('');
  const [showJoin, setShowJoin] = useState(!chatUsername);
  const [nameInput, setNameInput] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (inCall) {
      const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [inCall]);

  const handleJoin = () => {
    if (!nameInput.trim()) return;
    joinChat(nameInput.trim());
    setShowJoin(false);
  };

  const handleLeave = () => {
    leaveChat(chatUsername);
    setChatUsername('');
    setShowJoin(true);
  };

  const handleSend = () => {
    if (!input.trim() || !chatUsername) return;
    sendMessage(input.trim(), chatUsername);
    setInput('');
  };

  const handleReport = (username: string) => {
    setReportTarget(null);
    // In a real app, this would submit a moderation report
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (showJoin) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-rose-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Join Community Chat</h1>
            <p className="text-sm text-gray-500 mt-1">
              Connect with other users in real time. Your exact location is never shared.
            </p>
          </div>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter a display name"
            className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm outline-none focus:border-rose-300"
            autoFocus
          />
          <button
            onClick={handleJoin}
            disabled={!nameInput.trim()}
            className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600 disabled:opacity-50"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Community Chat</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {onlineUsers.length} online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCallModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100"
            >
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" /> Leave
            </button>
          </div>
        </div>
      </div>

      {/* Online users bar */}
      <div className="bg-rose-50/30 border-b border-rose-50 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 shrink-0">Online:</span>
          {onlineUsers.length === 0 ? (
            <span className="text-xs text-gray-300">No one else online</span>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1.5 shrink-0 group"
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <span className="text-xs text-gray-600">{user.username}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-rose-50/20">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg: ChatMessage) => {
            const isOwn = msg.username === chatUsername;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                        {msg.username[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-500">{msg.username}</span>
                      <button
                        onClick={() => setReportTarget(msg.username)}
                        className="text-gray-300 hover:text-red-400"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isOwn
                        ? 'bg-rose-500 text-white rounded-br-md'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className={`text-xs text-gray-300 mt-1 ${isOwn ? 'text-right' : ''}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-rose-100 p-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-rose-200"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Group call modal */}
      {showCallModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
          onClick={() => {
            setShowCallModal(false);
            setInCall(false);
            setCallDuration(0);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-400" /> Group Call
              </h3>
              <button
                onClick={() => {
                  setShowCallModal(false);
                  setInCall(false);
                  setCallDuration(0);
                }}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!inCall ? (
              <>
                <p className="text-sm text-gray-500">
                  Join a group call with other community members who are currently online.
                </p>
                <div className="space-y-2">
                  {onlineUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-500">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <span className="text-sm text-gray-700">{user.username}</span>
                      <Radio className="w-3 h-3 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setInCall(true)}
                  className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Join Call
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto relative">
                  <Radio className="w-10 h-10 text-green-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">In Group Call</p>
                  <p className="text-2xl font-mono text-green-500 mt-1">
                    {formatDuration(callDuration)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {onlineUsers.length} participants online
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      setInCall(false);
                      setCallDuration(0);
                      setShowCallModal(false);
                    }}
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"
                  >
                    <Phone className="w-5 h-5 text-white rotate-[135deg]" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Demo mode — WebRTC integration can be connected here for real voice/video calls.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportTarget && (
        <div
          className="fixed inset-0 bg-black/40 z-[3000] flex items-center justify-center p-4"
          onClick={() => setReportTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-800">Report {reportTarget}?</h3>
            <p className="text-sm text-gray-500">
              Report this user for inappropriate behavior. A moderator will review the report.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setReportTarget(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportTarget)}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
