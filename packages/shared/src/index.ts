export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category_id: string | null;
  tags: string[];
  variables: Variable[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Variable {
  name: string;
  description: string;
  default_value?: string;
}

export interface User {
  id: string;
  email?: string;
}

export type CreatePromptInput = Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count'>;
export type UpdatePromptInput = Partial<CreatePromptInput>;

export type CreateCategoryInput = Omit<Category, 'id' | 'user_id' | 'created_at'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
