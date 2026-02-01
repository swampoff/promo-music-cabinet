/**
 * TICKETS SYSTEM ROUTES
 * Система тикетов поддержки
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Prefixes
const TICKET_PREFIX = 'ticket:';
const USER_TICKETS_PREFIX = 'user_tickets:';
const TICKET_MESSAGE_PREFIX = 'ticket_message:';
const TICKET_STATS_PREFIX = 'ticket_stats:';

// ============================================
// TICKETS
// ============================================

/**
 * GET /user/:userId
 * Получить все тикеты пользователя
 */
app.get('/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const userTicketsKey = `${USER_TICKETS_PREFIX}${userId}`;
    const ticketIds = await kv.get(userTicketsKey) || [];
    
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return c.json({ success: true, data: [] });
    }
    
    const ticketKeys = ticketIds.map((id: string) => `${TICKET_PREFIX}${id}`);
    const tickets = await kv.mget(ticketKeys);
    
    const validTickets = tickets
      .filter(Boolean)
      .sort((a: any, b: any) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    
    return c.json({ 
      success: true, 
      data: validTickets 
    });
  } catch (error) {
    console.error('Error loading tickets:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * GET /:ticketId
 * Получить конкретный тикет
 */
app.get('/:ticketId', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const ticketKey = `${TICKET_PREFIX}${ticketId}`;
    const ticket = await kv.get(ticketKey);
    
    if (!ticket) {
      return c.json({ 
        success: false, 
        error: 'Ticket not found' 
      }, 404);
    }
    
    return c.json({ 
      success: true, 
      data: ticket 
    });
  } catch (error) {
    console.error('Error loading ticket:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load ticket' 
    }, 500);
  }
});

/**
 * POST /create
 * Создать новый тикет
 */
app.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      subject,
      description,
      category,
      priority,
      attachments,
    } = body;

    if (!user_id || !subject || !description || !category) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    const ticketId = `TKT-${Date.now()}`;
    const ticketKey = `${TICKET_PREFIX}${ticketId}`;

    const ticket = {
      id: ticketId,
      user_id,
      subject,
      description,
      category, // 'technical' | 'billing' | 'content' | 'account' | 'other'
      priority: priority || 'medium', // 'low' | 'medium' | 'high' | 'urgent'
      status: 'open', // 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
      assigned_to: null,
      attachments: attachments || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      closed_at: null,
      sla_due_date: calculateSLADueDate(priority || 'medium'),
      tags: [],
      rating: null,
      feedback: null,
    };

    await kv.set(ticketKey, ticket);

    // Добавляем в список тикетов пользователя
    const userTicketsKey = `${USER_TICKETS_PREFIX}${user_id}`;
    const existingTickets = await kv.get(userTicketsKey) || [];
    await kv.set(userTicketsKey, [...existingTickets, ticketId]);

    // Создаём первое сообщение (описание проблемы)
    const firstMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const firstMessageKey = `${TICKET_MESSAGE_PREFIX}${ticketId}:${firstMessageId}`;
    
    const firstMessage = {
      id: firstMessageId,
      ticket_id: ticketId,
      sender_id: user_id,
      sender_type: 'user',
      message: description,
      attachments: attachments || [],
      created_at: new Date().toISOString(),
      internal_note: false,
    };
    
    await kv.set(firstMessageKey, firstMessage);

    return c.json({ 
      success: true, 
      data: ticket 
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create ticket' 
    }, 500);
  }
});

/**
 * PUT /:ticketId
 * Обновить тикет
 */
app.put('/:ticketId', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const body = await c.req.json();
    const ticketKey = `${TICKET_PREFIX}${ticketId}`;
    const ticket = await kv.get(ticketKey);

    if (!ticket) {
      return c.json({ 
        success: false, 
        error: 'Ticket not found' 
      }, 404);
    }

    const updatedTicket = {
      ...ticket,
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    // Если статус изменился на resolved/closed, устанавливаем дату
    if (body.status === 'resolved' && !ticket.resolved_at) {
      updatedTicket.resolved_at = new Date().toISOString();
    }
    if (body.status === 'closed' && !ticket.closed_at) {
      updatedTicket.closed_at = new Date().toISOString();
    }

    await kv.set(ticketKey, updatedTicket);

    return c.json({ 
      success: true, 
      data: updatedTicket 
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update ticket' 
    }, 500);
  }
});

