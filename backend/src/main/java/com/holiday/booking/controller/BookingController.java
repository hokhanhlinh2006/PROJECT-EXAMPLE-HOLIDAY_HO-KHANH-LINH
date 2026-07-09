package com.holiday.booking.controller;

import com.holiday.booking.dto.BookingRequest;
import com.holiday.booking.dto.PaymentRequest;
import com.holiday.booking.model.Booking;
import com.holiday.booking.model.Payment;
import com.holiday.booking.model.User;
import com.holiday.booking.repository.UserRepository;
import com.holiday.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Booking> getAll() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUser(@PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingRequest request) {
        try {
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Booking booking = bookingService.createBooking(
                user,
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
            );
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id, @RequestBody PaymentRequest request) {
        try {
            Payment payment = bookingService.confirmPayment(
                id,
                request.getPaymentMethod(),
                request.getTransactionId()
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        try {
            Booking booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
