import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateDoctorZodSchema = z
  .object({
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
  })
  .partial();
