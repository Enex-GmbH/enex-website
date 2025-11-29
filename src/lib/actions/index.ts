// Export all server actions
export { checkAvailability } from "./checkAvailability";
export {
  getAvailableTimeSlots,
  getAvailableTimeSlotsForRange,
} from "./getAvailableTimeSlots";
export {
  getFullyBookedDates,
  isDateFullyBooked,
} from "./getFullyBookedDates";
export { applyCoupon } from "./applyCoupon";
export { createPaymentIntent } from "./createPaymentIntent";
export { createBooking } from "./createBooking";
export { confirmBooking, getBookingByReference } from "./confirmBooking";

