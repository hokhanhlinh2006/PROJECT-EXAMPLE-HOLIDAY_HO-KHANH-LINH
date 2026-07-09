package com.holiday.booking.config;

import com.holiday.booking.model.Homestay;
import com.holiday.booking.model.Room;
import com.holiday.booking.model.User;
import com.holiday.booking.repository.HomestayRepository;
import com.holiday.booking.repository.RoomRepository;
import com.holiday.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HomestayRepository homestayRepository;

    @Autowired
    private RoomRepository roomRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed users
        if (userRepository.count() == 0) {
            User admin = User.builder()
                .username("admin")
                .password(encoder.encode("admin"))
                .email("admin@holiday.com")
                .phone("0912345678")
                .role("ADMIN")
                .build();
            userRepository.save(admin);

            User client = User.builder()
                .username("client")
                .password(encoder.encode("client"))
                .email("user@holiday.com")
                .phone("0987654321")
                .role("CLIENT")
                .build();
            userRepository.save(client);
            
            System.out.println("Users seeded: admin/admin, client/client");
        }

        // 2. Seed homestays and rooms
        if (homestayRepository.count() == 0) {
            // Homestay 1
            Homestay h1 = Homestay.builder()
                .name("Sunset Holiday Villas")
                .address("123 Bãi Cháy, Hạ Long, Quảng Ninh")
                .description("Biệt thự nghỉ dưỡng view trực diện biển Hạ Long. Đầy đủ tiện ích hồ bơi vô cực, BBQ ngoài trời và phòng karaoke riêng.")
                .rating(4.8)
                .imageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600")
                .build();
            h1 = homestayRepository.save(h1);

            Room r1_1 = Room.builder().roomNumber("101").type("Double").price(1200000.0).status("AVAILABLE").homestay(h1).build();
            Room r1_2 = Room.builder().roomNumber("102").type("Double").price(1200000.0).status("AVAILABLE").homestay(h1).build();
            Room r1_3 = Room.builder().roomNumber("201").type("Family").price(2200000.0).status("AVAILABLE").homestay(h1).build();
            roomRepository.save(r1_1);
            roomRepository.save(r1_2);
            roomRepository.save(r1_3);

            // Homestay 2
            Homestay h2 = Homestay.builder()
                .name("Pine Hill Cabin Da Lat")
                .address("45 Khởi Nghĩa Bắc Sơn, Đà Lạt")
                .description("Căn bungalow gỗ nhỏ xinh ẩn mình giữa đồi thông xanh ngát, đem lại cảm giác yên bình, thơ mộng tuyệt vời cho kỳ nghỉ của bạn.")
                .rating(4.7)
                .imageUrl("https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600")
                .build();
            h2 = homestayRepository.save(h2);

            Room r2_1 = Room.builder().roomNumber("Bung-A").type("Single").price(750000.0).status("AVAILABLE").homestay(h2).build();
            Room r2_2 = Room.builder().roomNumber("Bung-B").type("Double").price(1100000.0).status("AVAILABLE").homestay(h2).build();
            roomRepository.save(r2_1);
            roomRepository.save(r2_2);

            // Homestay 3
            Homestay h3 = Homestay.builder()
                .name("An Bang Beach Boutique Homestay")
                .address("An Bàng, Hội An, Quảng Nam")
                .description("Vị trí đắc địa cách bãi biển An Bàng chỉ 2 phút đi bộ. Sân vườn xanh mát thích hợp đọc sách thư giãn nghỉ dưỡng holiday.")
                .rating(4.9)
                .imageUrl("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600")
                .build();
            h3 = homestayRepository.save(h3);

            Room r3_1 = Room.builder().roomNumber("Room-1").type("Double").price(950000.0).status("AVAILABLE").homestay(h3).build();
            Room r3_2 = Room.builder().roomNumber("Room-2").type("Double").price(950000.0).status("AVAILABLE").homestay(h3).build();
            Room r3_3 = Room.builder().roomNumber("Suite-3").type("Family").price(1800000.0).status("MAINTENANCE").homestay(h3).build();
            roomRepository.save(r3_1);
            roomRepository.save(r3_2);
            roomRepository.save(r3_3);

            System.out.println("Homestays and Rooms seeded successfully.");
        }
    }
}
