import { z } from "zod";

const MinecraftProfileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export type MinecraftProfile = z.infer<typeof MinecraftProfileSchema>;

const UUIDToProfileCache = new Map<string, MinecraftProfile>();

export async function UUIDToProfile(uuid: string): Promise<MinecraftProfile> {
  if (UUIDToProfileCache.has(uuid)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return UUIDToProfileCache.get(uuid)!;
  }

  const res = await fetch(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(
      /-/g,
      ""
    )}`
  );

  const data = await res.json();

  const parsed = MinecraftProfileSchema.parse(data);

  UUIDToProfileCache.set(uuid, parsed);

  return parsed;
}

const UsernameToProfileCache = new Map<string, MinecraftProfile>();

export async function UsernameToProfile(
  username: string
): Promise<MinecraftProfile | null> {
  try {
    if (UsernameToProfileCache.has(username)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return UsernameToProfileCache.get(username)!;
    }

    const res = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    );

    const data = await res.json();

    const parsed = MinecraftProfileSchema.parse(data);

    UsernameToProfileCache.set(username, parsed);

    return parsed;
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
