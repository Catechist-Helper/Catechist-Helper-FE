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
  catechist_management: path(PATH_ROOT_ADMIN, '/catechists'),
  admin_registration: path(PATH_ROOT_ADMIN, '/registration'),
  approved_registration: path(PATH_ROOT_ADMIN, '/interview'),
  major_management: path(PATH_ROOT_ADMIN, '/majors'),
  grade_management: path(PATH_ROOT_ADMIN, '/grades'),
  class_management: path(PATH_ROOT_ADMIN, '/classes'),
  assign_catechist_to_grade: path(PATH_ROOT_ADMIN, '/grades/assign-catechists'),
          //----------

          // Chị Tâm
  post: path(PATH_ROOT_ADMIN, '/post'),
  create_post: path(PATH_ROOT_ADMIN, '/create-post'),
  post_category: path(PATH_ROOT_ADMIN, '/post-category'),
  create_post_category: path(PATH_ROOT_ADMIN, '/create-post-category'),
  update_post_category: path(PATH_ROOT_ADMIN, '/update-post-category/:id'),
  update_post: path(PATH_ROOT_ADMIN, '/update-post/:id'),
  post_detail: path(PATH_ROOT_ADMIN, '/post-detail/:id'),
  create_christian_name: path(PATH_ROOT_ADMIN, '/create-christian-name'),
  update_christian_name: path(PATH_ROOT_ADMIN, '/update-christian-name/:id'),
  christian_name: path(PATH_ROOT_ADMIN, '/christian-name'),
  rooms: path(PATH_ROOT_ADMIN, '/rooms'),
  create_room: path(PATH_ROOT_ADMIN, '/create-room'),
  update_room: path(PATH_ROOT_ADMIN, '/update-room/:id'),
  pastoral_years: path(PATH_ROOT_ADMIN, '/pastoral-years'),
  create_pastoral_years: path(PATH_ROOT_ADMIN, '/create-pastoral-years'),
  update_pastoral_years: path(PATH_ROOT_ADMIN, '/update-pastoral-years/:id'),
  system_configurations: path(PATH_ROOT_ADMIN, '/system-configurations'),
  create_system_configurations: path(PATH_ROOT_ADMIN, '/create-system-configurations'),
  update_system_configurations: path(PATH_ROOT_ADMIN, '/update-system-configurations/:id'),
  create_levels: path(PATH_ROOT_ADMIN, '/create-levels'),
  update_levels: path(PATH_ROOT_ADMIN, '/update-levels/:id'),
  levels: path(PATH_ROOT_ADMIN, '/levels'),
  training_lists: path(PATH_ROOT_ADMIN, '/training-lists'),
  create_training_lists: path(PATH_ROOT_ADMIN, '/create-training-lists'),
  update_training_lists: path(PATH_ROOT_ADMIN, '/update-training-lists/:id'),
  //---------------------
};

export const PATH_HOME = {
  root: PATH_ROOT_HOME, 
  news: path(PATH_ROOT_HOME,'news'),
  news_detail: path(PATH_ROOT_HOME,'news-detail/:id'),
  news_detail_page: (id: any) => path(PATH_ROOT_HOME,`news-detail/${id}`),
  registration: path(PATH_ROOT_HOME,'register-form'),
};
