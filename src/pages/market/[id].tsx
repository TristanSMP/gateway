/* eslint-disable @next/next/no-img-element */
import { showNotification } from "@mantine/notifications";
import * as Mui from "@mui/material";
import { TRPCClientError } from "@trpc/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "../../utils/trpc";

const MarketItem: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const router = useRouter();

  const itemQuery = trpc.market.getItemType.useQuery(
    { id: router.query.id as string },
    {}
  );

  useEffect(() => {
    itemQuery.refetch();
  }, [router.query.id]);

  const buyItemMutation = trpc.market.buyItem.useMutation();

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  const buyItem = async (id: string) => {
    try {
      await buyItemMutation.mutateAsync({ id });
      showNotification({
        message: "Item bought!",
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

  return itemQuery.data ? (
    <Mui.Container>
      <Mui.Grid container spacing={3}>
        <Mui.Grid item xs={12} md={6}>
          <Mui.Card>
            <Mui.CardMedia
              component="img"
              image={itemQuery.data.image}
              title={itemQuery.data.name}
              sx={{
                imageRendering: "pixelated",
              }}
            />
          </Mui.Card>
        </Mui.Grid>
        <Mui.Grid item xs={12} md={6}>
          <Mui.Badge
            badgeContent="Cheapest"
            color="primary"
            className="md:w-full"
          >
            <Mui.Card sx={{ width: "100%" }}>
              <Mui.CardContent>
                <Mui.Typography variant="h4" component="h1">
                  {itemQuery.data.amount > 1
                    ? `${itemQuery.data.amount} x `
                    : ""}{" "}
                  {itemQuery.data.name}
                </Mui.Typography>

                {itemQuery.data.enchantments.length > 0 && (
                  <Mui.Card elevation={2} sx={{ p: 2 }}>
                    {itemQuery.data.enchantments.map((enchantment) => (
                      <Mui.Chip label={enchantment} key={enchantment} />
                    ))}
                  </Mui.Card>
                )}

                <Mui.Typography variant="h5" component="h2">
                  {itemQuery.data.cheapest
                    ? `${itemQuery.data.cheapest.price} diamonds`
                    : "No sellers!"}
                </Mui.Typography>
                <Mui.Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!itemQuery.data.cheapest)
                      return showNotification({
                        message: "No sellers!",
                        color: "red",
                      });
                    buyItem(itemQuery.data.cheapest.id);
                  }}
                  disabled={!itemQuery.data.cheapest}
                >
                  {itemQuery.data.cheapest ? (
                    <>
                      Buy from cheapest seller ({itemQuery.data.cheapest.name})
                    </>
                  ) : (
                    <>No sellers!</>
                  )}
                </Mui.Button>
              </Mui.CardContent>
            </Mui.Card>
          </Mui.Badge>
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.Card>
            <Mui.CardContent>
              <Mui.Typography variant="h5" component="h3">
                Other sellers
              </Mui.Typography>
              <Mui.TableContainer>
                <Mui.Table>
                  <Mui.TableHead>
                    <Mui.TableRow>
                      <Mui.TableCell>Seller</Mui.TableCell>
                      <Mui.TableCell>Price</Mui.TableCell>
                      <Mui.TableCell></Mui.TableCell>
                    </Mui.TableRow>
                  </Mui.TableHead>
                  <Mui.TableBody>
                    {itemQuery.data.sellers.map((seller) => (
                      <Mui.TableRow key={seller.id}>
                        <Mui.TableCell>{seller.name}</Mui.TableCell>
                        <Mui.TableCell>{seller.price} diamonds</Mui.TableCell>
                        <Mui.TableCell>
                          <Mui.Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              buyItem(seller.id);
                            }}
                          >
                            Buy
                          </Mui.Button>
                        </Mui.TableCell>
                      </Mui.TableRow>
                    ))}
                  </Mui.TableBody>
                </Mui.Table>
              </Mui.TableContainer>
            </Mui.CardContent>
          </Mui.Card>
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Container>
  ) : (
    <Mui.Container>
      <Mui.Grid container spacing={3}>
        <Mui.Grid item xs={12}>
          <Mui.Card>
            <Mui.CardContent>
              <Mui.Typography variant="h5" component="h3">
                Loading...
              </Mui.Typography>
            </Mui.CardContent>
          </Mui.Card>
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Container>
  );
};

export default MarketItem;
