/**
 * SUPPORT TICKET CARD - Адаптивная карточка тикета
 * Адаптив: 320px → 4K
 */

import { motion } from 'motion/react';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    email: string;
  };
  status: 'open' | 'waiting_response' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  updatedAt: string;
  messages: any[];
  tags: string[];
  sla: {
    isOverdue: boolean;
  };
}

interface Props {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
  formatTime: (date: string) => string;
}

export function SupportTicketCard({
  ticket,
  isSelected,
  onClick,
  index,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityText,
  formatTime
}: Props) {
  const hasUnread = ticket.messages.some((m: any) => !m.is_read && m.sender_type === 'user');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`backdrop-blur-xl bg-white/5 rounded-lg sm:rounded-xl border cursor-pointer transition-all p-2.5 sm:p-3 md:p-4 ${
        isSelected
          ? 'border-pink-500/50 shadow-lg shadow-pink-500/20 ring-1 ring-pink-500/20'
          : 'border-white/10 hover:border-pink-500/30 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 mb-2">
        <div className="relative flex-shrink-0">
          <img
            src={ticket.user.avatar}
            alt={ticket.user.name}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-white/10"
          />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 border-2 border-gray-900 animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-1 flex-1">
              {ticket.subject}
            </h3>
            <span className="text-[10px] sm:text-xs font-mono text-gray-500 flex-shrink-0">
              {ticket.id}
            </span>
          </div>
          
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-1.5 sm:mb-2 truncate">
            {ticket.user.name}
          </p>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </span>
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${getPriorityColor(ticket.priority)}`}>
              {getPriorityText(ticket.priority)}
            </span>
            {ticket.sla.isOverdue && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-0.5 sm:gap-1">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Просрочен</span>
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400 pt-2 border-t border-white/5">
        <span className="flex items-center gap-0.5 sm:gap-1">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="truncate">{formatTime(ticket.updatedAt)}</span>
        </span>
        <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
          <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {ticket.messages.length}
        </span>
      </div>
    </motion.div>
  );
}
