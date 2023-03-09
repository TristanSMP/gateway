import { CheckIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import * as Mui from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { IAdminDashboardUser } from "../server/trpc/router/admin";
import { we } from "../utils/mutationWrapper";
import { trpc } from "../utils/trpc";

const Admin: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const deployBotMutation = trpc.discord.deployBotCommands.useMutation();
  const users = trpc.admin.getEveryUser.useQuery();
  const syncUserMutation = trpc.admin.reSyncUser.useMutation();

  const [sortedUsers, setSortedUsers] = useState<IAdminDashboardUser[]>([]);
  const [onlyMembers, setOnlyMembers] = useState<boolean>(false);
  const [onlyLinkedMinecraft, setOnlyLinkedMinecraft] =
    useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [syncUserJsonModalOpened, setSyncUserJsonModalOpened] =
    useState<boolean>(false);
  const [syncUserJson, setSyncUserJson] = useState<string>("");

  useEffect(() => {
    if (users.data) {
      let sortedUsers = users.data;

      if (onlyMembers) {
        sortedUsers = sortedUsers.filter((user) => user.isMember);
      }

      if (onlyLinkedMinecraft) {
        sortedUsers = sortedUsers.filter((user) => user.minecraft);
      }

      if (search !== "") {
        sortedUsers = sortedUsers.filter((user) => {
          const userString = JSON.stringify(user).toLowerCase(); // 🤓
          return userString.includes(search.toLowerCase());
        });
      }

      setSortedUsers(sortedUsers);
    }
  }, [users.data, onlyMembers, onlyLinkedMinecraft, search]);

  async function handleRefreshUser(user: IAdminDashboardUser) {
    setSyncUserJsonModalOpened(true);
    setSyncUserJson("loading...");

    const data = await syncUserMutation.mutateAsync({
      id: user.id,
    });

    setSyncUserJson(JSON.stringify(data, null, 2));
  }

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  return (
    <Mui.Container>
      <Mui.Dialog open={syncUserJsonModalOpened}>
        <Mui.DialogTitle>Sync User JSON</Mui.DialogTitle>
        <Mui.DialogContent>
          <pre>{syncUserJson}</pre>
        </Mui.DialogContent>
        <Mui.DialogActions>
          <Mui.Button
            onClick={() => {
              setSyncUserJsonModalOpened(false);
            }}
          >
            Close
          </Mui.Button>
        </Mui.DialogActions>
      </Mui.Dialog>

      <Mui.Grid container spacing={2}>
        <Mui.Grid item xs={12}>
          <Mui.Button
            variant="contained"
            onClick={() => {
              we(deployBotMutation.mutateAsync);
            }}
          >
            Deploy Bot Commands
          </Mui.Button>
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Mui.Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Mui.Chip
                label="Members"
                onClick={() => setOnlyMembers(!onlyMembers)}
                variant={onlyMembers ? "filled" : "outlined"}
                sx={{
                  p: 2,
                }}
              />
              <Mui.Chip
                label="Linked Minecraft"
                onClick={() => setOnlyLinkedMinecraft(!onlyLinkedMinecraft)}
                variant={onlyLinkedMinecraft ? "filled" : "outlined"}
                sx={{
                  p: 2,
                }}
              />
              <Mui.Typography variant="body1" sx={{ p: 2 }}>
                {sortedUsers.length} users
              </Mui.Typography>
            </Mui.Paper>

            <Mui.Paper sx={{ p: 2 }}>
              <Mui.TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Mui.Paper>
          </Mui.Paper>

          <Mui.TableContainer component={Mui.Paper}>
            <Mui.Table aria-label="simple table">
              <Mui.TableHead>
                <Mui.TableRow>
                  <Mui.TableCell>TSMPU Id</Mui.TableCell>
                  <Mui.TableCell>TSMPU Name</Mui.TableCell>
                  <Mui.TableCell>Discord</Mui.TableCell>
                  <Mui.TableCell>Minecraft</Mui.TableCell>
                  <Mui.TableCell>Alts</Mui.TableCell>
                  <Mui.TableCell>Supporter Expires</Mui.TableCell>
                  <Mui.TableCell>Member</Mui.TableCell>
                </Mui.TableRow>
              </Mui.TableHead>
              <Mui.TableBody>
                {sortedUsers.map((user) => (
                  <Mui.TableRow key={user.id}>
                    <Mui.TableCell component="th" scope="row">
                      {user.id}
                    </Mui.TableCell>
                    <Mui.TableCell>{user.name}</Mui.TableCell>
                    <Mui.TableCell>{user.discordId}</Mui.TableCell>
                    <Mui.TableCell>
                      <Mui.Tooltip title={user.minecraft?.uuid}>
                        <Mui.Typography>
                          {user.minecraft?.username}
                        </Mui.Typography>
                      </Mui.Tooltip>
                    </Mui.TableCell>
                    <Mui.TableCell>
                      {user.minecraft?.alts.map((alt) => (
                        <Mui.Tooltip title={alt.uuid} key={alt.uuid}>
                          <Mui.Typography>{alt.username}</Mui.Typography>
                        </Mui.Tooltip>
                      ))}
                    </Mui.TableCell>
                    <Mui.TableCell>
                      {user.supporterUntil ? (
                        <Mui.Tooltip
                          title={new Date(user.supporterUntil).toLocaleString()}
                        >
                          <Mui.Typography>
                            {Math.ceil(
                              (new Date(user.supporterUntil).getTime() -
                                new Date().getTime()) /
                                (1000 * 3600 * 24)
                            )}{" "}
                            days
                          </Mui.Typography>
                        </Mui.Tooltip>
                      ) : (
                        "N/A"
                      )}
                    </Mui.TableCell>
                    <Mui.TableCell>
                      <button onClick={() => handleRefreshUser(user)}>
                        {user.isMember ? (
                          <CheckIcon width={25} />
                        ) : (
                          <NoSymbolIcon width={25} />
                        )}
                      </button>
                    </Mui.TableCell>
                  </Mui.TableRow>
                ))}
              </Mui.TableBody>
            </Mui.Table>
          </Mui.TableContainer>
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Container>
  );
};

export default Admin;
