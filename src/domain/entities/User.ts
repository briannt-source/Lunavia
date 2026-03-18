export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  accountStatus: string;
  verificationStatus: string;
}
