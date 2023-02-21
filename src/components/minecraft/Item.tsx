/* eslint-disable @next/next/no-img-element */ // using b64 images
import { Tooltip } from "@mantine/core";
import type {
  InventorySlotPayload,
  PartialItemPayload,
} from "../../server/lib/market/serialization";

const Item: React.FC<{
  item: PartialItemPayload | InventorySlotPayload | null;
  onClick?: () => void;
  className?: string;
}> = ({ item, onClick, className }) => {
  return (
    <div className={className}>
      <Tooltip
        label={
          item?.name
            ? `${item.name} ${"amount" in item ? `(x${item.amount})` : ""}`
            : undefined
        }
      >
        <div onClick={onClick} className="cursor-pointer">
          {item ? (
            <img
              className="h-10 w-10 border"
              src={item.image}
              alt={item.name}
            />
          ) : (
            <div className="h-10 w-10 border" />
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default Item;
