export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};