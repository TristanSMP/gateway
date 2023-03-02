# TSMP Gateway

###### What is TSMP Gateway?

The TristanSMP gateway is the core of the TristanSMP service network. Using [elytra](https://github.com/EvieLabs/elytra) it interfaces the actual Minecraft server allowing to perform actions on the SMP, such as modifying luckperms groups, verifying ownership of a Minecraft account, and more.

## Features

- Internal Discord bot powered by [Disploy](https://disploy.dev) for basic Discord integration.
- [The website](https://tristansmp.com), as this is a Next.js app, we also built the website inside the gateway.
- Admin API for microservices such as [Natsirt](https://github.com/TristanSMP/Natsirt) to interact with the gateway.
- TSMP User system, allowing users to link their Minecraft account and Discord account to their TSMP account, allowing for effortless moderation and syncing of roles across the Discord and Minecraft server.
- The [TristanSMP market](https://tristansmp.com/market), inspired by the Steam community market, allows users to buy and sell items in-game for diamonds.