/**
 * DELETE /:ticketId
 * Удалить тикет
 */
app.delete('/:ticketId', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const ticketKey = `${TICKET_PREFIX}${ticketId}`;
    const ticket = await kv.get(ticketKey);

    if (!ticket) {
      return c.json({ 
        success: false, 
        error: 'Ticket not found' 
      }, 404);
    }

    // Удаляем тикет
    await kv.del(ticketKey);

    // Удаляем из списка пользователя
    const userTicketsKey = `${USER_TICKETS_PREFIX}${ticket.user_id}`;
    const existingTickets = await kv.get(userTicketsKey) || [];
    await kv.set(
      userTicketsKey, 
      existingTickets.filter((id: string) => id !== ticketId)
    );

    // Удаляем все сообщения тикета
    const messagesPrefix = `${TICKET_MESSAGE_PREFIX}${ticketId}:`;
    const messages = await kv.getByPrefix(messagesPrefix);
    for (const item of messages) {
      await kv.del(item.key);
    }

    return c.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to delete ticket' 
    }, 500);
  }
});

// ============================================
// TICKET MESSAGES
// ============================================

/**
 * GET /:ticketId/messages
 * Получить все сообщения тикета
 */
app.get('/:ticketId/messages', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const prefix = `${TICKET_MESSAGE_PREFIX}${ticketId}:`;
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
    console.error('Error loading ticket messages:', error);
    return c.json({ 
      success: true,
      data: [] 
    });
  }
});

/**
 * POST /:ticketId/messages
 * Добавить сообщение в тикет
 */
app.post('/:ticketId/messages', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const body = await c.req.json();
    const {
      sender_id,
      sender_type, // 'user' | 'support' | 'admin'
      message,
      attachments,
      internal_note,
    } = body;

    if (!sender_id || !sender_type || !message) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }

    // Проверяем что тикет существует
    const ticketKey = `${TICKET_PREFIX}${ticketId}`;
    const ticket = await kv.get(ticketKey);

    if (!ticket) {
      return c.json({ 
        success: false, 
        error: 'Ticket not found' 
      }, 404);
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageKey = `${TICKET_MESSAGE_PREFIX}${ticketId}:${messageId}`;

    const messageData = {
      id: messageId,
      ticket_id: ticketId,
      sender_id,
      sender_type,
      message,
      attachments: attachments || [],
      internal_note: internal_note || false,
      created_at: new Date().toISOString(),
    };

    await kv.set(messageKey, messageData);

    // Обновляем тикет
    ticket.updated_at = new Date().toISOString();
    
    // Если ответ от поддержки и тикет в статусе waiting_response
    if (sender_type === 'support' || sender_type === 'admin') {
      if (ticket.status === 'waiting_response') {
        ticket.status = 'in_progress';
      }
    }
    
    await kv.set(ticketKey, ticket);

    return c.json({ 
      success: true, 
      data: messageData 
    });
  } catch (error) {
    console.error('Error adding ticket message:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to add message' 
    }, 500);
  }
});

// ============================================
// TICKET RATING
// ============================================

/**
 * POST /:ticketId/rate
 * Оценить решение тикета
 */
app.post('/:ticketId/rate', async (c) => {
  const ticketId = c.req.param('ticketId');
  
  try {
    const body = await c.req.json();
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ 
        success: false, 
        error: 'Invalid rating (must be 1-5)' 
      }, 400);
    }

    const ticketKey = `${TICKET_PREFIX}${ticketId}`;
    const ticket = await kv.get(ticketKey);

    if (!ticket) {
      return c.json({ 
        success: false, 
        error: 'Ticket not found' 
      }, 404);
    }

    ticket.rating = rating;
    ticket.feedback = feedback || null;
    ticket.rated_at = new Date().toISOString();
    
    await kv.set(ticketKey, ticket);

    return c.json({ 
      success: true, 
      data: ticket 
    });
  } catch (error) {
    console.error('Error rating ticket:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to rate ticket' 
    }, 500);
  }
});

