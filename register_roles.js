// @ts-check

const {
  ApplicationRoleConnectionMetadataType,
  RouteBases,
  Routes,
} = require("discord-api-types/v10");

/**
 * @type {string}
 */
// @ts-ignore
const ClientId = process.env.DISCORD_CLIENT_ID;
/**
 * @type {string}
 */
// @ts-ignore
const Token = process.env.DISCORD_TOKEN;

/**
 * @type {import("discord-api-types/v10").RESTPutAPIApplicationRoleConnectionMetadataJSONBody}
 */
// @ts-ignore
const RoleMeta = [
  {
    key: "is_member",
    description: "If the user is a member of TSMP",
    name: "Member",
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
  },
];

fetch(
  `${RouteBases.api}${Routes.applicationRoleConnectionMetadata(ClientId)}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${Token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(RoleMeta),
  }
)
  .then((res) => res.json())
  .then(console.log);
