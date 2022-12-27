/* eslint-disable @next/next/no-img-element */

import { trpc } from "../utils/trpc";

export default function MinecraftAvatar(props: { uuidOrUsername: string }) {
  const query = trpc.minecraft.getProfile.useQuery({
    usernameOrUUID: props.uuidOrUsername,
  });

  return query.isFetched ? (
    <object
      data={`https://crafatar.com/avatars/${query.data?.id}`}
      type="image/png"
    >
      <img
        src="https://crafatar.com/avatars/f5e658ea-fe2a-4ea7-8df1-d5c08af78a69"
        alt={`${query.data?.name}'s profile picture`}
      />
    </object>
  ) : (
    <div>loading...</div>
  );
}