// ============================================
// STATS
// ============================================

/**
 * GET /stats/:userId
 * Получить статистику тикетов пользователя
 */
app.get('/stats/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const userTicketsKey = `${USER_TICKETS_PREFIX}${userId}`;
    const ticketIds = await kv.get(userTicketsKey) || [];
    
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return c.json({ 
        success: true, 
        data: {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          avg_resolution_time: 0,
          by_category: {},
          by_priority: {},
          avg_rating: 0,
        }
      });
    }
    
    const ticketKeys = ticketIds.map((id: string) => `${TICKET_PREFIX}${id}`);
    const tickets = await kv.mget(ticketKeys);
    const validTickets = tickets.filter(Boolean);
    
    // Подсчёт статистики
    const stats = {
      total: validTickets.length,
      open: validTickets.filter((t: any) => t.status === 'open').length,
      in_progress: validTickets.filter((t: any) => t.status === 'in_progress').length,
      waiting_response: validTickets.filter((t: any) => t.status === 'waiting_response').length,
      resolved: validTickets.filter((t: any) => t.status === 'resolved').length,
      closed: validTickets.filter((t: any) => t.status === 'closed').length,
      
      by_category: {
        technical: validTickets.filter((t: any) => t.category === 'technical').length,
        billing: validTickets.filter((t: any) => t.category === 'billing').length,
        content: validTickets.filter((t: any) => t.category === 'content').length,
        account: validTickets.filter((t: any) => t.category === 'account').length,
        other: validTickets.filter((t: any) => t.category === 'other').length,
      },
      
      by_priority: {
        low: validTickets.filter((t: any) => t.priority === 'low').length,
        medium: validTickets.filter((t: any) => t.priority === 'medium').length,
        high: validTickets.filter((t: any) => t.priority === 'high').length,
        urgent: validTickets.filter((t: any) => t.priority === 'urgent').length,
      },
      
      avg_resolution_time: calculateAvgResolutionTime(validTickets),
      avg_rating: calculateAvgRating(validTickets),
      
      overdue: validTickets.filter((t: any) => {
        if (t.status === 'resolved' || t.status === 'closed') return false;
        return new Date(t.sla_due_date) < new Date();
      }).length,
    };
    
    return c.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error loading ticket stats:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load stats' 
    }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateSLADueDate(priority: string): string {
  const now = new Date();
  let hoursToAdd = 24; // default
  
  switch (priority) {
    case 'low':
      hoursToAdd = 72; // 3 days
      break;
    case 'medium':
      hoursToAdd = 48; // 2 days
      break;
    case 'high':
      hoursToAdd = 24; // 1 day
      break;
    case 'urgent':
      hoursToAdd = 4; // 4 hours
      break;
  }
  
  now.setHours(now.getHours() + hoursToAdd);
  return now.toISOString();
}

function calculateAvgResolutionTime(tickets: any[]): number {
  const resolvedTickets = tickets.filter((t: any) => t.resolved_at);
  
  if (resolvedTickets.length === 0) return 0;
  
  const totalTime = resolvedTickets.reduce((sum: number, ticket: any) => {
    const created = new Date(ticket.created_at).getTime();
    const resolved = new Date(ticket.resolved_at).getTime();
    return sum + (resolved - created);
  }, 0);
  
  // Возвращаем среднее время в часах
  return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60));
}

function calculateAvgRating(tickets: any[]): number {
  const ratedTickets = tickets.filter((t: any) => t.rating);
  
  if (ratedTickets.length === 0) return 0;
  
  const totalRating = ratedTickets.reduce((sum: number, ticket: any) => {
    return sum + ticket.rating;
  }, 0);
  
  return parseFloat((totalRating / ratedTickets.length).toFixed(1));
}

export default app;
