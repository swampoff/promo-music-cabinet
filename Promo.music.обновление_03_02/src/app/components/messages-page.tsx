import { Search, Send, Paperclip, Smile, Image as ImageIcon, X, Check, CheckCheck, MoreVertical, Phone, Video, ArrowLeft, Loader2, Edit2, Trash2, Reply, Forward, Copy, Pin, Archive, Star, Mic, Pause, Play, Volume2, Heart, ThumbsUp, Laugh, AlertCircle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

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
  userId?: string;  // ID пользователя для сопоставления с донатами
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

const initialConversations: Conversation[] = [
  { id: 1, userId: 'user_4', name: 'Дмитрий Козлов', lastMessage: 'За новый альбом! Спасибо за эмоции', time: '10 мин', unread: 2, avatar: '3', online: true, favorite: true },
  { id: 2, userId: 'user_3', name: 'Мария Сидорова', lastMessage: 'Ждём новых треков! Вы лучшие! ❤️', time: '1 ч', unread: 0, avatar: '2', online: true, pinned: true, pinnedMessage: 'Встречаемся 15 марта в 19:00' },
  { id: 3, userId: 'user_1', name: 'Иван Петров', lastMessage: 'Отличная музыка! Продолжайте творить! 🎵', time: '3 ч', unread: 1, avatar: '1', online: false },
  { id: 4, userId: 'user_5', name: 'Анна Лебедева', lastMessage: 'Продолжайте в том же духе! 🔥', time: '1 д', unread: 0, avatar: '4', online: false },
  { id: 5, userId: 'user_fan_1', name: 'Сергей Михайлов', lastMessage: 'Привет! Как дела?', time: '2 д', unread: 0, avatar: '5', online: true },
  { id: 6, userId: 'user_fan_2', name: 'Ольга Волкова', lastMessage: 'Спасибо за ответ', time: '3 д', unread: 0, avatar: '6', online: false, archived: true },
];

const initialMessagesByChat: { [key: number]: Message[] } = {
  1: [
    { id: 1, text: 'Привет! Очень нравится твоя музыка', sender: 'other', time: '14:30', status: 'read' },
    { id: 2, text: 'Спасибо большое! 🎵', sender: 'me', time: '14:32', status: 'read', reactions: [{ emoji: '❤️', count: 1, users: ['Дмитрий К.'] }] },
    { id: 3, text: 'Когда планируешь новый релиз?', sender: 'other', time: '14:33', status: 'read' },
    { id: 4, text: 'Сейчас работаю над новым EP, выйдет скоро!', sender: 'me', time: '14:35', status: 'delivered', pinned: true },
  ],
  2: [
    { id: 1, text: 'Привет! Когда следующий концерт?', sender: 'other', time: '12:20', status: 'read' },
    { id: 2, text: 'Привет! Планирую выступление в следующем месяце', sender: 'me', time: '12:25', status: 'read' },
    { id: 3, text: 'Отлично! Где именно?', sender: 'other', time: '12:27', status: 'read' },
    { id: 4, text: 'В клубе на Садовой', sender: 'me', time: '12:30', status: 'read', replyTo: { id: 3, text: 'Отлично! Где именно?', sender: 'Мария С.' } },
  ],
  3: [
    { id: 1, text: 'Отличный трек! Можно использовать в своем проекте?', sender: 'other', time: '09:15', status: 'read' },
    { id: 2, text: 'Спасибо! Давайте обсудим детали', sender: 'me', time: '09:20', status: 'read' },
  ],
  4: [
    { id: 1, text: 'Привет! Можно коллаборацию?', sender: 'other', time: 'Вчера' },
    { id: 2, text: 'Привет! Давай обсудим, какие идеи?', sender: 'me', time: 'Вчера', status: 'read' },
  ],
  5: [
    { id: 1, text: 'Привет! Как дела?', sender: 'other', time: '2 дня назад' },
  ],
  6: [
    { id: 1, text: 'Спасибо за ответ! Очень помогло', sender: 'other', time: '3 дня назад' },
    { id: 2, text: 'Всегда рад помочь! 😊', sender: 'me', time: '3 дня назад', status: 'read' },
  ],
};

const emojis = ['😊', '😂', '❤️', '🎵', '🎸', '🎤', '🔥', '👍', '🙌', '✨', '💯', '🎶'];
const reactionEmojis = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

interface MessagesPageProps {
  initialUser?: {
    userId: string;
    userName: string;
    userAvatar?: string;
  } | null;
  onMessageContextClear?: () => void;
  onOpenChat?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function MessagesPage({ initialUser, onMessageContextClear, onOpenChat }: MessagesPageProps = {}) {
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messagesByChat, setMessagesByChat] = useState(initialMessagesByChat);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: number } | null>(null);
  const [showMobileMessageMenu, setShowMobileMessageMenu] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const selectedChat = conversations[selectedChatIndex];
  const currentMessages = messagesByChat[selectedChat.id] || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedChat.typing]);

  // Handle initial user from donations/payments
  useEffect(() => {
    if (initialUser) {
      // Find existing conversation by userId (more reliable than name)
      const existingChatIndex = conversations.findIndex(
        conv => conv.userId === initialUser.userId
      );

      if (existingChatIndex !== -1) {
        // Open existing chat
        setSelectedChatIndex(existingChatIndex);
        setShowMobileChat(true);
        console.log(`✅ Opened existing chat with ${initialUser.userName}`);
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: Date.now(),
          userId: initialUser.userId,
          name: initialUser.userName,
          lastMessage: 'Начните беседу...',
          time: 'сейчас',
          unread: 0,
          avatar: initialUser.userAvatar || '?',
          online: false,
          pinned: false,
        };

        setConversations(prev => [newConversation, ...prev]);
        setMessagesByChat(prev => ({ ...prev, [newConversation.id]: [] }));
        setSelectedChatIndex(0);
        setShowMobileChat(true);
        console.log(`✅ Created new chat with ${initialUser.userName}`);

        // Initialize empty messages for this chat
        setTimeout(() => {
          setInputValue(`Здравствуйте! Спасибо за поддержку! 🎵`);
          inputRef.current?.focus();
        }, 300);
      }

      // Clear context after processing
      if (onMessageContextClear) {
        onMessageContextClear();
      }
    }
  }, [initialUser]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setShowChatMenu(false);
      setShowMobileMessageMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Simulate typing indicator
  const simulateTyping = () => {
    setConversations(prev => prev.map((conv, idx) => 
      idx === selectedChatIndex ? { ...conv, typing: true } : conv
    ));

    setTimeout(() => {
      setConversations(prev => prev.map((conv, idx) => 
        idx === selectedChatIndex ? { ...conv, typing: false } : conv
      ));
    }, 2000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !editingMessage) return;

    setIsSending(true);

    if (editingMessage) {
      setMessagesByChat(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id].map(msg =>
          msg.id === editingMessage
            ? { ...msg, text: inputValue, edited: true }
            : msg
        ),
      }));
      setEditingMessage(null);
    } else {
      const newMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: 'me',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sender === 'me' ? 'Вы' : selectedChat.name,
        } : undefined,
      };

      setMessagesByChat(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
      }));

      setConversations(prev => prev.map((conv, idx) => 
        idx === selectedChatIndex 
          ? { ...conv, lastMessage: inputValue, time: 'Сейчас' }
          : conv
      ));

      setTimeout(() => {
        setMessagesByChat(prev => ({
          ...prev,
          [selectedChat.id]: prev[selectedChat.id].map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          ),
        }));
      }, 1000);

      setTimeout(() => {
        setMessagesByChat(prev => ({
          ...prev,
          [selectedChat.id]: prev[selectedChat.id].map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          ),
        }));
      }, 2000);

      if (Math.random() > 0.3) {
        setTimeout(() => {
          simulateTyping();
          setTimeout(() => {
            const responses = [
              'Понял, спасибо!',
              'Отлично! 👍',
              'Звучит здорово!',
              'Договорились! 🎵',
              'Супер, жду!',
              'Хорошо, сделаем!',
              'Согласен полностью',
            ];
            
            const responseMessage: Message = {
              id: Date.now() + 1,
              text: responses[Math.floor(Math.random() * responses.length)],
              sender: 'other',
              time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            };

            setMessagesByChat(prev => ({
              ...prev,
              [selectedChat.id]: [...prev[selectedChat.id], responseMessage],
            }));

            setConversations(prev => prev.map((conv, idx) => 
              idx === selectedChatIndex 
                ? { ...conv, lastMessage: responseMessage.text, time: 'Сейчас', unread: conv.unread + 1 }
                : conv
            ));
          }, 2000);
        }, 1000);
      }
    }

    setInputValue('');
    setReplyingTo(null);
    setIsSending(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    
    const newMessage: Message = {
      id: Date.now(),
      text: isImage ? '' : `Отправил файл ${file.name}`,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      image: isImage ? URL.createObjectURL(file) : undefined,
      file: !isImage ? {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      } : undefined,
    };

    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    setConversations(prev => prev.map((conv, idx) => 
      idx === selectedChatIndex 
        ? { ...conv, lastMessage: isImage ? '📷 Фото' : '📎 Файл', time: 'Сейчас' }
        : conv
    ));
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].filter(msg => msg.id !== messageId),
    }));
    setContextMenu(null);
    setShowMobileMessageMenu(null);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message.id);
    setInputValue(message.text);
    setContextMenu(null);
    setShowMobileMessageMenu(null);
    inputRef.current?.focus();
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
    setContextMenu(null);
    setShowMobileMessageMenu(null);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setContextMenu(null);
    setShowMobileMessageMenu(null);
  };

  const handleForwardMessage = (message: Message) => {
    alert('Функция "Переслать" - выберите получателя');
    setContextMenu(null);
    setShowMobileMessageMenu(null);
  };

  const handlePinMessage = (messageId: number) => {
    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].map(msg =>
        msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
      ),
    }));
    
    const message = currentMessages.find(m => m.id === messageId);
    if (message && !message.pinned) {
      setConversations(prev => prev.map((conv, idx) => 
        idx === selectedChatIndex 
          ? { ...conv, pinnedMessage: message.text }
          : conv
      ));
    } else {
      setConversations(prev => prev.map((conv, idx) => 
        idx === selectedChatIndex 
          ? { ...conv, pinnedMessage: undefined }
          : conv
      ));
    }
    
    setContextMenu(null);
    setShowMobileMessageMenu(null);
  };

  const handleAddReaction = (messageId: number, emoji: string) => {
    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].map(msg => {
        if (msg.id !== messageId) return msg;
        
        const existingReactions = msg.reactions || [];
        const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
        
        if (reactionIndex >= 0) {
          const newReactions = [...existingReactions];
          newReactions[reactionIndex] = {
            ...newReactions[reactionIndex],
            count: newReactions[reactionIndex].count - 1,
          };
          return {
            ...msg,
            reactions: newReactions.filter(r => r.count > 0),
          };
        } else {
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, count: 1, users: ['Вы'] }],
          };
        }
      }),
    }));
    setShowMobileMessageMenu(null);
  };

  const handleToggleFavorite = () => {
    setConversations(prev => prev.map((conv, idx) => 
      idx === selectedChatIndex 
        ? { ...conv, favorite: !conv.favorite }
        : conv
    ));
    setShowChatMenu(false);
  };

  const handleArchiveChat = () => {
    setConversations(prev => prev.map((conv, idx) => 
      idx === selectedChatIndex 
        ? { ...conv, archived: !conv.archived }
        : conv
    ));
    setShowChatMenu(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    const newMessage: Message = {
      id: Date.now(),
      text: '',
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      voice: {
        duration: recordingTime,
      },
    };

    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    setConversations(prev => prev.map((conv, idx) => 
      idx === selectedChatIndex 
        ? { ...conv, lastMessage: '🎤 Голосовое сообщение', time: 'Сейчас' }
        : conv
    ));
  };

  const handlePlayVoice = (messageId: number) => {
    if (playingVoice === messageId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(messageId);
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);
    }
  };

  const displayConversations = showArchived 
    ? conversations.filter(c => c.archived)
    : conversations.filter(c => !c.archived);

  const filteredConversations = displayConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (index: number) => {
    const actualIndex = conversations.indexOf(filteredConversations[index]);
    setSelectedChatIndex(actualIndex);
    setShowMobileChat(true);
    
    setConversations(prev => prev.map((conv, idx) => 
      idx === actualIndex ? { ...conv, unread: 0 } : conv
    ));
  };

  const formatVoiceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] px-2 sm:px-4 md:px-0 max-w-7xl mx-auto">
      <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 h-full">
        {/* Conversations List */}
        <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-72 lg:w-80 xl:w-96 flex-col backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl md:rounded-2xl overflow-hidden`}>
          {/* Header */}
          <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-white">Сообщения</h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowArchived(!showArchived)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${showArchived ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-gray-400'}`}
              >
                <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                <p className="text-gray-400 text-sm sm:text-base">
                  {showArchived ? 'Нет архивных чатов' : 'Ничего не найдено'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, index) => {
                return (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectChat(index)}
                    className={`w-full p-2.5 sm:p-3 md:p-4 border-b border-white/10 hover:bg-white/10 active:bg-white/15 transition-all duration-300 text-left relative ${
                      selectedChat.id === conv.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {conv.favorite && (
                        <Star className="absolute top-2 right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                      )}
                      
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                          {conv.name.charAt(0)}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full bg-green-500 border-2 border-slate-900"></div>
                        )}
                        {conv.unread > 0 && (
                          <div className="absolute -top-1 -right-1 min-w-4 h-4 sm:min-w-5 sm:h-5 md:min-w-6 md:h-6 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            {conv.unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                          <div className={`font-semibold truncate text-sm sm:text-base ${conv.unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                            {conv.name}
                          </div>
                          <div className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</div>
                        </div>
                        <div className={`text-xs sm:text-sm truncate ${conv.unread > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {conv.typing ? (
                            <span className="flex items-center gap-1">
                              <span className="text-cyan-400">печатает</span>
                              <span className="flex gap-0.5">
                                <motion.span
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                  className="w-1 h-1 rounded-full bg-cyan-400"
                                />
                                <motion.span
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                  className="w-1 h-1 rounded-full bg-cyan-400"
                                />
                                <motion.span
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                  className="w-1 h-1 rounded-full bg-cyan-400"
                                />
                              </span>
                            </span>
                          ) : (
                            conv.lastMessage
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl md:rounded-2xl overflow-hidden`}>
          {/* Chat Header */}
          <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {selectedChat.name.charAt(0)}
                </div>
                {selectedChat.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-slate-900"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="text-white font-semibold text-sm sm:text-base truncate">{selectedChat.name}</div>
                  {selectedChat.favorite && (
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {selectedChat.typing ? (
                    <span className="text-cyan-400">печатает...</span>
                  ) : selectedChat.online ? (
                    'Онлайн'
                  ) : (
                    'Был(а) недавно'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300 hidden sm:block"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300 hidden sm:block"
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChatMenu(!showChatMenu);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300"
                >
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                </motion.button>

                <AnimatePresence>
                  {showChatMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-2 w-48 sm:w-52 py-2 rounded-xl backdrop-blur-xl bg-slate-900/95 border border-white/20 shadow-2xl z-50"
                    >
                      <button
                        onClick={handleToggleFavorite}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-2"
                      >
                        <Star className={`w-4 h-4 ${selectedChat.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {selectedChat.favorite ? 'Убрать из избранного' : 'В избранное'}
                      </button>
                      <button
                        onClick={handleArchiveChat}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        {selectedChat.archived ? 'Разархивировать' : 'Архивировать'}
                      </button>
                      <button
                        onClick={() => {
                          setMessagesByChat(prev => ({ ...prev, [selectedChat.id]: [] }));
                          setShowChatMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Очистить историю
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Pinned Message */}
          {selectedChat.pinnedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-cyan-500/10 border-b border-cyan-400/30 flex items-center gap-2"
            >
              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-cyan-400 font-semibold mb-0.5">Закрепленное</div>
                <div className="text-xs sm:text-sm text-white truncate">{selectedChat.pinnedMessage}</div>
              </div>
              <button
                onClick={() => {
                  setConversations(prev => prev.map((conv, idx) => 
                    idx === selectedChatIndex ? { ...conv, pinnedMessage: undefined } : conv
                  ));
                }}
                className="p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </button>
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {currentMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (window.innerWidth >= 768) {
                      setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg.id });
                    }
                  }}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setShowMobileMessageMenu(msg.id);
                    }
                  }}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-md lg:max-w-lg ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1 relative`}>
                    {msg.pinned && (
                      <div className="flex items-center gap-1 px-2 text-xs text-cyan-400">
                        <Pin className="w-3 h-3" />
                        <span>Закреплено</span>
                      </div>
                    )}

                    {msg.replyTo && (
                      <div className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border-l-4 text-xs sm:text-sm ${msg.sender === 'me' ? 'bg-cyan-500/10 border-cyan-400' : 'bg-white/5 border-gray-400'}`}>
                        <div className="text-xs text-gray-400 font-semibold mb-0.5">{msg.replyTo.sender}</div>
                        <div className="text-xs text-gray-300 truncate max-w-[250px] sm:max-w-xs">{msg.replyTo.text}</div>
                      </div>
                    )}
                    
                    {msg.image && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 cursor-pointer max-w-[250px] sm:max-w-xs"
                      >
                        <ImageWithFallback
                          src={msg.image}
                          alt="Shared image"
                          className="w-full h-auto"
                        />
                      </motion.div>
                    )}
                    
                    {msg.file && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-xs sm:text-sm font-medium truncate">{msg.file.name}</div>
                          <div className="text-gray-400 text-xs">{msg.file.size}</div>
                        </div>
                      </div>
                    )}

                    {msg.voice && (
                      <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 min-w-[200px] sm:min-w-[250px] ${
                        msg.sender === 'me'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                          : 'bg-white/10'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVoice(msg.id);
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender === 'me' ? 'bg-white/20' : 'bg-cyan-500/20'
                          }`}
                        >
                          {playingVoice === msg.id ? (
                            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`h-1 rounded-full ${msg.sender === 'me' ? 'bg-white/30' : 'bg-cyan-400/30'} mb-1`}>
                            <motion.div
                              className={`h-full rounded-full ${msg.sender === 'me' ? 'bg-white' : 'bg-cyan-400'}`}
                              initial={{ width: '0%' }}
                              animate={{ width: playingVoice === msg.id ? '100%' : '0%' }}
                              transition={{ duration: msg.voice.duration }}
                            />
                          </div>
                          <div className="text-xs text-white/70">{formatVoiceTime(msg.voice.duration)}</div>
                        </div>
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 flex-shrink-0" />
                      </div>
                    )}
                    
                    {msg.text && (
                      <div
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                            : 'bg-white/10 text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                        {msg.edited && (
                          <span className="text-xs opacity-70 ml-2">(изменено)</span>
                        )}
                      </div>
                    )}

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 flex-wrap px-2">
                        {msg.reactions.map((reaction, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddReaction(msg.id, reaction.emoji);
                            }}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/20 flex items-center gap-1 text-xs hover:bg-white/20 active:bg-white/25 transition-all duration-300"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-white font-medium">{reaction.count}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick reactions on hover (desktop only) */}
                    <div className={`hidden md:flex absolute ${msg.sender === 'me' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 px-2`}>
                      {reactionEmojis.slice(0, 3).map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddReaction(msg.id, emoji);
                          }}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/95 border border-white/20 flex items-center justify-center text-xs sm:text-sm hover:bg-white/10 transition-all duration-300"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 px-2">
                      <p className={`text-xs ${msg.sender === 'me' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                      {msg.sender === 'me' && msg.status && (
                        <div className="flex items-center">
                          {msg.status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedChat.typing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 rounded-bl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-cyan-500/10 border-t border-cyan-400/30 flex items-center gap-2 sm:gap-3"
              >
                <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-cyan-400 font-semibold mb-0.5">
                    Ответ на {replyingTo.sender === 'me' ? 'ваше сообщение' : selectedChat.name}
                  </div>
                  <div className="text-xs sm:text-sm text-white truncate">{replyingTo.text || '📷 Фото'}</div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="p-2 sm:p-3 md:p-4 border-t border-white/10">
            {/* Recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 sm:mb-3 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-red-500/10 border border-red-400/30 flex items-center gap-2 sm:gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 flex-shrink-0"
                  />
                  <span className="text-red-400 font-semibold text-sm sm:text-base">Идет запись...</span>
                  <span className="text-white ml-auto text-sm sm:text-base">{formatVoiceTime(recordingTime)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 sm:mb-3 p-2 sm:p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl"
                >
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {emojis.map((emoji, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg hover:bg-white/10 active:bg-white/15 flex items-center justify-center text-lg sm:text-xl transition-all duration-300"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {!isRecording && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all duration-300 flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                </motion.button>
              )}

              {!isRecording ? (
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={editingMessage ? "Редактирование..." : "Сообщение..."}
                    className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                  />
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-300"
                  >
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex-1" />
              )}

              {!inputValue.trim() && !editingMessage ? (
                isRecording ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopRecording}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-lg flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-sm sm:text-base"
                  >
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Стоп</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={handleStartRecording}
                    onTouchStart={handleStartRecording}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-sm sm:text-base"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Голос</span>
                  </motion.button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-1.5 sm:gap-2 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/20 text-sm sm:text-base"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : editingMessage ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">OK</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Отправить</span>
                    </>
                  )}
                </motion.button>
              )}

              {editingMessage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingMessage(null);
                    setInputValue('');
                  }}
                  className="p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              top: Math.min(contextMenu.y, window.innerHeight - 400),
            }}
            className="hidden md:block py-2 rounded-xl backdrop-blur-xl bg-slate-900/95 border border-white/20 shadow-2xl z-50 min-w-48"
          >
            {(() => {
              const message = currentMessages.find(m => m.id === contextMenu.messageId);
              if (!message) return null;
              
              return (
                <>
                  <button
                    onClick={() => handleReplyMessage(message)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    Ответить
                  </button>
                  
                  {message.sender === 'me' && (
                    <>
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Редактировать
                      </button>
                      
                      <button
                        onClick={() => handlePinMessage(message.id)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                      >
                        <Pin className="w-4 h-4" />
                        {message.pinned ? 'Открепить' : 'Закрепить'}
                      </button>
                    </>
                  )}
                  
                  {message.text && (
                    <button
                      onClick={() => handleCopyMessage(message.text)}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Копировать
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleForwardMessage(message)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                  >
                    <Forward className="w-4 h-4" />
                    Переслать
                  </button>
                  
                  <div className="my-1 h-px bg-white/10" />
                  
                  <div className="px-4 py-2 text-xs text-gray-400">Реакции</div>
                  <div className="px-4 pb-2 flex gap-2">
                    {reactionEmojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddReaction(message.id, emoji)}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-lg transition-all duration-300"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                  
                  {message.sender === 'me' && (
                    <>
                      <div className="my-1 h-px bg-white/10" />
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet Menu */}
      <AnimatePresence>
        {showMobileMessageMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMessageMenu(null)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 pb-safe rounded-t-3xl backdrop-blur-xl bg-slate-900/95 border-t border-white/20 shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
            >
              {(() => {
                const message = currentMessages.find(m => m.id === showMobileMessageMenu);
                if (!message) return null;
                
                return (
                  <div className="p-4">
                    <div className="w-12 h-1.5 rounded-full bg-white/30 mx-auto mb-4" />
                    
                    <button
                      onClick={() => handleReplyMessage(message)}
                      className="w-full px-4 py-3.5 text-left text-base text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl mb-2"
                    >
                      <Reply className="w-5 h-5" />
                      Ответить
                    </button>
                    
                    {message.sender === 'me' && (
                      <>
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="w-full px-4 py-3.5 text-left text-base text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl mb-2"
                        >
                          <Edit2 className="w-5 h-5" />
                          Редактировать
                        </button>
                        
                        <button
                          onClick={() => handlePinMessage(message.id)}
                          className="w-full px-4 py-3.5 text-left text-base text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl mb-2"
                        >
                          <Pin className="w-5 h-5" />
                          {message.pinned ? 'Открепить' : 'Закрепить'}
                        </button>
                      </>
                    )}
                    
                    {message.text && (
                      <button
                        onClick={() => handleCopyMessage(message.text)}
                        className="w-full px-4 py-3.5 text-left text-base text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl mb-2"
                      >
                        <Copy className="w-5 h-5" />
                        Копировать
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleForwardMessage(message)}
                      className="w-full px-4 py-3.5 text-left text-base text-white hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl mb-2"
                    >
                      <Forward className="w-5 h-5" />
                      Переслать
                    </button>
                    
                    <div className="my-3 h-px bg-white/10" />
                    
                    <div className="px-4 py-2 text-sm text-gray-400">Реакции</div>
                    <div className="px-4 pb-3 flex gap-3 justify-center">
                      {reactionEmojis.map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAddReaction(message.id, emoji)}
                          className="w-12 h-12 rounded-xl bg-white/10 active:bg-white/15 flex items-center justify-center text-2xl transition-all duration-300"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                    
                    {message.sender === 'me' && (
                      <>
                        <div className="my-3 h-px bg-white/10" />
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="w-full px-4 py-3.5 text-left text-base text-red-400 hover:bg-white/10 active:bg-white/15 transition-all duration-300 flex items-center gap-3 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
