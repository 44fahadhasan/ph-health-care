export interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  newPassword: string;
  currentPassword: string;
}
