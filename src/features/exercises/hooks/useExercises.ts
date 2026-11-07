// src/features/exercises/hooks/useExercises.ts
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { exerciseService } from "../services/exercise.service";

const PAGE_SIZE = 20;

export function useInfiniteExercises(search: string, muscle: string) {
  return useInfiniteQuery({
    queryKey: ["exercises", { search, muscle }],
    queryFn: ({ pageParam = 0 }) =>
      exerciseService.getPaginatedExercises({
        search,
        muscle,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useMuscleFilters() {
  return useQuery({
    queryKey: ["exercise-muscle-filters"],
    queryFn: () => exerciseService.getAvailableMuscleFilters(),
    staleTime: Infinity,
  });
}
