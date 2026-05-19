import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productsCache } from "@/lib/db/schema";
import { wooApi } from "@/lib/woocommerce";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  
  if (!isLocal && url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch produk dari WooCommerce (bisa di-loop untuk pagination jika lebih dari 100)
    const response = await wooApi.get("products", {
      per_page: 50,
      status: "publish",
    });

    const products = response.data;

    // 2. Format dan masukkan ke database (Upsert)
    for (const product of products) {
      const categoryNames = product.categories.map((c: any) => c.name).join(", ");
      
      await db.insert(productsCache).values({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: categoryNames,
        brand: "", // WooCommerce default tidak ada brand, sesuaikan jika Anda pakai plugin brand
        price: product.price ? product.price.toString() : "0",
        stock: product.stock_quantity || 0,
        specs: { weight: product.weight, dimensions: product.dimensions },
        shortDescription: product.short_description?.replace(/(<([^>]+)>)/gi, ""), // Hapus tag HTML
        updatedAt: new Date(product.date_modified),
      }).onConflictDoUpdate({
        target: productsCache.id,
        set: {
          name: product.name,
          price: product.price ? product.price.toString() : "0",
          stock: product.stock_quantity || 0,
          shortDescription: product.short_description?.replace(/(<([^>]+)>)/gi, ""),
          updatedAt: new Date(product.date_modified),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil sinkronisasi ${products.length} produk dari WooCommerce.`,
    });
  } catch (error: any) {
    console.error("Sync Error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
