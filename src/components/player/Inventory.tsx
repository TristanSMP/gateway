import type {
  InventoryPayload,
  InventorySlotPayload,
} from "../../server/lib/market/serialization";
import Item from "../minecraft/Item";

const Inventory: React.FC<{
  inventory: InventoryPayload;
  onClick?: (item: InventorySlotPayload) => void;
}> = ({ inventory, onClick }) => {
  const handleItemClick = (item: InventorySlotPayload) => {
    onClick?.(item);
  };

  return (
    <div className="flex flex-row gap-1">
      <div className="flex flex-col gap-1">
        <div className="grid w-fit grid-cols-9 grid-rows-3 gap-1">
          {inventory.inventory.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>

        <div className="grid w-fit grid-cols-9 grid-rows-1 gap-1">
          {inventory.hotBar.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid w-fit grid-cols-1 grid-rows-4 gap-1">
          {inventory.armor.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
        <div className="grid w-fit grid-cols-1 grid-rows-1 gap-1">
          {inventory.offHand.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
