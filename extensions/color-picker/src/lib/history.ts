import { Cache } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { HistoryColor, HistoryItem } from "./types";
import { getFormattedColor } from "./utils";

const MAX_HISTORY_LENGTH = 200;

export function useHistory() {
  const [history, setHistory] = useCachedState<HistoryItem[]>("history", []);
  const update = (color: HistoryColor, updateItem: (item: HistoryItem) => HistoryItem) =>
    setHistory((previousHistory) => {
      const colorKey = getFormattedColor(color);
      const existing = previousHistory.find((item) => getFormattedColor(item.color) === colorKey);
      if (!existing) {
        return [updateItem({ date: new Date().toISOString(), color }), ...previousHistory];
      }
      return previousHistory.map((item) => (getFormattedColor(item.color) === colorKey ? updateItem(item) : item));
    });

  return {
    history,
    remove: (color: HistoryColor) =>
      setHistory((previousHistory) => {
        return previousHistory.filter((item) => getFormattedColor(item.color) !== getFormattedColor(color));
      }),
    edit: (historyItem: HistoryItem) =>
      setHistory((previousHistory) => {
        return previousHistory.map((item) =>
          getFormattedColor(item.color) === getFormattedColor(historyItem.color) ? historyItem : item,
        );
      }),
    addToFavorites: (color: HistoryColor) => update(color, (item) => ({ ...item, isFavorite: true })),
    removeFromFavorites: (color: HistoryColor) => update(color, (item) => ({ ...item, isFavorite: false })),
    moveFavorite: (color: HistoryColor, direction: "up" | "down") =>
      setHistory((previousHistory) => {
        const colorKey = getFormattedColor(color);
        const currentIndex = previousHistory.findIndex(
          (item) => item.isFavorite && getFormattedColor(item.color) === colorKey,
        );

        if (currentIndex === -1) {
          return previousHistory;
        }

        const favoriteIndexes = previousHistory.reduce<number[]>((indexes, item, index) => {
          if (item.isFavorite) {
            indexes.push(index);
          }

          return indexes;
        }, []);
        const favoriteIndex = favoriteIndexes.indexOf(currentIndex);
        const targetFavoriteIndex = favoriteIndex + (direction === "up" ? -1 : 1);
        const targetIndex = favoriteIndexes[targetFavoriteIndex];

        if (targetIndex === undefined) {
          return previousHistory;
        }

        const nextHistory = [...previousHistory];
        [nextHistory[currentIndex], nextHistory[targetIndex]] = [nextHistory[targetIndex], nextHistory[currentIndex]];
        return nextHistory;
      }),
    clear: () => setHistory([]),
  };
}

export function addToHistory(color: HistoryColor) {
  addColorsToHistory([color]);
}

export function addColorsToHistory(colors: HistoryColor[]) {
  if (colors.length === 0) return;
  const cache = new Cache();

  const serializedHistory = cache.get("history");
  const previousHistory = serializedHistory ? (JSON.parse(serializedHistory) as HistoryItem[]) : [];
  const uniqueColors = colors.filter(
    (color, index) =>
      colors.findIndex((candidate) => getFormattedColor(candidate) === getFormattedColor(color)) === index,
  );
  const colorKeys = new Set(uniqueColors.map((color) => getFormattedColor(color)));
  const previousByColor = new Map(previousHistory.map((item) => [getFormattedColor(item.color), item]));
  const date = new Date().toISOString();
  const newItems = uniqueColors.map((color): HistoryItem => {
    const previous = previousByColor.get(getFormattedColor(color));
    return {
      date,
      color,
      title: previous?.title,
      isFavorite: previous?.isFavorite,
    };
  });
  const newItemsByColor = new Map(newItems.map((item) => [getFormattedColor(item.color), item]));
  const refreshedFavorites = previousHistory
    .filter((item) => item.isFavorite || !colorKeys.has(getFormattedColor(item.color)))
    .map((item) => (item.isFavorite ? (newItemsByColor.get(getFormattedColor(item.color)) ?? item) : item));
  const history = [...newItems.filter((item) => !item.isFavorite), ...refreshedFavorites];
  const persistentItemsCount = history.filter((item) => item.isFavorite).length;
  const maxRegularHistoryLength = Math.max(MAX_HISTORY_LENGTH - persistentItemsCount, 0);
  let regularHistoryCount = 0;
  const newHistory = history.filter((item) => {
    if (item.isFavorite) {
      return true;
    }

    regularHistoryCount += 1;
    return regularHistoryCount <= maxRegularHistoryLength;
  });

  cache.set("history", JSON.stringify(newHistory));
}
