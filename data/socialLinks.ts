import { contactInfo } from "@/data/contactInfo";

export type SocialLink = {
  label: string;
  href: string;
  isActive: boolean;
};

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "", isActive: false },
  { label: "Facebook", href: "", isActive: false },
  { label: "X / Twitter", href: "", isActive: false },
  { label: "YouTube", href: "", isActive: false },
  { label: "LinkedIn", href: "", isActive: false },
  { label: "WhatsApp", href: contactInfo.whatsappHref, isActive: true }
];

export const activeSocialLinks = socialLinks.filter((item) => item.isActive && item.href);
