package com.holiday.booking.controller;

import com.holiday.booking.model.Homestay;
import com.holiday.booking.model.Room;
import com.holiday.booking.service.HomestayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/homestays")
public class HomestayController {

    @Autowired
    private HomestayService homestayService;

    @GetMapping
    public List<Homestay> getAll() {
        return homestayService.getAllHomestays();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Homestay> getById(@PathVariable Long id) {
        return homestayService.getHomestayById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Homestay create(@RequestBody Homestay homestay) {
        return homestayService.saveHomestay(homestay);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        homestayService.deleteHomestay(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/rooms")
    public List<Room> getRooms(@PathVariable Long id) {
        return homestayService.getRoomsByHomestay(id);
    }

    @PostMapping("/{id}/rooms")
    public ResponseEntity<Room> addRoom(@PathVariable Long id, @RequestBody Room room) {
        return homestayService.getHomestayById(id).map(homestay -> {
            room.setHomestay(homestay);
            Room saved = homestayService.saveRoom(room);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
