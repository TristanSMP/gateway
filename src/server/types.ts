export interface Item {
  name: string;
  amount: number;
  image: string | undefined;
  type: string;

  /**
   * The inventory index of the un-abstracted item
   */
  index: number;
}

export interface Inventory {
  hotBar: (Item | null)[];
  inventory: (Item | null)[];
  armor: (Item | null)[];
  offHand: (Item | null)[];
}
