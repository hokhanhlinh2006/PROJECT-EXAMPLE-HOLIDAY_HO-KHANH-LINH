package com.holiday.booking.repository;

import com.holiday.booking.model.Homestay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomestayRepository extends JpaRepository<Homestay, Long> {
}
