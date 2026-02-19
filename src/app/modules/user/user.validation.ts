import z from "zod";
import { Gender, Role } from "../../../generated/prisma/enums";

export const registerDoctorZodSchema = z.object({
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters"),

  doctor: z.object({
    name: z
      .string("Doctor name is required")
      .min(2, "Name must be at least 2 characters"),

    email: z.email("Invalid email address"),

    profilePhoto: z.url("Profile photo must be a valid URL").optional(),

    contactNumber: z.string().optional(),

    address: z.string().optional(),

    registrationNumber: z
      .string("Registration number is required")
      .min(5, "Invalid registration number"),

    experience: z
      .number()
      .min(0, "Experience cannot be negative")
      .max(60, "Experience seems invalid")
      .optional(),

    gender: z.enum(
      [Gender.Male, Gender.Female],
      "Gender must be either Male or Female",
    ),

    appointmentFee: z
      .number("Appointment fee is required")
      .min(0, "Appointment fee cannot be negative"),

    qualification: z
      .string("Qualification is required")
      .min(2, "Qualification is too short"),

    currentWorkingPlace: z
      .string("Current working place is required")
      .min(2, "Working place is too short"),

    designation: z
      .string("Designation is required")
      .min(2, "Designation is too short"),
  }),

  specialties: z
    .array(z.uuid("Specialty must be a valid UUID"))
    .min(1, "At least one specialty is required"),
});

export const registerAdminZodSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
  admin: z.object({
    name: z
      .string("Name is required and must be string")
      .min(5, "Name must be at least 5 characters")
      .max(30, "Name must be at most 30 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 11 characters")
      .max(14, "Contact number must be at most 15 characters")
      .optional(),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
  }),
  role: z.enum(
    [Role.SUPER_ADMIN, Role.ADMIN],
    "Role must be either ADMIN or SUPER_ADMIN",
  ),
});
