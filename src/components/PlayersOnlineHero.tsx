/* eslint-disable @next/next/no-img-element */
import { Tooltip } from "@mantine/core";

export default function PlayersOnlineHero(props: {
  /**
   * Array of usernames of players online.
   */
  players: {
    name: string;
    uuid: string;
  }[];
}) {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mt-20 max-w-lg sm:mx-auto md:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
            {props.players.map((player) => (
              <Tooltip label={player.name} key={player.uuid}>
                <img
                  src={`https://crafatar.com/avatars/${player.uuid}?size=64&overlay`}
                  alt={player.name}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
