export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  };
};

export type AuthUser =
  | {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    role?: string[];
    [key: string]: any;
  }
  | null
  | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
};

export type JWTContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
  method: 'jwt';
  login: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  register: (email: string, password: string, name: string, phoneNumber: string, role: string
    // , address: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => void;
  updateProfile: VoidFunction;
  changeUser?: (user: AuthUser) => void;
};
