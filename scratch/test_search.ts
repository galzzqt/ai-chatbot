import { config } from "dotenv";
config({ path: ".env.local" });

async function testSearch() {
  const { searchProducts } = await import("../lib/tools/products");
  
  console.log("SEARCHING FOR 'HP Oppo':");
  const res1 = await searchProducts("HP Oppo");
  console.log("Results length:", res1.length);
  if (res1.length > 0) {
    console.log("Match names:", res1.map(p => p.name));
  }

  console.log("\nSEARCHING FOR 'oppo':");
  const res2 = await searchProducts("oppo");
  console.log("Results length:", res2.length);

  process.exit(0);
}

testSearch();
