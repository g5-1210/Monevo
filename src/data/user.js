/* Default preferences for a new account. */
export const defaultPrefs = {
  currency: 'INR',
  dateFormat: 'DD MMM YYYY',
  notifications: {
    budgetAlerts: true,
    paymentReminders: true,
    weeklySummary: false,
    monthlySummary: true,
  },
};

/** Opening balance that goes with the bundled sample data. New accounts start at 0. */
export const SAMPLE_OPENING_BALANCE = 12000;
