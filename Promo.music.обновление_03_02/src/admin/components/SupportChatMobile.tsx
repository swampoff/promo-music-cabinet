/**
 * SUPPORT CHAT MOBILE - Полноэкранный чат для мобильных
 * Адаптив: 320px - 767px
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Paperclip, Eye, MessageSquare, Clock, 
  CheckCircle, Archive, UserCheck, FileText, MoreVertical,
  Hash, ChevronDown
} from 'lucide-react';
import { useRef, useEffect } from 'react';

interface Props {
  ticket: any;
  onClose: () => void;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  isInternalNote: boolean;
  setIsInternalNote: (val: boolean) => void;
  onSendMessage: () => void;
  onResolve: () => void;
  onClose: () => void;
  onAssign: () => void;
  templates: any[];
  showTemplates: boolean;
  setShowTemplates: (val: boolean) => void;
  onUseTemplate: (template: any) => void;
  fileInputRef: any;
  handleFileSelect: (e: any) => void;
  attachments: File[];
  removeAttachment: (index: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
  formatTime: (date: string) => string;
  getSLATimeRemaining: (date: string) => string;
}

export function SupportChatMobile(props: Props) {
  const {
    ticket,
    onClose,
    replyMessage,
    setReplyMessage,
    isInternalNote,
    setIsInternalNote,
    onSendMessage,
    onResolve,
    onAssign,
    templates,
    showTemplates,
    setShowTemplates,
    onUseTemplate,
    fileInputRef,
    handleFileSelect,
    attachments,
    removeAttachment,
    getStatusColor,
    getStatusText,
    getPriorityColor,
    getPriorityText,
    formatTime,
    getSLATimeRemaining
  } = props;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages]);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-white/10 bg-gray-900/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-start gap-2.5 mb-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          
          <img
            src={ticket.user.avatar}
            alt={ticket.user.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
              {ticket.subject}
            </h2>
            <p className="text-xs text-gray-400 truncate">{ticket.user.name}</p>
          </div>

          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all flex-shrink-0">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs mb-2">
          <span className={`px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
            {getStatusText(ticket.status)}
          </span>
          <span className={`px-2 py-0.5 rounded-md border ${getPriorityColor(ticket.priority)}`}>
            {getPriorityText(ticket.priority)}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getSLATimeRemaining(ticket.sla.dueAt)}
          </span>
        </div>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {ticket.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] flex items-center gap-0.5">
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 text-[10px]">
                +{ticket.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5">
          {!ticket.assignedTo && (
            <button
              onClick={onAssign}
              className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-[10px] flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Себе
            </button>
          )}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <button
              onClick={onResolve}
              className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-[10px] flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Решить
            </button>
          )}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all text-[10px] flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Шаблоны
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {ticket.messages.map((message: any, index: number) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`flex gap-2 ${message.sender_type === 'admin' ? 'flex-row-reverse' : ''}`}
          >
            <img
              src={message.sender.avatar || 'https://i.pravatar.cc/150?img=1'}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className={`flex-1 ${message.sender_type === 'admin' ? 'items-end' : ''}`}>
              <div className={`flex items-center gap-1.5 mb-0.5 ${message.sender_type === 'admin' ? 'justify-end' : ''}`}>
                <span className="text-white font-semibold text-xs">{message.sender.name}</span>
                <span className="text-gray-400 text-[10px]">{formatTime(message.timestamp)}</span>
                {message.is_internal && (
                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-xl max-w-[85%] ${
                message.sender_type === 'admin'
                  ? message.is_internal
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                  : 'bg-white/5 border border-white/10'
              }`}>
                <p className="text-gray-200 text-xs whitespace-pre-wrap break-words leading-relaxed">
                  {message.message}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((att: any) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-1.5 rounded bg-white/5 hover:bg-white/10 transition-all text-xs"
                      >
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 flex-1 truncate text-[10px]">{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Templates Dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-shrink-0 border-t border-white/10 p-3 bg-gray-900/95 max-h-64 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-xs">Быстрые ответы</h4>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => onUseTemplate(template)}
                  className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-white font-medium text-xs">{template.name}</span>
                    {template.shortcuts && (
                      <span className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-mono">
                        {template.shortcuts}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-[10px] line-clamp-1">{template.message}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="flex-shrink-0 p-3 border-t border-white/10 bg-gray-900/95 backdrop-blur-xl space-y-2">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
                  <Paperclip className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300 text-[10px] truncate max-w-[100px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-0.5 rounded hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Internal Note Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="internal-mobile"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
            />
            <label htmlFor="internal-mobile" className="text-xs text-gray-400 cursor-pointer">
              Внутренняя заметка
            </label>
          </div>

          {/* Message Input */}
          <div className="flex flex-col gap-2">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  onSendMessage();
                }
              }}
              placeholder={isInternalNote ? "Внутренняя заметка..." : "Введите ответ..."}
              className={`w-full px-3 py-2 rounded-lg border text-white placeholder-gray-400 focus:outline-none transition-all resize-none text-xs ${
                isInternalNote
                  ? 'bg-yellow-500/5 border-yellow-500/30 focus:border-yellow-500/50'
                  : 'bg-white/5 border-white/10 focus:border-pink-500/50'
              }`}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onSendMessage}
              disabled={!replyMessage.trim()}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs ${
                isInternalNote
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInternalNote ? 'Заметка' : 'Отправить'}</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
