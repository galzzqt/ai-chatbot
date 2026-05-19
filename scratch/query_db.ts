import { config } from "dotenv";
config({ path: ".env.local" });

async function queryProducts() {
  const { db } = await import("../lib/db");
  const { productsCache } = await import("../lib/db/schema");

  try {
    const allProducts = await db.select().from(productsCache);
    console.log("TOTAL PRODUCTS IN DB:", allProducts.length);
    if (allProducts.length > 0) {
      console.log("FIRST 5 PRODUCTS:");
      console.log(allProducts.slice(0, 5));
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

queryProducts();
