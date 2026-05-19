import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productsCache } from "@/lib/db/schema";
import { wooApi } from "@/lib/woocommerce";

// Strip HTML tags helper
const stripHtml = (html: string) => html?.replace(/<([^>]+)>/gi, "") ?? "";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (!isLocal && url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── Pagination loop: ambil semua produk dari WooCommerce ──────────────────
    const PER_PAGE = 100; // max yang diizinkan WooCommerce API
    let page = 1;
    let allProducts: any[] = [];
    let hasMore = true;

    console.log("[Sync] Memulai sinkronisasi semua produk WooCommerce...");

    while (hasMore) {
      const response = await wooApi.get("products", {
        per_page: PER_PAGE,
        page,
        status: "publish",
        orderby: "id",
        order: "asc",
      });

      const batch: any[] = response.data;

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      allProducts = allProducts.concat(batch);
      console.log(`[Sync] Halaman ${page}: ${batch.length} produk (total: ${allProducts.length})`);

      // Jika hasil < PER_PAGE, artinya ini halaman terakhir
      if (batch.length < PER_PAGE) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`[Sync] Total produk ditemukan: ${allProducts.length}. Mulai upsert ke DB...`);

    // ── Upsert semua produk ke database ──────────────────────────────────────
    let synced = 0;
    let errors = 0;

    for (const product of allProducts) {
      try {
        const categoryNames = product.categories?.map((c: any) => c.name).join(", ") ?? "";

        // Ambil brand dari attribute jika ada (plugin WooCommerce Brands / custom attribute)
        const brandAttr = product.attributes?.find(
          (a: any) => a.name?.toLowerCase() === "brand" || a.name?.toLowerCase() === "merek"
        );
        const brand = brandAttr?.options?.[0] ?? "";

        await db
          .insert(productsCache)
          .values({
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: categoryNames,
            brand,
            price: product.price ? product.price.toString() : "0",
            stock: product.stock_quantity ?? 0,
            specs: {
              weight: product.weight,
              dimensions: product.dimensions,
              sku: product.sku,
            },
            shortDescription: stripHtml(product.short_description ?? ""),
            updatedAt: new Date(product.date_modified),
          })
          .onConflictDoUpdate({
            target: productsCache.id,
            set: {
              name: product.name,
              slug: product.slug,
              category: categoryNames,
              brand,
              price: product.price ? product.price.toString() : "0",
              stock: product.stock_quantity ?? 0,
              specs: {
                weight: product.weight,
                dimensions: product.dimensions,
                sku: product.sku,
              },
              shortDescription: stripHtml(product.short_description ?? ""),
              updatedAt: new Date(product.date_modified),
            },
          });

        synced++;
      } catch (err: any) {
        console.error(`[Sync] Error upsert produk ID ${product.id}:`, err.message);
        errors++;
      }
    }

    console.log(`[Sync] Selesai. ${synced} berhasil, ${errors} gagal.`);

    return NextResponse.json({
      success: true,
      total: allProducts.length,
      synced,
      errors,
      pages: page,
      message: `Berhasil sinkronisasi ${synced} dari ${allProducts.length} produk (${page} halaman).`,
    });
  } catch (error: any) {
    console.error("[Sync] Fatal error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        detail: error.response?.data ?? null,
      },
      { status: 500 }
    );
  }
}
