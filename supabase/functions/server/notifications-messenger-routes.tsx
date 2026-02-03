/**
 * NOTIFICATIONS & MESSENGER ROUTES
 * Система уведомлений и мессенджера
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv-utils.tsx'; // Use kv-utils with retry logic

const app = new Hono();

// Prefixes
const NOTIFICATION_PREFIX = 'notification:';
const USER_NOTIFICATIONS_PREFIX = 'user_notifications:';
const CONVERSATION_PREFIX = 'conversation:';
const MESSAGE_PREFIX = 'message:';
const USER_CONVERSATIONS_PREFIX = 'user_conversations:';

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * GET /notifications/user/:userId
 * Получить все уведомления пользователя
 */
app.get('/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    // Получаем список ID уведомлений пользователя
    const userNotificationsKey = `${USER_NOTIFICATIONS_PREFIX}${userId}`;
    const notificationIds = await kv.get(userNotificationsKey) || [];
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return c.json({ success: true, data: [] });
    }
    
    // Получаем все уведомления
    const notificationKeys = notificationIds.map((id: string) => `${NOTIFICATION_PREFIX}${id}`);
    const notifications = await kv.mget(notificationKeys);
    
    // Фильтруем null значения и сортируем по дате
    const validNotifications = notifications
      .filter(Boolean)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    
    return c.json({ 
      success: true, 
      data: validNotifications 
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * POST /notifications/send
 * Создать и отправить уведомление
 */
app.post('/send', async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      type,
      message,
      title,
      link,
      metadata,
    } = body;

    if (!user_id || !type || !message) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const notificationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notificationKey = `${NOTIFICATION_PREFIX}${notificationId}`;

    const notification = {
      id: notificationId,
      user_id,
      type,
      message,
      title: title || '',
      link: link || '',
      read: false,
      starred: false,
      archived: false,
      created_at: new Date().toISOString(),
      metadata: metadata || {},
    };

    // Сохраняем уведомление
    await kv.set(notificationKey, notification);

    // Добавляем в список уведомлений пользователя
    const userNotificationsKey = `${USER_NOTIFICATIONS_PREFIX}${user_id}`;
    const existingNotifications = await kv.get(userNotificationsKey) || [];
    await kv.set(userNotificationsKey, [...existingNotifications, notificationId]);

    return c.json({ 
      success: true, 
      data: notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create notification' 
    }, 500);
  }
});

/**
 * PUT /notifications/:notificationId/read
 * Отметить уведомление как прочитанное
 */
app.put('/:notificationId/read', async (c) => {
  const notificationId = c.req.param('notificationId');
  
  try {
    const key = `${NOTIFICATION_PREFIX}${notificationId}`;
    const notification = await kv.get(key);

    if (!notification) {
      return c.json({ 
        success: false, 
        error: 'Notification not found' 
      }, 404);
    }

    notification.read = true;
    await kv.set(key, notification);

    return c.json({ 
      success: true, 
      data: notification 
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to mark as read' 
    }, 500);
  }
});

/**
 * PUT /notifications/:notificationId/star
 * Переключить избранное
 */
app.put('/:notificationId/star', async (c) => {
  const notificationId = c.req.param('notificationId');
  
  try {
    const body = await c.req.json();
    const { starred } = body;

    const key = `${NOTIFICATION_PREFIX}${notificationId}`;
    const notification = await kv.get(key);

    if (!notification) {
      return c.json({ 
        success: false, 
        error: 'Notification not found' 
      }, 404);
    }

    notification.starred = starred;
    await kv.set(key, notification);

    return c.json({ 
      success: true, 
      data: notification 
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to toggle star' 
    }, 500);
  }
});

/**
 * DELETE /notifications/:notificationId
 * Удалить уведомление
 */
app.delete('/:notificationId', async (c) => {
  const notificationId = c.req.param('notificationId');
  
  try {
    const key = `${NOTIFICATION_PREFIX}${notificationId}`;
    const notification = await kv.get(key);

    if (!notification) {
      return c.json({ 
        success: false, 
        error: 'Notification not found' 
      }, 404);
    }

    // Удаляем уведомление
    await kv.del(key);

    // Удаляем из списка пользователя
    const userNotificationsKey = `${USER_NOTIFICATIONS_PREFIX}${notification.user_id}`;
    const existingNotifications = await kv.get(userNotificationsKey) || [];
    await kv.set(
      userNotificationsKey, 
      existingNotifications.filter((id: string) => id !== notificationId)
    );

    return c.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to delete notification' 
    }, 500);
  }
});

// ============================================
// MESSENGER
// ============================================

/**
 * GET /messenger/conversations/:userId
 * Получить все разговоры пользователя
 */
