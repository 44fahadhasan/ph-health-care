import unpaidBookingCleanupCron from "./unpaid-booking.cron";

const cronJobs = () => {
  unpaidBookingCleanupCron.start();
};

export default cronJobs;
