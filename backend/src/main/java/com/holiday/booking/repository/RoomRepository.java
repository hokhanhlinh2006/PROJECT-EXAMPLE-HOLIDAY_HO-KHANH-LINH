package com.holiday.booking.repository;

import com.holiday.booking.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHomestayId(Long homestayId);
}