app.get('/conversations/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const userConversationsKey = `${USER_CONVERSATIONS_PREFIX}${userId}`;
    const conversationIds = await kv.get(userConversationsKey) || [];
    
    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return c.json({ success: true, data: [] });
    }
    
    const conversationKeys = conversationIds.map((id: string) => `${CONVERSATION_PREFIX}${id}`);
    const conversations = await kv.mget(conversationKeys);
    
    const validConversations = conversations
      .filter(Boolean)
      .sort((a: any, b: any) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    
    return c.json({ 
      success: true, 
      data: validConversations 
    });
  } catch (error) {
    console.error('Error loading conversations:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * POST /messenger/conversation/create
 * Создать новый разговор
 */
app.post('/conversation/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      participants, // array of user IDs
      subject,
      type, // 'support' | 'moderation' | 'admin' | 'user'
    } = body;

    if (!participants || participants.length < 2 || !subject) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const conversationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationKey = `${CONVERSATION_PREFIX}${conversationId}`;

    const conversation = {
      id: conversationId,
      participants,
      subject,
      type: type || 'user',
      last_message: '',
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      created_at: new Date().toISOString(),
    };

    await kv.set(conversationKey, conversation);

    // Добавляем в список разговоров каждого участника
    for (const participantId of participants) {
      const userConversationsKey = `${USER_CONVERSATIONS_PREFIX}${participantId}`;
      const existingConversations = await kv.get(userConversationsKey) || [];
      await kv.set(userConversationsKey, [...existingConversations, conversationId]);
    }

    return c.json({ 
      success: true, 
      data: conversation 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create conversation' 
    }, 500);
  }
});

/**
 * GET /messenger/messages/:conversationId
 * Получить сообщения разговора
 */
app.get('/messages/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');
  
  try {
    const prefix = `${MESSAGE_PREFIX}${conversationId}:`;
    const messages = await kv.getByPrefix(prefix);
    
    const validMessages = messages
      .map((item: any) => item.value)
      .sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    
    return c.json({ 
      success: true, 
      data: validMessages 
    });
  } catch (error) {
    console.error('Error loading messages:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * POST /messenger/send
 * Отправить сообщение
 */
app.post('/send', async (c) => {
  try {
    const body = await c.req.json();
    const {
      conversation_id,
      from_user_id,
      message,
      metadata,
    } = body;

    if (!conversation_id || !from_user_id || !message) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageKey = `${MESSAGE_PREFIX}${conversation_id}:${messageId}`;

    const messageData = {
      id: messageId,
      conversation_id,
      from_user_id,
      message,
      read: false,
      created_at: new Date().toISOString(),
      metadata: metadata || {},
    };

    await kv.set(messageKey, messageData);

    // Обновляем разговор
    const conversationKey = `${CONVERSATION_PREFIX}${conversation_id}`;
    const conversation = await kv.get(conversationKey);
    
    if (conversation) {
      conversation.last_message = message;
      conversation.last_message_at = new Date().toISOString();
      
      // Увеличиваем счетчик непрочитанных для других участников
      conversation.participants.forEach((participantId: string) => {
        if (participantId !== from_user_id) {
          conversation.unread_count = (conversation.unread_count || 0) + 1;
        }
      });
      
      await kv.set(conversationKey, conversation);
      
      // 🆕 Создаём уведомление для каждого получателя
      const recipients = conversation.participants.filter((id: string) => id !== from_user_id);
      
      for (const recipientId of recipients) {
        const notificationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notificationKey = `${NOTIFICATION_PREFIX}${notificationId}`;
        
        // Получаем имя отправителя (если есть в metadata)
        const senderName = metadata?.sender_name || 'Новое сообщение';
        
        const notification = {
          id: notificationId,
          user_id: recipientId,
          type: 'new_message',
          title: senderName,
          message: message.length > 100 ? message.substring(0, 100) + '...' : message,
          link: `/notifications?tab=messenger&conversation=${conversation_id}`,
          read: false,
          starred: false,
          archived: false,
          created_at: new Date().toISOString(),
          metadata: {
            conversation_id,
            sender_id: from_user_id,
            message_id: messageId,
            conversation_type: conversation.type,
            conversation_subject: conversation.subject,
          },
        };
        
        await kv.set(notificationKey, notification);
        
        // Добавляем в список уведомлений пользователя
        const userNotificationsKey = `${USER_NOTIFICATIONS_PREFIX}${recipientId}`;
        const existingNotifications = await kv.get(userNotificationsKey) || [];
        await kv.set(userNotificationsKey, [...existingNotifications, notificationId]);
      }
    }

    return c.json({ 
      success: true, 
      data: messageData 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to send message' 
    }, 500);
  }
});

/**
 * PUT /messenger/conversations/:conversationId/read
 * Отметить разговор как прочитанный
 */
app.put('/conversations/:conversationId/read', async (c) => {
  const conversationId = c.req.param('conversationId');
  
  try {
    const conversationKey = `${CONVERSATION_PREFIX}${conversationId}`;
    const conversation = await kv.get(conversationKey);

    if (!conversation) {
      return c.json({ 
        success: false, 
        error: 'Conversation not found' 
      }, 404);
    }

    conversation.unread_count = 0;
    await kv.set(conversationKey, conversation);

    // Отмечаем все сообщения как прочитанные
    const prefix = `${MESSAGE_PREFIX}${conversationId}:`;
    const messages = await kv.getByPrefix(prefix);
    
    for (const item of messages) {
      const messageData = item.value;
      if (!messageData.read) {
        messageData.read = true;
        await kv.set(item.key, messageData);
      }
    }

    return c.json({ 
      success: true, 
      data: conversation 
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to mark as read' 
    }, 500);
  }
});

export default app;