import { render, screen } from "@testing-library/react";
import HomeTemplate from "./HomeTemplate";
import useAppContext from "../../../hooks/useAppContext";

// Mock context và component phụ thuộc
jest.mock("../../../hooks/useAppContext", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../Organisms/HeaderHome/HeaderHome", () => () => {
  return <div>Mocked Header</div>;
});

jest.mock("../../Organisms/FooterHome/FooterHome", () => () => {
  return <div>Mocked Footer</div>;
});

const mockedUseAppContext = useAppContext as jest.Mock;

describe("HomeTemplate Component", () => {
  beforeEach(() => {
    mockedUseAppContext.mockReturnValue({ isLoading: false });
  });

  it("renders the header, main, and footer elements", () => {
    render(
      <HomeTemplate>
        <div data-testid="content">Test Content</div>
      </HomeTemplate>
    );

    // Check for header
    const header = screen.getByText("Mocked Header");
    expect(header).toBeInTheDocument();

    // Check for main
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // Check for footer
    const footer = screen.getByText("Mocked Footer");
    expect(footer).toBeInTheDocument();
  });
});
