import { db } from "./index";
import { productsCache } from "./schema";

async function seed() {
  const dummyProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max-256gb",
      category: "Smartphone",
      brand: "Apple",
      price: "24999000",
      stock: 10,
      specs: { color: "Natural Titanium", ram: "8GB", storage: "256GB" },
      shortDescription: "Flagship Apple dengan material titanium yang ringan dan kuat.",
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra 512GB",
      slug: "samsung-galaxy-s24-ultra-512gb",
      category: "Smartphone",
      brand: "Samsung",
      price: "21999000",
      stock: 5,
      specs: { color: "Titanium Gray", ram: "12GB", storage: "512GB" },
      shortDescription: "Smartphone Android terbaik dengan fitur Galaxy AI dan S-Pen.",
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "Asus ROG Phone 8 Pro",
      slug: "asus-rog-phone-8-pro",
      category: "Smartphone",
      brand: "Asus",
      price: "14999000",
      stock: 3,
      specs: { color: "Phantom Black", ram: "16GB", storage: "512GB" },
      shortDescription: "HP Gaming performa ekstrim untuk pro player MLBB dan PUBG.",
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: "Poco X6 Pro 5G",
      slug: "poco-x6-pro-5g",
      category: "Smartphone",
      brand: "Xiaomi",
      price: "4999000",
      stock: 20,
      specs: { color: "Yellow", ram: "12GB", storage: "512GB" },
      shortDescription: "HP Gaming 4 jutaan dengan chipset Dimensity 8300 Ultra super kencang.",
      updatedAt: new Date(),
    }
  ];

  console.log("Seeding dummy products...");
  
  for (const product of dummyProducts) {
    await db.insert(productsCache).values(product).onConflictDoNothing();
  }
  
  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
