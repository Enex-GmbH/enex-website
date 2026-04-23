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
export { getCoupons } from "./admin/getCoupons";
export { createCoupon } from "./admin/createCoupon";
export { deleteCoupon } from "./admin/deleteCoupon";
export { getMaintenanceMode } from "./admin/getMaintenanceMode";
export { setMaintenanceMode } from "./admin/setMaintenanceMode";
export { confirmBooking, getBookingByReference } from "./confirmBooking";
export { getUserBookings } from "./getUserBookings";

// Auth actions
export { register } from "./auth/register";
export { requestPasswordReset } from "./auth/resetPassword";
export { updatePassword } from "./auth/updatePassword";
export { updateProfile } from "./auth/updateProfile";
export { changePassword } from "./auth/changePassword";
export { deleteAccount } from "./auth/deleteAccount";
export { getUserProfile } from "./auth/getUserProfile";
export { checkUserStatus } from "./auth/checkUserStatus";

// Admin actions
export { getAllBookings } from "./admin/getAllBookings";
export { updateBooking } from "./admin/updateBooking";
export { deleteBooking } from "./admin/deleteBooking";
export { cancelBooking } from "./admin/cancelBooking";
export { getAllUsers } from "./admin/getAllUsers";
export { updateUser } from "./admin/updateUser";
export { toggleUserStatus } from "./admin/toggleUserStatus";
