/* eslint-disable @next/next/no-img-element */
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import * as Mui from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import Diamond from "../../../public/assets/images/minecraft/diamond.png";
import { trpc } from "../../utils/trpc";

const Market: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const balanceQuery = trpc.market.balance.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const discoveredItemTypesQuery = trpc.market.discoveredItemTypes.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    }
  );

  const localUserQuery = trpc.auth.getLocalUser.useQuery();

  const [tableExpanded, setTableExpanded] = useState(false);

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  return (
    <>
      <Mui.Container>
        <Mui.Grid container spacing={3}>
          <div></div>
          <div className="ml-6 mt-16 rounded-md bg-base-300 shadow-sm">
            <div className="m-6 flex w-96 flex-row items-center gap-6">
              <div>
                <img
                  src={`https://crafatar.com/avatars/${localUserQuery.data?.minecraftUUID}?size=92&overlay`}
                  alt={`${localUserQuery.data?.minecraftName}'s avatar`}
                />
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-semibold">
                  {localUserQuery.data?.minecraftName}
                </div>
                <div className="flex flex-row items-center text-lg">
                  <span className="font-medium">Balance</span>:{" "}
                  <div className="mx-0.5">
                    <Image
                      src={Diamond}
                      alt={"diamonds"}
                      className="h-[1.125rem] w-[1.125rem]"
                    />
                  </div>
                  {balanceQuery.data?.balance}
                </div>
                <div
                  className={`text-lg ${
                    balanceQuery.data?.itemsInTransit &&
                    balanceQuery.data?.itemsInTransit
                      ? "text-info"
                      : ""
                  }`}
                >
                  <span className="font-medium">Items in transit</span>:{" "}
                  {balanceQuery.data?.itemsInTransit}
                </div>
              </div>
            </div>
          </div>
          {balanceQuery.data?.itemsInTransit &&
          balanceQuery.data?.itemsInTransit > 0 ? (
            <div className="mt-16 ml-8 flex items-center justify-center">
              <div className="alert alert-info shadow-lg">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 flex-shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>
                    You have items in transit. Use <code>/deliver</code> in-game
                    to deliver your items!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {(balanceQuery.data?.balance || 0) > 1 && (
                <div className="mt-16 ml-8 flex items-center justify-center">
                  <div className="alert alert-success shadow-lg">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 flex-shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>
                        You have no items in transit. Use <code>/deliver</code>{" "}
                        in-game to withdraw all your diamonds from the market!
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
                    {discoveredItemTypesQuery.data.map((item, id) => (
                      <>
                        {tableExpanded ? (
                          <>
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
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    ))}
                    <Mui.TableRow>
                      <Mui.TableCell component="th" scope="row">
                        <Mui.Button
                          style={{ textTransform: "none" }}
                          onClick={() => setTableExpanded(!tableExpanded)}
                        >
                          {tableExpanded ? "Hide" : "Show"} items with no
                          sellers
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

export default Market;
