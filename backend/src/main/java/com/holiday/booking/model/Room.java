package com.holiday.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomNumber;

    private String type; // "Double", "Single", "Family"
    private Double price; // Price per night

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private String status = "AVAILABLE"; // "AVAILABLE", "BOOKED", "MAINTENANCE" (dọn dẹp/bảo trì)

    @ManyToOne
    @JoinColumn(name = "homestay_id")
    private Homestay homestay;
}
