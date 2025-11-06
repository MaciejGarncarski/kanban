// Root

// Api Versions
const v1 = 'v1';
const prefix = `/${v1}/`;

export const routesV1 = {
  version: v1,
  healthcheck: {
    root: `${prefix}healthcheck`,
  },
  auth: {
    root: `${prefix}auth`,
    signIn: `${prefix}auth/sign-in`,
    register: `${prefix}auth/register`,
    me: `${prefix}auth/me`,
    refresh: `${prefix}auth/refresh-token`,
    logout: `${prefix}auth/logout`,
  },
  teams: {
    root: `${prefix}teams`,
    createTeam: `${prefix}teams`,
    deleteTeam: `${prefix}teams/:readableTeamId`,
    updateTeam: `${prefix}teams/:readableTeamId`,
  },
  user: {
    root: `${prefix}user`,
    getAllUsers: `${prefix}user/all`,
    getUserById: `${prefix}user/:userId`,
    getRoleByTeamId: `${prefix}user/:readableTeamId/role`,
    getUsersByTeamId: `${prefix}teams/:readableTeamId/users`,
  },
  board: {
    getBoardsByTeamId: `${prefix}teams/:readableTeamId/boards`,
    getBoardById: `${prefix}boards/:readableBoardId`,
    createBoard: `${prefix}boards`,
    updateBoard: `${prefix}boards/:readableBoardId`,
    deleteBoard: `${prefix}boards/:readableBoardId`,
  },
  column: {
    createColumn: `${prefix}columns`,
    updateColumn: `${prefix}columns/:columnId`,
    deleteColumn: `${prefix}columns/:columnId`,
  },
  card: {
    createCard: `${prefix}cards`,
    updateCard: `${prefix}cards/:cardId`,
    deleteCard: `${prefix}cards/:cardId`,
  },
};
