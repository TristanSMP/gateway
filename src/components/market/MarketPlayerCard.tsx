/* eslint-disable @next/next/no-img-element */
import { PlusIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import * as Mui from "@mui/material";
import Image from "next/image";
import Diamond from "../../../public/assets/images/minecraft/diamond.png";
import type { ITSMPLocalUser } from "../../server/trpc/router/auth";
import type { IPlayerBalance } from "../../server/trpc/router/market";

const MarketPlayerCard: React.FC<{
  player: ITSMPLocalUser;
  balance: IPlayerBalance;
}> = ({ player, balance }) => {
  return (
    <div className="ml-6 mt-16 rounded-md bg-base-300 shadow-sm">
      <div className="m-6 flex w-96 flex-row items-center gap-6">
        <div>
          <img
            src={`https://crafatar.com/avatars/${player.minecraftUUID}?size=92&overlay`}
            alt={`${player.minecraftName}'s avatar`}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-3xl font-semibold">{player.minecraftName}</div>
          <div className="flex flex-row items-center text-lg">
            <span className="font-medium">Balance</span>:{" "}
            <div className="mx-0.5">
              <Image
                src={Diamond}
                alt={"diamonds"}
                className="h-[1.125rem] w-[1.125rem]"
              />
            </div>
            {balance.balance}
            <Mui.Tooltip
              title={
                <>
                  Hold diamonds and run <pre className="inline">/deposit</pre>{" "}
                  in game.
                </>
              }
              className="ml-2 inline h-6 w-6"
            >
              <PlusIcon className="text-info" />
            </Mui.Tooltip>
          </div>
          <div
            className={`text-lg ${
              balance.itemsInTransit && balance.itemsInTransit
                ? "text-info"
                : ""
            }`}
          >
            <span className="font-medium">Items in transit</span>:{" "}
            {balance.itemsInTransit}
            <Mui.Tooltip
              title={
                <>
                  When you buy an item it becomes &quot;in transit&quot; until
                  you run <pre className="inline">/deliver</pre> in game.
                </>
              }
              className="ml-2 inline h-6 w-6"
            >
              <QuestionMarkCircleIcon className="text-info" />
            </Mui.Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPlayerCard;
