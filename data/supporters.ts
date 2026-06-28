export type Supporter = {
  name: string;
  logoSrc: string;
  website?: string;
  isActive: boolean;
};

export const supporters: Supporter[] = [
  {
    name: "Tropikal Bahçem",
    logoSrc: "/supporters/tropikal-bahcem-clean.png",
    website: "https://tropicalbahcem.com/",
    isActive: true
  },
  {
    name: "PDR'net",
    logoSrc: "/supporters/pdrnet.png",
    website: "https://www.instagram.com/pdrnet.tr?igsh=MWhobGxtd3R1aGgwbw==",
    isActive: true
  },
  {
    name: "My Smile",
    logoSrc: "/supporters/my-smile.png",
    website: "https://mysmyletr.com/",
    isActive: true
  }
];

export function getActiveSupporters() {
  return supporters.filter((supporter) => supporter.isActive && supporter.name.trim() && supporter.logoSrc.trim());
}
