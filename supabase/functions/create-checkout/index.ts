import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCTS = {
  coins_100: { priceId: "price_1T0B3hD8hDIMEHXbfqTL4xdJ", coins: 100 },
  coins_600: { priceId: "price_1T0B3qD8hDIMEHXblkavCeOJ", coins: 600 },
  donate: { priceId: "price_1T0B42D8hDIMEHXbKogtP8lJ" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productKey, quantity, donorName } = await req.json();

    const product = PRODUCTS[productKey as keyof typeof PRODUCTS];
    if (!product) throw new Error("Invalid product");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const isDonation = productKey === "donate";
    const qty = isDonation ? Math.max(1, quantity || 1) : 1;

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: product.priceId, quantity: qty }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        product_key: productKey,
        donor_name: donorName || "Anonymous",
        trees: isDonation ? String(qty) : "0",
        coins: isDonation ? "0" : String((product as any).coins || 0),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
