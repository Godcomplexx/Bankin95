# Bankin95 server

API for the mobile app: recipe book, nearby stores and grocery-basket prices.

| Route | What it returns |
|---|---|
| `GET /health` | `{ ok, version }` |
| `GET /v1/catalog` | recipes, ingredients, allergens, diets, exchange rate |
| `GET /v1/stores?lat&lon&radius` | supermarkets around a point (OpenStreetMap, cached) |
| `POST /v1/basket` | grocery basket priced in each nearby store, cheapest first |

**Prices are estimates.** No Russian grocery chain publishes a public price API, so a basket price is the
base price of each ingredient times a typical price level of the chain. Responses carry
`priceSource: "estimate"`. Replace `priceFor` in `src/providers/prices.ts` with a real source to change that.

## Run locally (Node)

```bash
npm install
npm run dev          # http://localhost:8787
```

## Deploy (Cloudflare Workers, free plan)

```bash
npx wrangler login   # once, opens the browser
npm run deploy       # prints https://bankin95-api.<your-subdomain>.workers.dev
```

Then put that address into the app's `.env.local` as `EXPO_PUBLIC_API_URL` and rebuild the app.
