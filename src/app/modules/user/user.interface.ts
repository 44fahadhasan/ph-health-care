import { Gender } from "../../../generated/prisma/enums";

export interface IRegisterDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
  };
  specialties: string[];
}

export interface IRegisterAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
  };
  role: "ADMIN" | "SUPER_ADMIN";
}
