import type { PriceTier } from "@/types/product";

export function getPriceTier(tiers: readonly PriceTier[], quantity: number): PriceTier | undefined {
  return [...tiers]
    .sort((left, right) => left.minQuantity - right.minQuantity)
    .find((tier) => quantity >= tier.minQuantity && (tier.maxQuantity === undefined || quantity <= tier.maxQuantity));
}
