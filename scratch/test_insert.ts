import { config } from "dotenv";
config({ path: ".env.local" });

async function test() {
  const { db } = await import("../lib/db");
  const { productsCache } = await import("../lib/db/schema");

  try {
    await db.insert(productsCache).values({
      id: 284447,
      name: "OPPO A6X 6+128 GB GARANSI RESMI",
      slug: "oppo-a6x-6128-gb-garansi-resmi",
      category: "Handphone, Oppo",
      brand: "",
      price: "3299000",
      stock: 100,
      specs: { weight: "", dimensions: { length: "", width: "", height: "" } },
      shortDescription: `Free Topsell Protection. Garansi Kerusakan Ganti Unit\nGaransi Uang Kembali jika produk tidak diterima\nGaransi Resmi dari Pabrik\nGaransi Rusak Ganti Baru jika produk mengalami masalah maksimal 20 hari setelah produk diterima. Ketentuan Garansi.\nProduk dapat dikirim langsung dan Gratis Ongkir untuk Area Jawa Timur\nKemudahan menghubungi kami apabila mengalami kendala pada pengiriman produk Anda`,
      updatedAt: new Date("2026-02-11T05:58:49.000Z"),
    }).onConflictDoUpdate({
      target: productsCache.id,
      set: {
        name: "OPPO A6X 6+128 GB GARANSI RESMI",
        price: "3299000",
        stock: 100,
        shortDescription: "Test",
        updatedAt: new Date("2026-02-11T05:58:49.000Z"),
      }
    });
    console.log("Insert success!");
  } catch (err: any) {
    console.error("ERROR DETAILED:");
    console.error(err);
    if (err.cause) {
      console.error("CAUSE:", err.cause);
    }
  }
  process.exit(0);
}

test();
