const cron = require('node-cron');
const SubsidiaryTour = require('../models/SubsidiaryTour');

// Function to hide a single subsidiary tour
const hideTour = async (tourId) => {
  try {
    const result = await SubsidiaryTour.updateOne(
      { 
        _id: tourId,
        hide: false 
      },
      { 
        $set: { hide: true } 
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Tour ${tourId} hidden successfully`);
    } else {
      console.log(`Tour ${tourId} was already hidden or not found`);
    }
  } catch (error) {
    console.error(`Error hiding tour ${tourId}:`, error);
  }
};

// Function to check and hide tours every minute
const checkAndHideTours = async () => {
  try {
    const currentDate = new Date();
    const tours = await SubsidiaryTour.find({ hide: false });

    for (const tour of tours) {
      // Combine dateStart.date and dateStart.time into a full Date object
      const startDate = new Date(tour.dateStart.date);
      const [hours, minutes] = tour.dateStart.time.split(':'); // Assuming time is "HH:MM"
      startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Calculate the time to hide (24 hours before startDate)
      const hideTime = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

      // If current time has reached or passed hideTime, hide the tour
      if (currentDate >= hideTime) {
        await hideTour(tour._id);
      }
    }

    // console.log(`Checked tours at ${currentDate.toISOString()}`);
  } catch (error) {
    console.error('Error in checkAndHideTours:', error);
  }
};

// Schedule the job to run every minute
const scheduledJob = cron.schedule('* * * * *', checkAndHideTours, {
  scheduled: false, // Don't start immediately, wait for manual start
  timezone: 'Asia/Ho_Chi_Minh' // Adjust to your timezone
});

module.exports = {
  start: () => {
    console.log('Cron job for hiding tours every minute started');
    scheduledJob.start();
    // Run once immediately when starting
    checkAndHideTours();
  },
  stop: () => {
    console.log('Cron job for hiding tours stopped');
    scheduledJob.stop();
  },
  checkAndHideTours // Export for manual execution if needed
};