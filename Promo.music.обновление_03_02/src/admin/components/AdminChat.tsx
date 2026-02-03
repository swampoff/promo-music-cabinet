/**
 * ADMIN CHAT WIDGET - Чат для администратора
 * Полная копия чата артиста с иконкой справа
 * Adaptive: 320px → 4K
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, X, Send, Smile, Paperclip, Search, Phone, Video,
  MoreVertical, ArrowLeft, Check, CheckCheck, Image as ImageIcon,
  Mic, Pause, Play, Volume2, Edit2, Trash2, Reply, Copy, Forward,
  Pin, Archive, Star, Heart, ThumbsUp, Laugh, AlertCircle, Menu
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  image?: string;
  file?: {
    name: string;
    size: string;
  };
  voice?: {
    duration: number;
  };
  replyTo?: {
    id: number;
    text: string;
    sender: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  edited?: boolean;
  pinned?: boolean;
}

interface Conversation {
  id: number;
  userId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  typing?: boolean;
  archived?: boolean;
  favorite?: boolean;
  pinned?: boolean;
  pinnedMessage?: string;
}

interface AdminChatProps {
  initialUserId?: string;
  initialUserName?: string;
  initialUserAvatar?: string;
}

const initialConversations: Conversation[] = [
  { id: 1, userId: '1', name: 'Александр Иванов', lastMessage: 'Спасибо за помощь!', time: '5 мин', unread: 1, avatar: 'https://i.pravatar.cc/150?img=12', online: true },
  { id: 2, userId: '2', name: 'Мария Петрова', lastMessage: 'Когда будет обработан заказ?', time: '1 ч', unread: 2, avatar: 'https://i.pravatar.cc/150?img=5', online: true, pinned: true },
  { id: 3, userId: '3', name: 'Дмитрий Соколов', lastMessage: 'Отлично, понял!', time: '3 ч', unread: 0, avatar: 'https://i.pravatar.cc/150?img=8', online: false },
  { id: 4, userId: '4', name: 'Елена Смирнова', lastMessage: 'Добрый день', time: '1 д', unread: 0, avatar: 'https://i.pravatar.cc/150?img=9', online: false },
];

const initialMessagesByChat: { [key: number]: Message[] } = {
  1: [
    { id: 1, text: 'Здравствуйте! У меня вопрос по заказу', sender: 'other', time: '14:30', status: 'read' },
    { id: 2, text: 'Здравствуйте! Конечно, слушаю вас', sender: 'me', time: '14:32', status: 'read' },
    { id: 3, text: 'Когда будет готов питчинг?', sender: 'other', time: '14:33', status: 'read' },
    { id: 4, text: 'Заказ обрабатывается, готово будет завтра', sender: 'me', time: '14:35', status: 'delivered' },
    { id: 5, text: 'Спасибо за помощь!', sender: 'other', time: '14:36', status: 'delivered' },
  ],
  2: [
    { id: 1, text: 'Привет! Когда будет обработан мой заказ?', sender: 'other', time: '12:20', status: 'read' },
    { id: 2, text: 'Здравствуйте! Сейчас проверю', sender: 'me', time: '12:25', status: 'read' },
  ],
  3: [
    { id: 1, text: 'Спасибо за быстрый ответ!', sender: 'other', time: '09:15', status: 'read' },
    { id: 2, text: 'Всегда рад помочь! 😊', sender: 'me', time: '09:20', status: 'read' },
  ],
  4: [
    { id: 1, text: 'Добрый день, есть вопрос', sender: 'other', time: 'Вчера' },
  ],
};

const emojis = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '✨', '💯', '👌', '🎵', '🎸', '🎤'];

export function AdminChat({ initialUserId, initialUserName, initialUserAvatar }: AdminChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messagesByChat, setMessagesByChat] = useState(initialMessagesByChat);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [unreadCount, setUnreadCount] = useState(3);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChat = conversations[selectedChatIndex];
  const currentMessages = messagesByChat[selectedChat.id] || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Initialize with user if provided
  useEffect(() => {
    if (initialUserId && initialUserName && isOpen) {
      const existingChatIndex = conversations.findIndex(c => c.userId === initialUserId);
      if (existingChatIndex !== -1) {
        setSelectedChatIndex(existingChatIndex);
        setShowMobileChat(true);
      } else {
        // Create new conversation
        const newConv: Conversation = {
          id: conversations.length + 1,
          userId: initialUserId,
          name: initialUserName,
          lastMessage: 'Начните разговор',
          time: 'Сейчас',
          unread: 0,
          avatar: initialUserAvatar || 'https://i.pravatar.cc/150?img=1',
          online: true,
        };
        setConversations([newConv, ...conversations]);
        setSelectedChatIndex(0);
        setMessagesByChat({ ...messagesByChat, [newConv.id]: [] });
        setShowMobileChat(true);
      }
    }
  }, [initialUserId, initialUserName, initialUserAvatar, isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: currentMessages.length + 1,
      text: inputValue,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender === 'me' ? 'Вы' : selectedChat.name } : undefined,
    };

    setMessagesByChat({
      ...messagesByChat,
      [selectedChat.id]: [...currentMessages, newMessage],
    });

    setConversations(conversations.map((conv, idx) =>
      idx === selectedChatIndex
        ? { ...conv, lastMessage: inputValue, time: 'Сейчас' }
        : conv
    ));

    setInputValue('');
    setReplyingTo(null);
    setShowEmojiPicker(false);

    // Simulate delivery status change
    setTimeout(() => {
      setMessagesByChat(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(inputValue + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Файл "${file.name}" прикреплен`);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessagesByChat({
      ...messagesByChat,
      [selectedChat.id]: currentMessages.filter(msg => msg.id !== messageId),
    });
    toast.success('Сообщение удалено');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 
          w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20
          rounded-full 
          bg-gradient-to-r from-blue-500 to-cyan-500
          backdrop-blur-xl
          border border-white/20
          shadow-2xl
          flex items-center justify-center
          z-50
          group"
      >
        <MessageSquare className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1
              w-6 h-6 xs:w-7 xs:h-7
              rounded-full
              bg-red-500
              border-2 border-gray-900
              flex items-center justify-center
              text-white text-xs xs:text-sm font-bold"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
      animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
      className="fixed bottom-6 right-6 
        w-[calc(100vw-2rem)] xs:w-[calc(100vw-3rem)] sm:w-[450px] md:w-[500px] lg:w-[600px]
        h-[calc(100vh-8rem)] xs:h-[calc(100vh-6rem)] sm:h-[600px] md:h-[650px] lg:h-[700px]
        backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
        rounded-2xl sm:rounded-3xl
        border border-white/10
        shadow-2xl
        flex flex-col
        overflow-hidden
        z-50"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between 
        p-3 xs:p-4 sm:p-5
        border-b border-white/10
        bg-white/5
        backdrop-blur-xl
        shrink-0">
        <div className="flex items-center gap-2 xs:gap-3">
          <MessageSquare className="w-5 h-5 xs:w-6 xs:h-6 text-cyan-400" />
          <div>
            <h2 className="text-sm xs:text-base sm:text-lg font-bold text-white">
              Чат администратора
            </h2>
            <p className="text-[10px] xs:text-xs text-gray-400">
              {conversations.filter(c => c.unread > 0).length} непрочитанных
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 xs:p-2
            hover:bg-white/10
            rounded-lg
            transition-colors"
        >
          <X className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* CONVERSATIONS LIST */}
        <div className={`
          ${showMobileChat ? 'hidden sm:flex' : 'flex'}
          flex-col
          w-full sm:w-[200px] md:w-[240px] lg:w-[280px]
          border-r border-white/10
          bg-white/5
          shrink-0
        `}>
          {/* Search */}
          <div className="p-2 xs:p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 w-3 h-3 xs:w-4 xs:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full 
                  pl-8 xs:pl-10 pr-2 xs:pr-3 py-1.5 xs:py-2
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  text-white placeholder-gray-400
                  text-[10px] xs:text-xs sm:text-sm
                  focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedChatIndex(conversations.findIndex(c => c.id === conv.id));
                  setShowMobileChat(true);
                  // Mark as read
                  if (conv.unread > 0) {
                    setUnreadCount(prev => Math.max(0, prev - conv.unread));
                    setConversations(conversations.map(c =>
                      c.id === conv.id ? { ...c, unread: 0 } : c
                    ));
                  }
                }}
                className={`w-full p-2 xs:p-3
                  flex items-center gap-2 xs:gap-3
                  border-b border-white/5
                  transition-all
                  ${selectedChatIndex === conversations.findIndex(c => c.id === conv.id)
                    ? 'bg-cyan-500/20 border-l-4 border-l-cyan-400'
                    : 'hover:bg-white/5'
                  }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full"
                  />
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-[10px] xs:text-xs sm:text-sm font-semibold text-white truncate">
                      {conv.name}
                    </h3>
                    {conv.unread > 0 && (
                      <span className="w-4 h-4 xs:w-5 xs:h-5 rounded-full bg-red-500 text-white text-[8px] xs:text-[10px] font-bold flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`
          ${showMobileChat ? 'flex' : 'hidden sm:flex'}
          flex-col
          flex-1
        `}>
          {/* Chat Header */}
          <div className="flex items-center justify-between 
            p-2 xs:p-3 sm:p-4
            border-b border-white/10
            bg-white/5
            shrink-0">
            <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="sm:hidden p-1.5 hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-white truncate">
                  {selectedChat.name}
                </h3>
                <p className="text-[10px] xs:text-xs text-gray-400">
                  {selectedChat.online ? 'Онлайн' : 'Не в сети'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 xs:gap-2">
              <button className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Phone className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
              <button className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Video className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
              <button className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] sm:max-w-[75%]
                  ${message.sender === 'me'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-white/10'
                  }
                  rounded-2xl
                  p-2 xs:p-3 sm:p-4
                  backdrop-blur-xl
                  group
                  relative
                `}>
                  {message.replyTo && (
                    <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/30">
                      <p className="text-[9px] xs:text-[10px] text-white/60 mb-0.5">
                        Ответ на {message.replyTo.sender}
                      </p>
                      <p className="text-[10px] xs:text-xs text-white/80 truncate">
                        {message.replyTo.text}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-white break-words">
                    {message.text}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1 xs:mt-2">
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-white/60">
                      {message.time}
                    </span>
                    {message.sender === 'me' && (
                      <div>
                        {message.status === 'sent' && <Check className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white/60" />}
                        {message.status === 'delivered' && <CheckCheck className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white/60" />}
                        {message.status === 'read' && <CheckCheck className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-cyan-300" />}
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className="absolute -top-2 right-2 hidden group-hover:flex items-center gap-1 bg-gray-900 rounded-lg p-1 shadow-lg">
                    <button
                      onClick={() => handleReply(message)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Ответить"
                    >
                      <Reply className="w-3 h-3 text-gray-400" />
                    </button>
                    {message.sender === 'me' && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 hover:bg-red-500/20 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          {replyingTo && (
            <div className="px-3 xs:px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] xs:text-xs text-cyan-400 mb-0.5">
                  Ответ на {replyingTo.sender === 'me' ? 'ваше сообщение' : selectedChat.name}
                </p>
                <p className="text-[10px] xs:text-xs sm:text-sm text-white/80 truncate">
                  {replyingTo.text}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-2 xs:p-3 sm:p-4 border-t border-white/10 bg-white/5 shrink-0">
            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 xs:mb-3 p-2 xs:p-3 bg-white/10 rounded-lg backdrop-blur-xl"
                >
                  <div className="grid grid-cols-6 xs:grid-cols-8 sm:grid-cols-12 gap-1 xs:gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-base xs:text-lg sm:text-xl hover:bg-white/10 rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1.5 xs:gap-2">
              <button
                onClick={handleFileAttach}
                className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <Paperclip className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <Smile className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Сообщение..."
                className="flex-1 
                  px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  text-white placeholder-gray-400
                  text-xs xs:text-sm sm:text-base
                  focus:outline-none focus:border-cyan-400/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-1.5 xs:p-2 sm:p-3
                  bg-gradient-to-r from-blue-500 to-cyan-500
                  hover:from-blue-600 hover:to-cyan-600
                  disabled:from-gray-600 disabled:to-gray-700
                  rounded-lg
                  transition-all
                  disabled:opacity-50
                  shrink-0"
              >
                <Send className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </motion.div>
  );
}
