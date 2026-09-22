import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Test accounts. These are the credentials listed in the README. */
const users = [
  { name: "Sam Super", email: "superadmin@example.com", password: "SuperAdmin@123", role: Role.SUPER_ADMIN },
  { name: "Alex Admin", email: "admin@example.com", password: "Admin@1234", role: Role.ADMIN },
  { name: "Maya Manager", email: "manager@example.com", password: "Manager@123", role: Role.MANAGER },
  { name: "Sid Staff", email: "staff@example.com", password: "Staff@1234", role: Role.STAFF },
  { name: "Chris Customer", email: "customer@example.com", password: "Customer@123", role: Role.CUSTOMER },
];

const products = [
  { name: "Mechanical Keyboard", description: "Compact 75% layout with hot-swappable switches and a solid aluminium frame.", price: 4999, stock: 25 },
  { name: "Wireless Mouse", description: "Quiet-click ergonomic mouse with 12 months of battery life.", price: 1299, stock: 60 },
  { name: "27-inch 4K Monitor", description: "IPS panel, 99% sRGB and USB-C charging for a clean single-cable desk.", price: 27999, stock: 10 },
  { name: "USB-C Hub (7-in-1)", description: "HDMI, SD card, two USB-A ports and 100W power passthrough.", price: 2499, stock: 40 },
  { name: "Laptop Stand", description: "Foldable aluminium stand that lifts your screen to eye level.", price: 1799, stock: 35 },
  { name: "Noise-Cancelling Headphones", description: "Over-ear, 30-hour battery, comfortable for long coding sessions.", price: 8999, stock: 18 },
  { name: "Webcam 1080p", description: "Auto-focus webcam with a privacy shutter and dual microphones.", price: 3299, stock: 22 },
  { name: "Desk Mat (XL)", description: "Water-resistant felt mat, 90 x 40 cm, non-slip base.", price: 999, stock: 80 },
  { name: "Portable SSD 1TB", description: "Pocket-sized drive with read speeds up to 1000 MB/s.", price: 7499, stock: 15 },
  { name: "LED Desk Lamp", description: "Adjustable colour temperature with a built-in wireless charging pad.", price: 2199, stock: 30 },
  { name: "Ergonomic Chair", description: "Breathable mesh back with adjustable lumbar support and armrests.", price: 15999, stock: 8 },
  { name: "Cable Organiser Kit", description: "Reusable clips and sleeves to keep every cable tidy.", price: 399, stock: 120 },
];

const seed = async () => {
  for (const item of users) {
    const existing = await prisma.user.findUnique({ where: { email: item.email } });
    if (existing) {
      console.log(`  skipped (already exists): ${item.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(item.password, 10);
    await prisma.user.create({ data: { name: item.name, email: item.email, passwordHash, role: item.role } });
    console.log(`  created ${item.role}: ${item.email}`);
  }

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({ data: products.map((product) => ({ ...product, imageUrl: null })) });
    console.log(`  created ${products.length} products`);
  } else {
    console.log("  skipped products (table is not empty)");
  }

  console.log("Seeding finished");
};

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
