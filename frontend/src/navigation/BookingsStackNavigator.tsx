import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BookingsStackParamList } from "./types";
import { MyBookingsScreen } from "@/screens/bookings/MyBookingsScreen";
import { BookingDetailScreen } from "@/screens/bookings/BookingDetailScreen";
import { LeaveReviewScreen } from "@/screens/reviews/LeaveReviewScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { getStackScreenOptions } from "./stackOptions";

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export function BookingsStackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={getStackScreenOptions(colors)}
    >
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: "Booking Details", headerBackTitle: "Back" }} />
      <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} options={{ title: "Leave a Review", headerBackTitle: "Back" }} />
    </Stack.Navigator>
  );
}
