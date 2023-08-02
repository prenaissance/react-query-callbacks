import { it, expect, describe } from "vitest";
import {
  render as testingLibraryRender,
  waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import { useQueryCallbacks } from "../src";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactElement, useRef } from "react";
const WrapperComponent = ({ children }: { children: ReactElement }) => {
  const queryClient = useRef(new QueryClient()).current;
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const render = (ui: ReactElement) =>
  testingLibraryRender(ui, { wrapper: WrapperComponent });

const getCounter = () => {
  let count = 0;

  return () => Promise.resolve(count++);
};

const getFaultyCounter = () => {
  let count = 0;

  return () => Promise.reject(count++);
};

describe("useQueryCallbacks", () => {
  // the side effect
  const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {});

  it("should trigger once on success", async () => {
    const counter = getCounter();
    const Component = () => {
      const query = useQuery({
        queryKey: ["test"],
        queryFn: counter,
      });
      useQueryCallbacks({
        query,
        onSuccess: (data) => console.log(data),
      });

      return null;
    };

    render(<Component />);

    waitFor(() => {
      expect(consoleMock).toHaveBeenCalledTimes(1);
      expect(consoleMock).toHaveBeenCalledWith(0);
    });
  });

  it("should trigger on settling and on success when both are present", () => {
    const counter = getCounter();
    const Component = () => {
      const query = useQuery({
        queryKey: ["test"],
        queryFn: () => counter,
      });
      useQueryCallbacks({
        query,
        onSettled: console.log,
        onSuccess: console.log,
      });

      return null;
    };

    render(<Component />);

    waitFor(() => {
      expect(consoleMock).toHaveBeenCalledTimes(2);
      expect(consoleMock).toHaveBeenCalledWith(0);
      expect(consoleMock).toHaveBeenCalledWith(1);
    });
  });

  it("should trigger once on error", async () => {
    const counter = getFaultyCounter();
    const Component = () => {
      const query = useQuery({
        queryKey: ["test"],
        queryFn: counter,
      });
      useQueryCallbacks({
        query,
        onError: (error) => console.log(error),
      });

      return null;
    };

    render(<Component />);

    waitFor(() => {
      expect(consoleMock).toHaveBeenCalledTimes(1);
      expect(consoleMock).toHaveBeenCalledWith(0);
    });
  });

  it("should trigger the correct callback on settling", async () => {
    const counter = getCounter();
    const Component = () => {
      const query = useQuery({
        queryKey: ["test"],
        queryFn: counter,
      });
      useQueryCallbacks({
        query,
        onSuccess: () => console.log("success"),
        onError: () => console.log("error"),
      });

      return null;
    };

    render(<Component />);

    waitFor(() => {
      expect(consoleMock).toHaveBeenCalledTimes(1);
      expect(consoleMock).toHaveBeenCalledWith("success");
    });
  });

  it("should trigger on every fetch with 'onDataChanged'", async () => {
    const counter = getCounter();
    let hasBeenLoadedOnce = false;
    const Component = () => {
      const queryClient = useQueryClient();
      const query = useQuery({
        queryKey: ["test"],
        queryFn: counter,
      });
      useQueryCallbacks({
        query,
        onSettled: () => {
          if (hasBeenLoadedOnce) {
            queryClient.invalidateQueries(["test"]);
            hasBeenLoadedOnce = false;
          }
        },
        onDataChanged: (data) => console.log(data),
      });

      return null;
    };

    render(<Component />);

    waitFor(() => {
      expect(consoleMock).toHaveBeenCalledTimes(2);
      expect(consoleMock).toHaveBeenCalledWith(0);
      expect(consoleMock).toHaveBeenCalledWith(1);
    });
  });
});
