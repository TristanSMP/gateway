import type { IPlayerBalance } from "../../server/trpc/router/market";

const TransitStatus: React.FC<{
  balance: IPlayerBalance;
}> = ({ balance }) => {
  return (
    <>
      {balance.itemsInTransit > 0 ? (
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
                You have items in transit. Use <code>/deliver</code> in-game to
                deliver your items!
              </span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {(balance.balance || 0) > 1 && (
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
    </>
  );
};

export default TransitStatus;
