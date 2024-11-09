# Tugas Kelompok Three js Grafika Komputer A 
| Name           | NRP        | Kelas     |
| ---            | ---        | ----------|
| Helsa Sriprameswari Putri| 5025221154 | Grafika Komputer A |
| Rumaisha Afrina | 5025221146 | Grafika Komputer A |
| Yasmin Putri Sujono| 5025221273 | Grafika Komputer A |


## Week 1 - Progress
## Animal Crossing Game

Permainan yang dimana karakter menyeberang melalui jalanan yang ramai tidak mengenai kendaraan (cars dan truck) dengan karakter yang bisa maju, mundur, kanan, dan kiri. 

## Cara Bermain : 
1. Mulai Permainan: Saat permainan dimulai, karakter akan berada di titik awal di tepi jalan
2. Gerakkan Karakter: 
Ketuk layar atau tekan tombol panah atas untuk membuat karakter maju satu langkah ke depan.
Geser ke kiri atau kanan (atau gunakan tombol panah kiri/kanan) untuk bergerak ke samping dan menghindari rintangan.
3. Jalan Raya: Hindari mobil, truk, dan kereta. Kendaraan ini bisa muncul dengan kecepatan berbeda. 
4. Kumpulkan Skor Tertinggi: Setiap langkah maju menambah skor, jadi bergeraklah sejauh mungkin tanpa kena rintangan untuk mendapatkan skor tertinggi.

## Features & Models : 
1. Animal : Hewan akan mencoba untuk menyebrang jalan
2. Cars : Mobil akan bergerak maju di jalan
3. Truck : Truck akan bergerak maju di jalan
4. Trees : Pohon sebagai pajangan di pinggir jalan
5. Score : Score semakin bertambah jika animal maju ke depan

## Additional Library : 
1. Adding Shadow
2. Adding Textures
3. Adding Lighting
4. Adding Materials
5. Adding Camera
6. User Controls (Arrow Left, Arrow Right, Arrow Up, Arrow Down)

## Week 2 - Progress

## Home Page
Dalam home page game, terdapat 3 tombol, yaitu characters, rules, dan play. Tombol characters mengarah ke halaman unlock characters untuk melihat characters pada game. Tombol rules mengarah ke halaman rules untuk melihat aturan main game. Tombol play mengarah ke halaman game untuk memulai permainan.

## Unlock Your Characters Page
Page ini digunakan untuk menampilkan model 3D character - character animal yang ada di game. Character - character ini nantinya akan dikumpulkan user/player  Terdapat tombol next untuk melihat character selanjutnya, tombol previous untuk melihat character sebelumnya, dan tombol play untuk langsung main game. 3D character model yang ada diantaranya adalah :

1. 
2.
3.
4.
5.

## Rules Page
Page rules digunakan untuk menampilkanm aturan main game. Rules game ini adalah :

1. Use arrow up, down, left, right to move 
2. Avoid cars / trucks to cross the road
3. If the game is over, play again
4. Unlock animal characters to level up

## Animal Crossing Game

Page ini digunakan user untuk memulai permainan game animal crossing. Player harus menggerakan animal untuk menyebrang jalan. Score terus bertambah setiap animal maju ke depan. Jika animal tertabrak mobil/truk, akan game over dan player akan dioffer untuk memainkan game lagi. Terdapat beberapa fungsi di game ini :

1. Chicken : Fungsi untuk memberi bentuk ayam berupa badan dan sayap dengan menerapkan tekstur serta material bulu ayam.
2. Wheel : Fungsi untuk memberi bentuk roda mobil dengan menerapkan tekstur roda.
3. Car : Fungsi untuk memberi bentuk mobil dan menggdengan menerapkan material berwarna pastel colors.
4. Grass : Fungsi untuk memberi bentuk rumput sebagai alas animal pada start.
5. Road : Fungsi untuk memberi bentuk jalan dengan menerapkan teksture jalan sebagai alas mobil berjalan.
6. Lane : Fungsi untuk membuat lajur yang berisi objek tertentu, seperrti mobil, grass, dan road. Fungsi ini juga menangani kontrol pergerakan character.
7. Move :  Fungsi ini menangani gerak character animal untuk ke depan, belakang, kanan, dan kiri. Jika user click arrow up, animal bergerak maju ke depan. Jika user click arrow down, animal bergerak maju ke belakang. Jika user click arrow left, animal bergerak maju ke kiri. Jika user click arrow right, animal bergerak maju ke kanan.
8. Animate :  Loop animasi utama dalam permainan yang menggerakkan kendaraan dan karakter animal di dalam scene. Fungsi ini juga menangani score yang terus bertambah tiap karakter maju ke depan. Selain itu, fungsi ini menangani hit/collison antara animal dan kendaraan. Jika terjadi tabrakan, maka akan game over.
