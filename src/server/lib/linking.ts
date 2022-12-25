export const EligibleLinkChallengeItems = [
  "DIRT",
  "COBBLESTONE",
  "COAL",
  "OAK_LOG",
  "SPRUCE_LOG",
  "OAK_PLANKS",
  "SPRUCE_PLANKS",
  "STICK",
] as const;

export function generateLinkChallenge(): string {
  const challenge = (EligibleLinkChallengeItems as unknown as string[])
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .join("-");
  return challenge;
}

export function parseLinkChallenge(challenge: string) {
  return challenge.split("-");
}
