import { useCallback, useReducer } from "react";

export type SortMode = "count" | "alpha";

interface State {
  hiddenCategories: Set<string>;
  expandedGroups: Set<string>;
  sortMode: SortMode;
}

type Action =
  | { type: "TOGGLE_CATEGORY"; category: string }
  | { type: "TOGGLE_GROUP"; group: string }
  | { type: "TOGGLE_SOURCE_TAG"; categories: string[] }
  | { type: "SET_SORT_MODE"; mode: SortMode };

const INITIAL: State = {
  hiddenCategories: new Set(),
  expandedGroups: new Set(),
  sortMode: "count",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_CATEGORY": {
      const next = new Set(state.hiddenCategories);
      if (next.has(action.category)) next.delete(action.category);
      else next.add(action.category);
      return { ...state, hiddenCategories: next };
    }
    case "TOGGLE_GROUP": {
      const next = new Set(state.expandedGroups);
      if (next.has(action.group)) next.delete(action.group);
      else next.add(action.group);
      return { ...state, expandedGroups: next };
    }
    case "TOGGLE_SOURCE_TAG": {
      const allHidden = action.categories.every((c) => state.hiddenCategories.has(c));
      const next = new Set(state.hiddenCategories);
      if (allHidden) {
        action.categories.forEach((c) => next.delete(c));
      } else {
        action.categories.forEach((c) => next.add(c));
      }
      return { ...state, hiddenCategories: next };
    }
    case "SET_SORT_MODE":
      return { ...state, sortMode: action.mode };
  }
}

export interface UsePoiFilteringResult extends State {
  toggleCategory: (category: string) => void;
  toggleGroup: (group: string) => void;
  toggleSourceTag: (categories: string[]) => void;
  setSortMode: (mode: SortMode) => void;
}

export function usePoiFiltering(): UsePoiFilteringResult {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const toggleCategory = useCallback(
    (category: string) => dispatch({ type: "TOGGLE_CATEGORY", category }),
    []
  );
  const toggleGroup = useCallback(
    (group: string) => dispatch({ type: "TOGGLE_GROUP", group }),
    []
  );
  const toggleSourceTag = useCallback(
    (categories: string[]) => dispatch({ type: "TOGGLE_SOURCE_TAG", categories }),
    []
  );
  const setSortMode = useCallback(
    (mode: SortMode) => dispatch({ type: "SET_SORT_MODE", mode }),
    []
  );

  return { ...state, toggleCategory, toggleGroup, toggleSourceTag, setSortMode };
}
