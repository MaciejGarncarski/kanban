// Root
const authRoot = 'auth';
const usersRoot = 'users';

// Api Versions
const v1 = 'v1';
const prefix = `/${v1}/`;

export const routesV1 = {
  version: v1,
  auth: {
    root: `${prefix}${authRoot}`,
    signIn: `${prefix}${authRoot}/sign-in`,
    register: `${prefix}${authRoot}/register`,
    me: `${prefix}${authRoot}/me`,
    refresh: `${prefix}${authRoot}/refresh-token`,
    logout: `${prefix}${authRoot}/logout`,
  },
  teams: {
    root: `${prefix}teams`,
    createTeam: `${prefix}teams`,
  },
  user: {
    root: usersRoot,
    getUserById: `${prefix}${usersRoot}/:id`,
  },
  board: {
    getBoardsByTeamId: `${prefix}teams/:teamId/boards`,
    getBoardById: `${prefix}boards/:id`,
    createBoard: `${prefix}boards`,
    updateBoard: `${prefix}boards/:id`,
    deleteBoard: `${prefix}boards/:id`,
  },
};
