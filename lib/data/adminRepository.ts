import {
  mockConversations,
  mockMessages,
  mockStaffMembers,
  mockTasks
} from "@/data/adminMock";

export function getStaffMembers() {
  // TODO: Supabase read-only entegrasyonunda profiles/admin_roles tablosundan beslenecek.
  return mockStaffMembers;
}

export function getTasks() {
  // TODO: Supabase read-only entegrasyonunda internal_tasks tablosundan beslenecek.
  return mockTasks;
}

export function getTaskSummary() {
  const tasks = getTasks();
  return {
    total: tasks.length,
    new: tasks.filter((task) => task.status === "Yeni").length,
    inProgress: tasks.filter((task) => task.status === "Devam Ediyor").length,
    completed: tasks.filter((task) => task.status === "Tamamlandı").length,
    overdue: tasks.filter((task) => task.status === "Gecikti").length
  };
}

export function getConversations() {
  // TODO: Supabase read-only entegrasyonunda internal_conversations tablosundan beslenecek.
  return mockConversations;
}

export function getMessagesByConversation(conversationId: string) {
  // TODO: Supabase read-only entegrasyonunda internal_messages tablosundan beslenecek.
  return mockMessages.filter((message) => message.conversationId === conversationId);
}

export function getInternalCommunicationSummary() {
  const conversations = getConversations();
  return {
    totalConversations: conversations.length,
    unreadTotal: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    taskRelated: conversations.filter((conversation) => Boolean(conversation.relatedTaskId)).length
  };
}
