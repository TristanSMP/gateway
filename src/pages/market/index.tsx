/* eslint-disable @next/next/no-img-element */
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { showNotification } from "@mantine/notifications";
import * as Mui from "@mui/material";
import { TRPCClientError } from "@trpc/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
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

  return (
    <>
      <Mui.Dialog
        open={sellItemModalOpened}
        onClose={() => setItemModalOpened(false)}
        aria-labelledby="form-dialog-title"
      >
        <Mui.DialogTitle id="form-dialog-title">Sell item</Mui.DialogTitle>
        <Mui.DialogContent>
          <Mui.DialogContentText>
            Enter the price you want to sell the item for
          </Mui.DialogContentText>
          <Mui.TextField
            autoFocus
            margin="dense"
            id="price"
            label="Price"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </Mui.DialogContent>
        <Mui.DialogActions>
          <Mui.Button onClick={() => setItemModalOpened(false)} color="primary">
            Cancel
          </Mui.Button>
          <Mui.Button onClick={handleItemSell} color="primary">
            Sell
          </Mui.Button>
        </Mui.DialogActions>
      </Mui.Dialog>

      <Mui.Container>
        <Mui.Grid container spacing={3}>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="h3" component="h3">
              you have {balanceQuery.data ?? "Loading..."} diamonds
            </Mui.Typography>
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="body1" component="p">
              This is your current inventory (or an error message if you&apos;re
              not online), click items to publish them.{" "}
              <span className="text-red-500">
                warning: you probably don&apos;t want to do that, the market is
                a work in progress and you may lose your items
              </span>
            </Mui.Typography>
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            {inventoryQuery.isLoading && <div>Loading...</div>}
            {inventoryQuery.isError && <div>Error</div>}
            {inventoryQuery.data && (
              <Inventory
                inventory={inventoryQuery.data}
                onClick={handleItemClick}
              />
            )}
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="h2" component="h2">
              Discovered Items
            </Mui.Typography>
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="body1" component="p">
              These are the items the market has &quot;discovered&quot;. Items
              are discovered from the first time a unique item is published.
            </Mui.Typography>
          </Mui.Grid>

          <Mui.Grid item xs={12}>
            {discoveredItemTypesQuery.isLoading && <div>Loading...</div>}
            {discoveredItemTypesQuery.isError && <div>Error</div>}
            {discoveredItemTypesQuery.data && (
              <Mui.TableContainer component={Mui.Paper}>
                <Mui.Table aria-label="simple table">
                  <Mui.TableHead>
                    <Mui.TableRow>
                      <Mui.TableCell>Item</Mui.TableCell>
                      <Mui.TableCell align="right">
                        Cheapest Price
                      </Mui.TableCell>
                      <Mui.TableCell align="right">Sellers</Mui.TableCell>
                    </Mui.TableRow>
                  </Mui.TableHead>
                  <Mui.TableBody>
                    {discoveredItemTypesQuery.data.map((item, id) => (
                      <Mui.TableRow key={id}>
                        <Mui.TableCell component="th" scope="row">
                          <Mui.Icon className="mr-2">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <QuestionMarkCircleIcon />
                            )}
                          </Mui.Icon>

                          <Mui.Link href={`/market/${item.id}`}>
                            {item.name}
                          </Mui.Link>
                        </Mui.TableCell>

                        <Mui.TableCell align="right">
                          {item.cheapest?.price ?? "N/A"} diamonds
                        </Mui.TableCell>

                        <Mui.TableCell align="right">
                          {item.sellers.length}
                        </Mui.TableCell>
                      </Mui.TableRow>
                    ))}
                  </Mui.TableBody>
                </Mui.Table>
              </Mui.TableContainer>
            )}
          </Mui.Grid>
        </Mui.Grid>
      </Mui.Container>
    </>
  );
};

export default Market;
