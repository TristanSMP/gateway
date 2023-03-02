import { showNotification } from "@mantine/notifications";
import { TRPCClientError } from "@trpc/client";

/**
 * **w**rap **e**rror
 * literally runs something, checks if a TRPCClientError was thrown and if so, shows a notification
 */
export async function we(something: () => Promise<unknown> | unknown) {
  try {
    await something();
  } catch (error) {
    if (error instanceof TRPCClientError) {
      showNotification({
        message: error.message,
        color: "red",
      });
    }

    throw error;
  }
}
