import { useQuery } from '@tanstack/react-query';
import { searchFoodApi } from '../api/food.api';
import { getFoodSuggestionsApi } from '../api/search.api';

export const useFoodSearch = (query) => {
  return useQuery(['search', query], () => searchFoodApi(query), {
    enabled: Boolean(query && query.length > 2),
    staleTime: 1000 * 60 * 5
  });
};

export const useSuggestions = (query) => {
  return useQuery(['suggestions', query], () => getFoodSuggestionsApi(query), {
    enabled: Boolean(query && query.length > 0),
    staleTime: 0
  });
};
