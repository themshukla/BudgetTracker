// utils/getBadgeLabel.js

export const getBadgeLabel = ({
  cardType,
  entryType = "",
  section = "",
  categoryType = "",
}) => {
  const cap = (s) =>
    typeof s === "string" && s.length > 0
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : "";

  // ✅ Budget: Custom Card
  if (cardType === "custom") {
    return `${cap(entryType)} Custom Budget`;
  }

  // ✅ Budget: Standard Card
  if (cardType === "standard") {
    if (section === "discretionaryItems") {
      return `${cap(entryType)} Discretionary Budget`;
    }
    if (section === "nonDiscretionaryItems") {
      return `${cap(entryType)} Non-Discretionary Budget`;
    }
  }

  // ✅ Net Worth: Asset Card
  if (cardType === "asset") {
    if (categoryType === "fixed") return "Net Worth Fixed Asset";
    return "Net Worth Asset";
  }

  // ✅ Net Worth: Liability Card
  if (cardType === "liability") {
    if (categoryType === "longTerm") return "Net Worth Long-Term Liability";
    return "Net Worth Liability";
  }

  return "Unknown";
};
