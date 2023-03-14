/* eslint-disable @next/next/no-img-element */
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import * as Mui from "@mui/material";
import { AuctionStatus } from "@prisma/client";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useEffect, useState } from "react";
import Diamond from "../../../public/assets/images/minecraft/diamond.png";
import MarketPlayerCard from "../../components/market/MarketPlayerCard";
import TransitStatus from "../../components/market/TransitStatus";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../../server/db/client";
import type { DiscoveredItemPayload } from "../../server/lib/market/serialization";
import type { ITSMPLocalUser } from "../../server/trpc/router/auth";
import { createLocalUserModel } from "../../server/trpc/router/auth";
import type { IPlayerBalance } from "../../server/trpc/router/market";
import { trpc } from "../../utils/trpc";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    include: {
      application: true,
      accounts: true,
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const tsmpu = await createLocalUserModel(user);

  const itemsInTransit = await prisma.auctionedItem.count({
    where: {
      buyer: {
        id: user.id,
      },
      status: AuctionStatus.IN_TRANSIT,
    },
  });

  const balance = {
    balance: user.balance,
    itemsInTransit,
  } satisfies IPlayerBalance;

  return {
    props: {
      initialUser: tsmpu,
      initialBalance: balance,
    },
  };
};

const NewMarket: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ initialUser, initialBalance }) => {
  const [balance, setBalance] = useState<IPlayerBalance>(initialBalance);

  const balanceQuery = trpc.market.balance.useQuery(undefined, {
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (balanceQuery.data) {
      setBalance(balanceQuery.data);
    }
  }, [balanceQuery.data]);

  const discoveredItemTypesQuery = trpc.market.discoveredItemTypes.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    }
  );

  const [localUser, setLocalUser] = useState<ITSMPLocalUser>(initialUser);

  const localUserQuery = trpc.auth.getLocalUser.useQuery();

  useEffect(() => {
    if (localUserQuery.data) {
      setLocalUser(localUserQuery.data);
    }
  }, [localUserQuery.data]);

  const [filteredItems, setFilteredItems] = useState<DiscoveredItemPayload[]>(
    []
  );
  const [showItemsWithoutStock, setShowItemsWithoutStock] = useState(false);

  useEffect(() => {
    if (discoveredItemTypesQuery.data) {
      setFilteredItems(
        discoveredItemTypesQuery.data.filter((item) => {
          if (showItemsWithoutStock) {
            return true;
          }

          return item.sellers.length > 0;
        })
      );
    }
  }, [discoveredItemTypesQuery.data, showItemsWithoutStock]);

  return (
    <>
      <NextSeo
        title="TSMP: Market (beta)"
        description="Sell & Buy in-game items for in-game diamonds. (Beta frontend for the market)"
      />
      <Mui.Container>
        <Mui.Grid container spacing={3}>
          <MarketPlayerCard player={localUser} balance={balance} />
          <TransitStatus balance={balance} />
          <Mui.Grid item xs={12}>
            <h2 className="text-4xl font-semibold">Discovered Items</h2>
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="body1" component="p">
              These are the items the market has &quot;discovered&quot;. Items
              are discovered from the first time a unique item is put for sale.
              <br />
              You can sell items by using{" "}
              <code className="inline">/package &lt;amount&gt;</code> in-game
              while holding an item.
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
                    {filteredItems.map((item, id) => (
                      <Mui.TableRow key={id}>
                        <Mui.TableCell component="th" scope="row">
                          <Mui.Badge
                            badgeContent={
                              item.amount > 1 ? item.amount : undefined
                            }
                            color="primary"
                            sx={{ mr: 4 }}
                          >
                            <Mui.Icon className="mr-2">
                              {item.image ? (
                                <img src={item.image} alt={item.name} />
                              ) : (
                                <QuestionMarkCircleIcon />
                              )}
                            </Mui.Icon>{" "}
                          </Mui.Badge>

                          <Mui.Link href={`/market/${item.id}`}>
                            {item.name}
                          </Mui.Link>
                        </Mui.TableCell>

                        <Mui.TableCell align="right">
                          {item.cheapest?.price ? (
                            <div className="flex flex-row items-center justify-end text-lg">
                              <div className="mx-0.5">
                                <Image
                                  src={Diamond}
                                  alt={"diamonds"}
                                  className="h-[1.125rem] w-[1.125rem]"
                                />
                              </div>
                              {item.cheapest.price}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </Mui.TableCell>

                        <Mui.TableCell align="right">
                          {item.sellers.length}
                        </Mui.TableCell>
                      </Mui.TableRow>
                    ))}
                    <Mui.TableRow>
                      <Mui.TableCell component="th" scope="row">
                        <Mui.Button
                          style={{ textTransform: "none" }}
                          onClick={() =>
                            setShowItemsWithoutStock(!showItemsWithoutStock)
                          }
                        >
                          {showItemsWithoutStock ? "Hide" : "Show"} items with
                          no stock
                        </Mui.Button>
                      </Mui.TableCell>
                      {/* Empty table cells so the underlines can render */}
                      <Mui.TableCell />
                      <Mui.TableCell />
                    </Mui.TableRow>
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

export default NewMarket;
