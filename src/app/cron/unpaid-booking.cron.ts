/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from "node-cron";
import { AppointmentService } from "../modules/appointment/appointment.service";

const unpaidBookingCleanupCron = cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointments...");
    await AppointmentService.cancelUnpaidAppointments();
  } catch (error: any) {
    console.error(
      "Error occurred while canceling unpaid appointments:",
      error.message,
    );
  }
});

export default unpaidBookingCleanupCron;
