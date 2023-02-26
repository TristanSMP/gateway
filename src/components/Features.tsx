import {
  GlobeAsiaAustraliaIcon,
  UserGroupIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Lifelong world",
    description:
      "Our world is lifelong, with no server resets, and we change the spawn location with each major Minecraft update. We use advanced anti-cheat measures and packet-level anti-x-ray to ensure a fair gameplay experience.",
    icon: GlobeAsiaAustraliaIcon,
  },
  {
    name: "Community",
    description:
      "Our community is friendly and welcoming, and we offer an active Discord community with a modern invite-only system that allows unaccepted players to explore the world. PvP is disabled, and we focus on building, working together, and having fun as a community, without relying on pay-to-win practices.",
    icon: UserGroupIcon,
  },
  {
    name: "Vane",
    description:
      "We also have Vane, a plugin suite that adds many exciting and lore-friendly features to the vanilla Minecraft experience, as well as vanilla-friendly enchantments and cosmetic benefits sourced through our community.",
    icon: WrenchIcon,
  },
];

export default function Features() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="sm:text-center">
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Friendly invite-only and immersive semi-vanilla Minecraft SMP.
          </p>
        </div>

        <div className="mt-20 max-w-lg sm:mx-auto md:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary sm:shrink-0">
                  <feature.icon
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8">
                    {feature.name}
                  </p>
                  <p className="mt-2 text-base leading-7">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
