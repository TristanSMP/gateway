import * as Mui from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { we } from "../utils/mutationWrapper";
import { trpc } from "../utils/trpc";

const Admin: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const deployBotMutation = trpc.discord.deployBotCommands.useMutation();
  const users = trpc.admin.getEveryUser.useQuery();

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  return (
    <Mui.Container>
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
          <Mui.TableContainer component={Mui.Paper}>
            {/* sortable table */}
            <Mui.Table aria-label="simple table">
              <Mui.TableHead>
                <Mui.TableRow>
                  <Mui.TableCell>TSMPU Id</Mui.TableCell>
                  <Mui.TableCell>TSMPU Name</Mui.TableCell>
                  <Mui.TableCell>Discord</Mui.TableCell>
                  <Mui.TableCell>Minecraft</Mui.TableCell>
                  <Mui.TableCell>Alts</Mui.TableCell>
                  <Mui.TableCell>Member</Mui.TableCell>
                </Mui.TableRow>
              </Mui.TableHead>
              <Mui.TableBody>
                {users.data?.map((user) => (
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
                      {user.isMember ? "Yes" : "No"}
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
