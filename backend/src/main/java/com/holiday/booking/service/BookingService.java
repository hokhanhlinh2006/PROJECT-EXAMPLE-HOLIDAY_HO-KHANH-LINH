package com.holiday.booking.service;

import com.holiday.booking.model.Booking;
import com.holiday.booking.model.Payment;
import com.holiday.booking.model.Room;
import com.holiday.booking.model.User;
import com.holiday.booking.repository.BookingRepository;
import com.holiday.booking.repository.PaymentRepository;
import com.holiday.booking.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public Booking createBooking(User user, Long roomId, LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        if ("MAINTENANCE".equalsIgnoreCase(room.getStatus())) {
            throw new RuntimeException("Room is currently under maintenance / cleaning");
        }

        // Concurrency/Overlap check
        List<Booking> conflicts = bookingRepository.findConflictingBookings(roomId, checkIn, checkOut);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Room is already booked during this period");
        }

        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (days <= 0) {
            days = 1; // Minimum 1 day pricing
        }
        double totalPrice = days * room.getPrice();

        Booking booking = Booking.builder()
            .user(user)
            .room(room)
            .checkInDate(checkIn)
            .checkOutDate(checkOut)
            .totalPrice(totalPrice)
            .status("PENDING")
            .build();

        return bookingRepository.save(booking);
    }

    @Transactional
    public Payment confirmPayment(Long bookingId, String paymentMethod, String transactionId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("PAID".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already paid");
        }

        booking.setStatus("PAID");
        booking.getRoom().setStatus("BOOKED");
        bookingRepository.save(booking);

        Payment payment = Payment.builder()
            .booking(booking)
            .paymentMethod(paymentMethod)
            .paymentStatus("COMPLETED")
            .transactionId(transactionId)
            .amount(booking.getTotalPrice())
            .paymentDate(LocalDateTime.now())
            .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("CANCELLED");
        // Revert room status to AVAILABLE
        booking.getRoom().setStatus("AVAILABLE");
        booking.getRoom().setIsAvailable(true);
        roomRepository.save(booking.getRoom());

        return bookingRepository.save(booking);
    }
}
