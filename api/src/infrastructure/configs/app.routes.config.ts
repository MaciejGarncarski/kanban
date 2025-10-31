// Root

// Api Versions
const v1 = 'v1';
const prefix = `/${v1}/`;

export const routesV1 = {
  version: v1,
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
  },
  user: {
    root: `${prefix}user`,
    getUserById: `${prefix}user/:userId`,
    getRoleByTeamId: `${prefix}user/:teamId/role`,
    getUsersByBoardId: `${prefix}boards/:boardId/users`,
  },
  board: {
    getBoardsByTeamId: `${prefix}teams/:teamId/boards`,
    getBoardById: `${prefix}boards/:boardId`,
    createBoard: `${prefix}boards`,
    updateBoard: `${prefix}boards/:boardId`,
    deleteBoard: `${prefix}boards/:boardId`,
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
