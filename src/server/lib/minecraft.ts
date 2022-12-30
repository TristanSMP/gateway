import { z } from "zod";

const MinecraftProfileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export type MinecraftProfile = z.infer<typeof MinecraftProfileSchema>;

export async function UUIDToProfile(uuid: string): Promise<MinecraftProfile> {
  const res = await fetch(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(
      /-/g,
      ""
    )}`
  );

  const data = await res.json();

  return MinecraftProfileSchema.parse(data);
}

export async function UsernameToProfile(
  username: string
): Promise<MinecraftProfile | null> {
  try {
    const res = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    );

    const data = await res.json();

    return MinecraftProfileSchema.parse(data);
  } catch (e) {
    return null;
  }
}

export function looksLikeUUID(input: string) {
  return input.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
}

export function chunkUUID(uuid: string) {
  return uuid.replace(
    /(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/i,
    "$1-$2-$3-$4-$5"
  );
}
