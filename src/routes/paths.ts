function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

export const PATH_ROOT_HOME = "/";
const PATH_ROOT_ADMIN = "/admin";
const ROOTS_AUTH = '/';

export const PATH_AUTH = {
  login: path(ROOTS_AUTH, 'login'),
};

export const PATH_ADMIN = {
  root: PATH_ROOT_ADMIN,
          // Thuan
  admin_registration: path(PATH_ROOT_ADMIN, '/registration'),
  approved_registration: path(PATH_ROOT_ADMIN, '/interview'),
          //----------

          // Chị Tâm
  post: path(PATH_ROOT_ADMIN, '/post'),
  create_post: path(PATH_ROOT_ADMIN, '/create-post'),
  post_category: path(PATH_ROOT_ADMIN, '/post-category'),
  create_post_category: path(PATH_ROOT_ADMIN, '/create-post-category'),
  update_post_category: path(PATH_ROOT_ADMIN, '/update-post-category/:id'),
  update_post: path(PATH_ROOT_ADMIN, '/update-post/:id'),
  post_detail: path(PATH_ROOT_ADMIN, '/post-detail/:id'),
  //---------------------
};

export const PATH_HOME = {
  root: PATH_ROOT_HOME, 
  news: path(PATH_ROOT_HOME,'news'),
  news_detail: path(PATH_ROOT_HOME,'news-detail/:id'),
  news_detail_page: (id: any) => path(PATH_ROOT_HOME,`news-detail/${id}`),
  registration: path(PATH_ROOT_HOME,'register-form'),
};
