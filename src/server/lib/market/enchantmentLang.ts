export const EnchantmentLookup = {
  DIG_SPEED: "Efficiency",
  DAMAGE_ALL: "Sharpness",
  DAMAGE_ARTHROPODS: "Bane of Arthropods",
  DAMAGE_UNDEAD: "Smite",
  DURABILITY: "Unbreaking",
  FIRE_ASPECT: "Fire Aspect",
  KNOCKBACK: "Knockback",
  LOOT_BONUS_BLOCKS: "Fortune",
  LOOT_BONUS_MOBS: "Looting",
  OXYGEN: "Respiration",
  PROTECTION_ENVIRONMENTAL: "Protection",
  PROTECTION_EXPLOSIONS: "Blast Protection",
  PROTECTION_FALL: "Feather Falling",
  PROTECTION_FIRE: "Fire Protection",
  PROTECTION_PROJECTILE: "Projectile Protection",
  SILK_TOUCH: "Silk Touch",
  THORNS: "Thorns",
  WATER_WORKER: "Aqua Affinity",
  ARROW_DAMAGE: "Power",
  ARROW_FIRE: "Flame",
  ARROW_INFINITE: "Infinity",
  ARROW_KNOCKBACK: "Punch",
  LUCK: "Luck of the Sea",
  LURE: "Lure",
  MENDING: "Mending",
  BINDING_CURSE: "Curse of Binding",
  VANISHING_CURSE: "Curse of Vanishing",
  SWEEPING_EDGE: "Sweeping Edge",
};

export function formatEnchantmentName(enchantment: string): string {
  if (enchantment in EnchantmentLookup) {
    return EnchantmentLookup[enchantment as keyof typeof EnchantmentLookup];
  } else {
    return enchantment
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  }
}

/**
 * @author http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 */
export function formatEnchantmentLevel(level: number): string {
  const digits = String(+level).split("");

  const key = [
    "",
    "C",
    "CC",
    "CCC",
    "CD",
    "D",
    "DC",
    "DCC",
    "DCCC",
    "CM",
    "",
    "X",
    "XX",
    "XXX",
    "XL",
    "L",
    "LX",
    "LXX",
    "LXXX",
    "XC",
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
  ];

  let roman = "";
  let i = 3;

  while (i--) {
    roman = (key[+(digits.pop() || 0) + i * 10] || "") + roman;
  }

  return Array(+digits.join("") + 1).join("M") + roman;
}
