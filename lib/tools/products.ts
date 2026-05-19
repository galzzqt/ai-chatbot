import { db } from "@/lib/db";
import { productsCache } from "@/lib/db/schema";
import { ilike, or, and } from "drizzle-orm";

export async function searchProducts(keyword: string) {
  try {
    // Bersihkan keyword dari kata umum Indonesia
    const noiseWords = ["hp", "handphone", "cari", "beli", "ada", "toko", "murah", "terbaru", "promo"];
    const cleanWords = keyword
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !noiseWords.includes(word));

    // Jika setelah dibersihkan kosong, gunakan keyword asli
    const searchTerms = cleanWords.length > 0 ? cleanWords : [keyword.toLowerCase()];

    // Buat kondisi pencarian: setiap kata pencarian harus cocok dengan setidaknya salah satu kolom (name, category, brand)
    const conditions = searchTerms.map(term => 
      or(
        ilike(productsCache.name, `%${term}%`),
        ilike(productsCache.category, `%${term}%`),
        ilike(productsCache.brand, `%${term}%`)
      )
    );

    const results = await db
      .select()
      .from(productsCache)
      .where(and(...conditions))
      .limit(5);

    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
