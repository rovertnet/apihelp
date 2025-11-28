-- Update existing services with their corresponding image paths
-- Matching by creation date/time

-- Service 8: Tonte de pelouse (2025-11-24 23:04:01) -> service-1764025441155-748546194.jpg (Nov 25 00:04)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764025441155-748546194.jpg' WHERE id = 8;

-- Service 9: Taille d'arbustes (2025-11-24 23:10:02) -> service-1764025802438-66547085.jpeg (Nov 25 00:10)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764025802438-66547085.jpeg' WHERE id = 9;

-- Service 10: Dépannage électrique (2025-11-24 23:15:52) -> service-1764026152397-44987056.webp (Nov 25 00:15)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764026152397-44987056.webp' WHERE id = 10;

-- Service 11: Installation d'alarmes (2025-11-24 23:19:53) -> service-1764026393635-557071993.jpg (Nov 25 00:19)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764026393635-557071993.jpg' WHERE id = 11;

-- Service 12: Déménagement résidentiel (2025-11-24 23:29:29) -> service-1764026969416-81698605.jpg (Nov 25 00:29)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764026969416-81698605.jpg' WHERE id = 12;

-- Service 13: Déménagement commercial (2025-11-25 00:05:26) -> service-1764029126910-939854136.jpg (Nov 25 01:05)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764029126910-939854136.jpg' WHERE id = 13;

-- Service 14: Dépannage informatique (2025-11-25 00:11:08) -> service-1764029468829-987273613.jpeg (Nov 25 01:11)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764029468829-987273613.jpeg' WHERE id = 14;

-- Service 15: Installation de logiciels (2025-11-25 00:15:20) -> service-1764029720265-374411145.png (Nov 25 01:15)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764029720265-374411145.png' WHERE id = 15;

-- Service 16: Effet Stucco (2025-11-25 12:29:03) -> service-1764073743925-188626085.jpeg (Nov 25 13:29)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764073743925-188626085.jpeg' WHERE id = 16;

-- Service 17: Effet Marbré (2025-11-25 15:21:52) -> service-1764084112305-532488923.webp (Nov 25 16:21)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764084112305-532488923.webp' WHERE id = 17;

-- Service 19: Effet Sablé / Patiné (2025-11-25 17:44:20) -> service-1764092660686-363579008.jpg (Nov 25 18:44)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764092660686-363579008.jpg' WHERE id = 19;

-- Service 20: Développement & Web (2025-11-27 14:56:03) -> service-1764255363437-614523276.jpg (Nov 27 15:56)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764255363437-614523276.jpg' WHERE id = 20;

-- Service 21: TEST (2025-11-27 19:19:37) -> service-1764271177878-717171040.jpg (Nov 27 20:19)
UPDATE "Service" SET "imageUrl" = 'uploads/services/service-1764271177878-717171040.jpg' WHERE id = 21;

-- Verify the updates
SELECT id, title, "imageUrl" FROM "Service" WHERE "imageUrl" IS NOT NULL ORDER BY id;
