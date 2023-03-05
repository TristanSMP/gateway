/* eslint-disable @next/next/no-img-element */
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import * as Mui from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
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
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="h3" component="h3">
              You have {balanceQuery.data?.balance ?? "Loading..."} diamonds,
            </Mui.Typography>
            <Mui.Typography variant="h4" component="h3">
              and {balanceQuery.data?.itemsInTransit ?? "Loading..."} items in
              transit.
            </Mui.Typography>

            {balanceQuery.data?.itemsInTransit ? (
              balanceQuery.data.itemsInTransit > 0
            ) : false ? (
              <Mui.Typography variant="body1" component="p">
                Use <pre className="inline">/deliver</pre> in-game to receive
                your items.
              </Mui.Typography>
            ) : null}
          </Mui.Grid>

          <Mui.Grid item xs={12}>
            <Mui.Typography variant="h2" component="h2">
              Discovered Items
            </Mui.Typography>
          </Mui.Grid>
          <Mui.Grid item xs={12}>
            <Mui.Typography variant="body1" component="p">
              These are the items the market has &quot;discovered&quot;. Items
              are discovered from the first time a unique item is put for sale.
              You can sell items by using{" "}
              <pre className="inline">/package &lt;amount&gt;</pre> in-game
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
                            {item.amount > 1 ? `${item.amount} x ` : ""}{" "}
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
