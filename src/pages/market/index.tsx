/* eslint-disable @next/next/no-img-element */
import { DocumentIcon } from "@heroicons/react/24/solid";
import { List, Modal } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { TRPCClientError } from "@trpc/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Inventory from "../../components/player/Inventory";
import type { InventorySlotPayload } from "../../server/lib/market/serialization";
import { trpc } from "../../utils/trpc";

const Market: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const inventoryQuery = trpc.market.inventory.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const balanceQuery = trpc.market.balance.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const discoveredItemTypesQuery = trpc.market.discoveredItemTypes.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    }
  );

  const sellItemMutation = trpc.market.sellItem.useMutation();
  const depositDiamondsMutation = trpc.market.depositDiamonds.useMutation();

  const [sellItemModalOpened, setItemModalOpened] = useState(false);

  const [price, setPrice] = useState(1);
  const [item, setItem] = useState<InventorySlotPayload>(null);

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  const handleItemClick = async (item: InventorySlotPayload) => {
    if (item) {
      setItem(item);
      setItemModalOpened(true);
    }
  };

  const handleItemSell = async () => {
    try {
      if (item) {
        await sellItemMutation.mutateAsync({
          index: item.index,
          price,
        });

        setItem(null);
        setItemModalOpened(false);

        showNotification({
          message: "Item sold",
        });

        inventoryQuery.refetch();
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showNotification({
          message: e.message,
          color: "red",
        });
      }
    }
  };

  const handleDeposit = async () => {
    try {
      await depositDiamondsMutation.mutateAsync();

      showNotification({
        message: "Diamonds deposited",
      });
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showNotification({
          message: e.message,
          color: "red",
        });
      }
    }
  };

  return (
    <>
      <Modal
        opened={sellItemModalOpened}
        onClose={() => setItemModalOpened(false)}
        title="Sell item"
      >
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <button onClick={handleItemSell}>Sell</button>
        </div>
      </Modal>

      <button onClick={handleDeposit}>Deposit diamonds</button>

      <h1 className="mb-4 text-4xl font-bold">Market</h1>

      <h2 className="mb-4 text-2xl font-bold">Inventory</h2>

      <h3 className="mb-4 text-2xl font-bold">
        you have {balanceQuery.data ?? "LOADINGGGGG"} diamonds
      </h3>

      <p className="mb-4">
        This is your current inventory (or an error message if you&apos;re not
        online), click items to publish them.{" "}
        <span className="text-red-500">
          warning: you probably don&apos;t want to do that, the market is a work
          in progress and you may lose your items
        </span>
      </p>

      {inventoryQuery.isLoading && <div>Loading...</div>}

      {inventoryQuery.isError && <div>Error</div>}

      {inventoryQuery.data && (
        <Inventory inventory={inventoryQuery.data} onClick={handleItemClick} />
      )}

      <h2 className="mb-4 text-2xl font-bold">Discovered Items</h2>

      <p className="mb-4">
        These are the items the market has &quot;discovered&quot;. Items are
        discovered from the first time a unique item is published.
      </p>

      {discoveredItemTypesQuery.isLoading && <div>Loading...</div>}
      {discoveredItemTypesQuery.isError && <div>Error</div>}
      {discoveredItemTypesQuery.data && (
        <List>
          {discoveredItemTypesQuery.data.map((item, id) => (
            <List.Item
              icon={
                item.image ? (
                  <div className="flex flex-row">
                    <img src={item.image} alt={item.name} />
                    <span className="ml-2 ">{item.sellers.length} sellers</span>
                  </div>
                ) : (
                  <DocumentIcon />
                )
              }
              key={id}
            >
              <Link href={`/market/${item.id}`} className="hover:underline">
                {item.name}
              </Link>
            </List.Item>
          ))}
        </List>
      )}
    </>
  );
};

export default Market;
