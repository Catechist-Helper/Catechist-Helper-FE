function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

export const PATH_ROOT_HOME = "/";
const PATH_ROOT_ADMIN = "/admin";
const ROOTS_AUTH = '/auth';

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
};

export const PATH_ADMIN = {
  root: PATH_ROOT_ADMIN,
          // Thuan
  registration: path(PATH_ROOT_ADMIN, '/registration'),
          //----------

          // Chị Tâm
  post: path(PATH_ROOT_ADMIN, '/post'),
  create_post: path(PATH_ROOT_ADMIN, '/create-post'),
  post_category: path(PATH_ROOT_ADMIN, '/post-category'),
  create_post_category: path(PATH_ROOT_ADMIN, '/create-post-category'),
  update_post_category: path(PATH_ROOT_ADMIN, '/update-post-category/:id'),
  update_post: path(PATH_ROOT_ADMIN, '/update-post/:id'),
  post_detail: path(PATH_ROOT_ADMIN, '/post-detail/:id'),
  registration: path(PATH_ROOT_ADMIN,'/register-form'),
  //---------------------
};
