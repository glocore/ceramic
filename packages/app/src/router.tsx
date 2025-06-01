import { createRouter, RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./queryClient";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  queryClient: typeof queryClient;
};

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
  },
});

export const Router = () => {
  return <RouterProvider router={router} context={{ queryClient }} />;
};
