// Export all server actions
export { checkAvailability } from "./checkAvailability";
export {
  getAvailableTimeSlots,
  getAvailableTimeSlotsForRange,
} from "./getAvailableTimeSlots";
export { getFullyBookedDates, isDateFullyBooked } from "./getFullyBookedDates";
export { applyCoupon } from "./applyCoupon";
export { createPaymentIntent } from "./createPaymentIntent";
export { createBooking } from "./createBooking";
export { confirmBooking, getBookingByReference } from "./confirmBooking";
export { getUserBookings } from "./getUserBookings";

// Auth actions
export { register } from "./auth/register";
export { requestPasswordReset } from "./auth/resetPassword";
export { updatePassword } from "./auth/updatePassword";

// Admin actions
export { getAllBookings } from "./admin/getAllBookings";
export { updateBooking } from "./admin/updateBooking";
export { deleteBooking } from "./admin/deleteBooking";
export { cancelBooking } from "./admin/cancelBooking";
