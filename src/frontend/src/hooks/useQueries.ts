import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FacultyRequestStatus } from "../backend.d";
import { useActor } from "./useActor";

export function usePendingRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useApprovedRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["approvedRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApprovedRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSubmitRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      timing,
    }: { name: string; description: string; timing: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRequest(name, description, timing);
    },
  });
}

export function useUpdateRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: { requestId: bigint; status: FacultyRequestStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRequestStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["approvedRequests"] });
    },
  });
}

export function useRecordOutTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordFacultyOutTime(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedRequests"] });
    },
  });
}

export function useRecordInTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordFacultyInTime(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedRequests"] });
    },
  });
}
