package com.holiday.booking.service;

import com.holiday.booking.model.Homestay;
import com.holiday.booking.model.Room;
import com.holiday.booking.repository.HomestayRepository;
import com.holiday.booking.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class HomestayService {

    @Autowired
    private HomestayRepository homestayRepository;

    @Autowired
    private RoomRepository roomRepository;

    public List<Homestay> getAllHomestays() {
        return homestayRepository.findAll();
    }

    public Homestay saveHomestay(Homestay homestay) {
        return homestayRepository.save(homestay);
    }

    public Optional<Homestay> getHomestayById(Long id) {
        return homestayRepository.findById(id);
    }

    public void deleteHomestay(Long id) {
        homestayRepository.deleteById(id);
    }

    public List<Room> getRoomsByHomestay(Long homestayId) {
        return roomRepository.findByHomestayId(homestayId);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    public Room updateRoomStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setStatus(status);
        if ("AVAILABLE".equalsIgnoreCase(status)) {
            room.setIsAvailable(true);
        } else {
            room.setIsAvailable(false);
        }
        return roomRepository.save(room);
    }
}
