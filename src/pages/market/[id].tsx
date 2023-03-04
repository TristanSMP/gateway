/* eslint-disable @next/next/no-img-element */
import { showNotification } from "@mantine/notifications";
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
    <div>
      <div className="pt-6">
        {/* Image gallery */}
        <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
          <div className="aspect-w-3 aspect-h-4 hidden overflow-hidden rounded-lg lg:block">
            <img
              src={itemQuery.data.image}
              className="h-full w-full object-cover object-center"
              style={{
                imageRendering: "pixelated",
              }}
              alt={itemQuery.data.name}
            />
          </div>
        </div>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-24">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight  sm:text-3xl">
              {itemQuery.data.name}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight">
              {itemQuery.data.cheapest
                ? `${itemQuery.data.cheapest.price} diamonds`
                : "No sellers!"}
            </p>

            <form className="mt-10">
              <button
                type="submit"
                className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault();
                  if (!itemQuery.data.cheapest)
                    return showNotification({
                      message: "No sellers!",
                      color: "red",
                    });
                  buyItem(itemQuery.data.cheapest.id);
                }}
              >
                Buy from cheapest seller ({itemQuery.data.cheapest?.name})
              </button>
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pb-16 lg:pr-8">
            {/* Description and details */}
            <div>
              <h3 className="sr-only">Description</h3>

              <div className="space-y-6">
                <p className="text-base">{itemQuery.data.type}</p>
              </div>
            </div>

            {/* other sellers */}
            <div className="mt-10">
              <h3 className="sr-only">Other sellers</h3>

              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itemQuery.data.sellers.map((seller) => (
                    <tr key={seller.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {seller.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {seller.price} diamonds{" "}
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            buyItem(seller.id);
                          }}
                        >
                          buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <>things are loading</>
  );
};

export default MarketItem;
