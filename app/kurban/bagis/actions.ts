"use server";

import { redirect } from "next/navigation";

export async function submitQurbanDonationDemoAction() {
  redirect("/kurban/bagis?durum=demo");
}
