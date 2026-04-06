import { render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ATTRIBUTION_MARK, ATTRIBUTION_TEXT, ATTRIBUTION_URL, AttributionFooter } from "@/App";

describe("global attribution footer", () => {
  it("renders the attribution text and the marker", () => {
    render(createElement(AttributionFooter));

    const footer = screen.getByTestId("attribution-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(ATTRIBUTION_TEXT);
    expect(footer).toHaveAttribute("data-origin-mark", ATTRIBUTION_MARK);

    const link = screen.getByRole("link", { name: ATTRIBUTION_URL });
    expect(link).toHaveAttribute("href", ATTRIBUTION_URL);
  });

  it("restores footer content after direct tampering", async () => {
    render(createElement(AttributionFooter));

    const footer = screen.getByTestId("attribution-footer");
    footer.textContent = "tampered";

    await waitFor(() => {
      expect(screen.getByTestId("attribution-footer")).toHaveTextContent(ATTRIBUTION_TEXT);
    });
  });
});
