// Placeholder Database type.
// Gerçek Supabase type generation yapılınca bu dosya `supabase gen types typescript`
// çıktısıyla güncellenmelidir.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
