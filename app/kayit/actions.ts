"use server";

export async function registerDemoAction() {
  return {
    ok: false,
    message: "Bu ekran demo modda çalışmaktadır. Gerçek üyelik Supabase Auth entegrasyonundan sonra aktif olacaktır."
  };
}
