import { useEffect, useState, useCallback } from "react";
import type { DependencyList } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 汎用データフェッチフック
 * loading / error / data を一元管理し、refetch も返す
 *
 * @example
 * const { data, loading, error, refetch } = useApi(fetchVulnStats, []);
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: DependencyList = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const execute = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchFn()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: Error) =>
        setState({ data: null, loading: false, error: err.message || "Unknown error" })
      );
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
