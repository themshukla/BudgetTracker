export const transformUserDataToRows = (userData) => {
  const rows = [];

  const normalizeItem = (item = {}) => {
    const date = item.timestamp?.seconds
      ? new Date(item.timestamp.seconds * 1000)
      : null;

    return {
      id: item.id || "",
      name: item.name || item.category || "",
      category: item.category || "",
      planned: item.planned ?? "",
      amount: item.amount ?? "",
      networth: item.networth ?? "",
      timestamp: date
        ? date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "",
    };
  };

  const extractItemsFromCard = (card, cardType, sectionType = null) => {
    const items =
      cardType === "custom" ? card?.items : card?.[sectionType] || {};

    ["planned", "spent"].forEach((section) => {
      const sectionData = items?.[section];
      if (Array.isArray(sectionData)) {
        sectionData.forEach((item) => {
          rows.push({
            budget_type: cardType,
            section: sectionType,
            item_type: section,
            ...normalizeItem(item),
          });
        });
      } else if (typeof sectionData === "object") {
        for (const name in sectionData) {
          const item = sectionData[name];

          rows.push({
            budget_type: cardType,
            section: sectionType,
            item_type: section,
            category: item.category || name,
            ...normalizeItem({ ...item, name }),
          });
        }
      }
    });
  };

  const extractNetworthItems = (card, cardType) => {
    const items = card?.items || {};
    for (const itemType in items) {
      const itemArray = items[itemType];
      itemArray?.forEach((item) => {
        rows.push({
          budget_type: cardType,
          section: itemType,
          item_type: itemType,
          ...normalizeItem(item),
        });
      });
    }
  };

  const user = Array.isArray(userData) ? userData[0] : userData;

  // Extract budget data
  const customCards = user?.budget?.custom?.cards || {};
  Object.values(customCards).forEach((card) =>
    extractItemsFromCard(card, "custom")
  );

  const standardCards = user?.budget?.standard?.cards || {};
  Object.values(standardCards).forEach((card) => {
    ["nonDiscretionaryItems", "discretionaryItems"].forEach((section) => {
      extractItemsFromCard(card, "standard", section);
    });
  });

  // Extract net worth data
  const assetCards = user?.networth?.asset?.cards || {};
  Object.values(assetCards).forEach((card) =>
    extractNetworthItems(card, "asset")
  );

  const liabilityCards = user?.networth?.liability?.cards || {};
  Object.values(liabilityCards).forEach((card) =>
    extractNetworthItems(card, "liability")
  );

  return rows;
};
