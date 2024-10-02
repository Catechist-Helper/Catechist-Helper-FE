function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

export const PATH_ROOT_HOME = "/";
const ROOTS_AUTH = '/auth';

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
};
