import { type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

type UseQueryCallbacksOptions<TData, TError> = {
  query: UseQueryResult<TData, TError>;
  onSettled?: (data?: TData, error?: TError) => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onDataChanged?: (data: TData) => void;
};

export const useQueryCallbacks = <TData, TError>({
  query,
  onSettled,
  onSuccess,
  onError,
  onDataChanged,
}: UseQueryCallbacksOptions<TData, TError>) => {
  const { data, error, status } = query;

  useEffect(() => {
    if (data) {
      onDataChanged?.(data);
    }
  }, [data]);

  useEffect(() => {
    if (status === "success") {
      onSuccess?.(data);
      onSettled?.(data);
    }
  }, [status]);

  useEffect(() => {
    if (error) {
      onError?.(error);
      onSettled?.(undefined, error);
    }
  }, [error]);
};
