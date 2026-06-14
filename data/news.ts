export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  relatedProjectSlug?: string;
  relatedActivitySlug?: string;
};

export const news: NewsItem[] = [];
