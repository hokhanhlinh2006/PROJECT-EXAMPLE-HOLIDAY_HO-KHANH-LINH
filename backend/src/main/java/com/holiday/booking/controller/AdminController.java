package com.holiday.booking.controller;

import com.holiday.booking.model.Booking;
import com.holiday.booking.model.Room;
import com.holiday.booking.service.BookingService;
import com.holiday.booking.service.HomestayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private HomestayService homestayService;

    @Autowired
    private BookingService bookingService;

    @PutMapping("/rooms/{roomId}/status")
    public ResponseEntity<?> updateRoomStatus(@PathVariable Long roomId, @RequestParam String status) {
        try {
            Room updated = homestayService.updateRoomStatus(roomId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<Booking> bookings = bookingService.getAllBookings();
        double totalRevenue = bookings.stream()
            .filter(b -> "PAID".equals(b.getStatus()))
            .mapToDouble(Booking::getTotalPrice)
            .sum();

        long confirmedBookings = bookings.stream()
            .filter(b -> "PAID".equals(b.getStatus()) || "CONFIRMED".equals(b.getStatus()))
            .count();

        long totalBookingsCount = bookings.size();
        long cancelledBookings = bookings.stream()
            .filter(b -> "CANCELLED".equals(b.getStatus()))
            .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", totalBookingsCount);
        stats.put("paidBookings", confirmedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        stats.put("systemDate", java.time.LocalDate.now().toString());

        return ResponseEntity.ok(stats);
    }
}
