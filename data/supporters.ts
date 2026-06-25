export type Supporter = {
  name: string;
  logoSrc: string;
  website?: string;
  isActive: boolean;
};

export const supporters: Supporter[] = [];

export function getActiveSupporters() {
  return supporters.filter((supporter) => supporter.isActive && supporter.name.trim() && supporter.logoSrc.trim());
}
