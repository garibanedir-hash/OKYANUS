import {
  mockConversations,
  mockMessages,
  mockStaffMembers,
  mockTasks
} from "@/data/adminMock";
import { getPublishedNewsCount } from "@/lib/data/newsRepository";
import { getPublishedProjectCount } from "@/lib/data/projectsRepository";
import { getPublishedReportCount } from "@/lib/data/reportsRepository";
import type { RepositoryResult } from "@/lib/data/readOnlySupabase";

// 8F notu: Bu repository yalnızca düşük riskli public içerik sayaçlarını Supabase read-only
// bağlar. Personel, görev ve mesaj verileri hassas olduğu için mock-only kalır.

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

export async function getAdminReadOnlyContentMetrics(): Promise<RepositoryResult<{
  projectCount: number;
  newsCount: number;
  reportCount: number;
}>> {
  const [projects, news, reports] = await Promise.all([
    getPublishedProjectCount(),
    getPublishedNewsCount(),
    getPublishedReportCount()
  ]);

  return {
    data: {
      projectCount: projects.data,
      newsCount: news.data,
      reportCount: reports.data
    },
    source: projects.source === "supabase" && news.source === "supabase" && reports.source === "supabase"
      ? "supabase"
      : "demo"
  };
}
