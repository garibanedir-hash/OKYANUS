"use server";

export async function loginDemoAction() {
  return {
    ok: false,
    message: "Bu ekran demo modda çalışmaktadır. Gerçek giriş Supabase Auth entegrasyonundan sonra aktif olacaktır."
  };
}
