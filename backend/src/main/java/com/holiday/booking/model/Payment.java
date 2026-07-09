package com.holiday.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private String paymentMethod; // "CREDIT_CARD", "MOMO", "BANK_TRANSFER"
    private String paymentStatus; // "PENDING", "COMPLETED", "FAILED"
    private String transactionId;
    private Double amount;
    private LocalDateTime paymentDate;
}
