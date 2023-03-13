/* eslint-disable @next/next/no-img-element */
import { showNotification } from "@mantine/notifications";
import * as Mui from "@mui/material";
import { TRPCClientError } from "@trpc/client";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { DiscoveredItemPayload } from "../../server/lib/market/serialization";
import { MarketSerializer } from "../../server/lib/market/serialization";
import { MarketUtils } from "../../server/lib/market/utils";
import { trpc } from "../../utils/trpc";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const itemType = await MarketUtils.items.getItemType(
    z.string().parse(ctx.params?.id)
  );

  if (!itemType) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialItem: MarketSerializer.serializeDiscoveredItem(itemType),
    },
  };
};

const MarketItem: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ initialItem }) => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const router = useRouter();

  const [item, setItem] = useState<DiscoveredItemPayload>(initialItem);

  const itemQuery = trpc.market.getItemType.useQuery(
    { id: router.query.id as string },
    {}
  );

  useEffect(() => {
    itemQuery.refetch();
  }, [router.query.id]);

  useEffect(() => {
    if (itemQuery.data) {
      setItem(itemQuery.data);
    }
  }, [itemQuery.data]);

  const buyItemMutation = trpc.market.buyItem.useMutation();

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

  return (
    <>
      <NextSeo
        title={`TSMP Market - ${item.name}`}
        description={[
          item.cheapest
            ? `Cheapest seller: ${item.cheapest.name} for ${item.cheapest.price} diamonds`
            : "No sellers!",
          item.lore.length > 0 ? `Lore: ${item.lore.join(", ")}` : undefined,
          item.enchantments.length > 0
            ? `Enchantments: ${item.enchantments.join(", ")}`
            : undefined,
        ]
          .filter((e) => e)
          .join(" | ")}
      />
      <Mui.Container>
        <Mui.Grid container spacing={3}>
          <Mui.Grid item xs={12} md={6}>
            <Mui.Card>
              <Mui.CardMedia
                component="img"
                image={item.image}
                title={item.name}
                sx={{
                  imageRendering: "pixelated",
                }}
              />
            </Mui.Card>
            {item.lore.length > 0 && (
              <Mui.Card elevation={2} sx={{ p: 2 }}>
                {item.lore.map((lore) => (
                  <Mui.Chip label={lore} key={lore} />
                ))}
              </Mui.Card>
            )}
          </Mui.Grid>
          <Mui.Grid item xs={12} md={6}>
            <Mui.Badge
              badgeContent="Cheapest"
              color="success"
              className="md:w-full"
            >
              <Mui.Card sx={{ width: "100%" }}>
                <Mui.CardContent>
                  {item.cheapest ? (
                    <>
                      <Mui.Badge
                        badgeContent={item.amount > 1 ? item.amount : undefined}
                        color="secondary"
                        sx={{ mr: 4 }}
                      >
                        <Mui.Typography variant="h3" component="h3">
                          {item.name}
                        </Mui.Typography>
                      </Mui.Badge>

                      <Mui.Typography variant="caption" component="h5">
                        {item.cheapest.name}
                      </Mui.Typography>

                      {item.enchantments.length > 0 && (
                        <Mui.Card elevation={2} sx={{ p: 2 }}>
                          {item.enchantments.map((enchantment) => (
                            <Mui.Chip label={enchantment} key={enchantment} />
                          ))}
                        </Mui.Card>
                      )}

                      <Mui.Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!item.cheapest)
                            return showNotification({
                              message: "No sellers!",
                              color: "red",
                            });
                          buyItem(item.cheapest.id);
                        }}
                        disabled={!item.cheapest}
                      >
                        Buy for {item.cheapest.price} diamonds
                      </Mui.Button>
                    </>
                  ) : (
                    <Mui.Typography variant="h3" component="h3">
                      No sellers!
                    </Mui.Typography>
                  )}
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
                      {item.sellers.map((seller) => (
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
    </>
  );
};

export default MarketItem;
