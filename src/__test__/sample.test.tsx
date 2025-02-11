import { api } from "../utils/api";
import { renderWithProviders, trpcMsw } from "./setup";
import { describe, expect, beforeAll, afterAll, it } from "vitest";

function Greeting() {
  const greeting = api.example.hello.useMutation();
  useEffect(() => {
    greeting.mutate({ text: "world" });
  }, []);
  return <h1>{greeting.data?.greeting ?? "no data"}</h1>;
}

import { setupServer } from "msw/node";
import { screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";

const server = setupServer(
  trpcMsw.example.hello.mutation(async (req, res, ctx) => {
    const request = await req.getInput();
    return res(
      ctx.status(200),
      // TODO: fix type issues here
      ctx.data({
        greeting: `Hello ${request.text}!`,
      })
    );
  })
);

describe("BestCat", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  it("should render the result of the query", async () => {
    renderWithProviders(<Greeting />);
    const noData = screen.getByText(/no data/i);
    expect(noData).toBeInTheDocument();
    await waitFor(() => {
      const helloWorld = screen.getByText(/Hello world/i);
      expect(helloWorld).toBeVisible();
    });
  });
});
