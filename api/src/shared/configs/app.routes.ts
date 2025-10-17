// Root
const authRoot = 'auth';
const usersRoot = 'users';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,
  auth: {
    root: authRoot,
    signIn: `/${authRoot}/sign-in`,
    register: `/${authRoot}/register`,
    me: `/${authRoot}/me`,
    refresh: `/${authRoot}/refresh-token`,
    logout: `/${authRoot}/logout`,
  },
  user: {
    root: usersRoot,
    getUserById: `/${usersRoot}/:id`,
  },
};
