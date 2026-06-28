export type Supporter = {
  name: string;
  logoSrc: string;
  website?: string;
  isActive: boolean;
};

export const supporters: Supporter[] = [
  {
    name: "Tropikal Bahçem",
    logoSrc: "/supporters/tropikal-bahcem.png",
    website: "https://tropicalbahcem.com/",
    isActive: true
  }
];

export function getActiveSupporters() {
  return supporters.filter((supporter) => supporter.isActive && supporter.name.trim() && supporter.logoSrc.trim());
}
