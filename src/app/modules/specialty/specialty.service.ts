import { specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getSpecialty = async (): Promise<specialty[]> => {
  const specialties = await prisma.specialty.findMany();

  return specialties;
};

const createSpecialty = async (payload: specialty): Promise<specialty> => {
  const specialty = await prisma.specialty.create({
    data: payload,
  });

  return specialty;
};

const updateSpecialty = async (
  id: string,
  payload: specialty,
): Promise<specialty> => {
  const specialty = await prisma.specialty.update({
    where: { id },
    data: payload,
  });

  return specialty;
};

const deleteSpecialty = async (id: string): Promise<specialty> => {
  const specialty = await prisma.specialty.delete({
    where: { id },
  });

  return specialty;
};

export const specialtyService = {
  getSpecialty,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
