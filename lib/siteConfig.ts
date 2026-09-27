// Site-wide identity constants shared by JSON-LD and the footer.
import { SITE_URL } from "@/lib/products";

/** One Organization node everywhere; Product brand/manufacturer/seller
 *  reference it by @id instead of repeating a different object. */
export const ORG_ID = `${SITE_URL}/#organization`;

// TODO_OWNER: paste real profile URLs. Only non-empty values are output —
// in the Organization JSON-LD `sameAs` and as footer icon links.
export const SOCIAL_PROFILES = {
  linkedin: "",
  youtube: "",
  facebook: "",
  madeInChina: "",
  alibaba: "",
  instagram: "",
} as const;

export type SocialKey = keyof typeof SOCIAL_PROFILES;

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  facebook: "Facebook",
  madeInChina: "Made-in-China",
  alibaba: "Alibaba",
  instagram: "Instagram",
};

export const socialProfileEntries = () =>
  (Object.entries(SOCIAL_PROFILES) as [SocialKey, string][]).filter(([, url]) => url.trim() !== "");

// TODO_OWNER: confirm ashal@ashalinnomech.com receives mail; otherwise switch to a working address.
export const CONTACT_EMAIL = "ashal@ashalinnomech.com";
export const CONTACT_PHONE = "+86 159 8877 5831";
