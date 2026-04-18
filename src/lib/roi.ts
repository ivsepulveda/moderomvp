// Shared ROI / pricing logic for the Agency Portal.
// Modero's "suggested rent" is computed from comparable seeded listings
// (€/m² market average grouped by city + bedroom count). The agency can
// always override it with a manual `target_rent`.

export interface PropertyRoiInput {
  id: string;
  title: string;
  address: string | null;
  rent: number | null;            // current asking rent on the listing
  target_rent: number | null;     // agency-set target
  suggested_rent: number | null;  // Modero-suggested
  listed_at: string | null;
  rented_at: string | null;
  commission_months: number | null;
  bedrooms: number | null;
  is_active: boolean | null;
}

export interface PropertyRoi {
  id: string;
  title: string;
  rent: number;
  targetRent: number;
  suggestedRent: number;
  isRented: boolean;
  daysListed: number;
  daysVacant: number;            // days listed while not yet rented
  dailyLoss: number;             // monthly rent / 30
  commissionLoss: number;        // commission_months * rent (lost while vacant)
  monthlyLoss: number;           // dailyLoss * 30
  totalLossSinceListed: number;  // dailyLoss * daysVacant + commissionLoss (if still vacant)
  priceDeltaPct: number;         // (target - suggested) / suggested * 100
  priceVerdict: "below" | "on_market" | "above";
}

const DAY = 86_400_000;

export function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / DAY));
}

export function computePropertyRoi(p: PropertyRoiInput, now = new Date()): PropertyRoi {
  const rent = Number(p.rent ?? 0);
  const targetRent = Number(p.target_rent ?? rent);
  const suggestedRent = Number(p.suggested_rent ?? rent);
  const commissionMonths = Number(p.commission_months ?? 1);
  const listedAt = p.listed_at ? new Date(p.listed_at) : now;
  const rentedAt = p.rented_at ? new Date(p.rented_at) : null;
  const isRented = !!rentedAt;

  const daysListed = daysBetween(listedAt, now);
  const daysVacant = isRented
    ? daysBetween(listedAt, rentedAt!)
    : daysListed;

  const dailyLoss = rent / 30;
  const monthlyLoss = rent;
  const commissionLoss = isRented ? 0 : commissionMonths * rent;
  const totalLossSinceListed = dailyLoss * daysVacant + commissionLoss;

  const priceDeltaPct = suggestedRent > 0
    ? ((targetRent - suggestedRent) / suggestedRent) * 100
    : 0;
  const priceVerdict =
    priceDeltaPct > 5 ? "above" : priceDeltaPct < -5 ? "below" : "on_market";

  return {
    id: p.id,
    title: p.title,
    rent,
    targetRent,
    suggestedRent,
    isRented,
    daysListed,
    daysVacant,
    dailyLoss,
    commissionLoss,
    monthlyLoss,
    totalLossSinceListed,
    priceDeltaPct,
    priceVerdict,
  };
}

export interface PortfolioRoi {
  total: number;
  rented: number;
  vacant: number;
  occupancyRate: number;            // 0–100
  monthlyLossVacant: number;        // sum of monthly rents for vacant properties
  totalLossSinceListed: number;     // sum across portfolio
  avgDaysToRent: number;            // for rented props only
  avgDaysVacant: number;            // for vacant props only
}

export function computePortfolioRoi(items: PropertyRoi[]): PortfolioRoi {
  const total = items.length;
  const rented = items.filter((i) => i.isRented).length;
  const vacant = total - rented;
  const monthlyLossVacant = items
    .filter((i) => !i.isRented)
    .reduce((s, i) => s + i.monthlyLoss, 0);
  const totalLossSinceListed = items.reduce(
    (s, i) => s + i.totalLossSinceListed,
    0
  );

  const rentedItems = items.filter((i) => i.isRented);
  const vacantItems = items.filter((i) => !i.isRented);
  const avgDaysToRent = rentedItems.length
    ? rentedItems.reduce((s, i) => s + i.daysVacant, 0) / rentedItems.length
    : 0;
  const avgDaysVacant = vacantItems.length
    ? vacantItems.reduce((s, i) => s + i.daysVacant, 0) / vacantItems.length
    : 0;

  return {
    total,
    rented,
    vacant,
    occupancyRate: total ? (rented / total) * 100 : 0,
    monthlyLossVacant,
    totalLossSinceListed,
    avgDaysToRent,
    avgDaysVacant,
  };
}

export const fmtEur = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
