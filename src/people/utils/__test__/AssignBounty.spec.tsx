import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useStores } from "store";
import AssignBounty from "../AssignBounty";
import { person } from "__test__/__mockData__/persons";

jest.mock('store', () => ({
    useStores: jest.fn()
}))

describe("Testing rendering of AssignBounty component", () => {
    const mockUseStores = useStores as jest.Mock;
    const mockDismiss = jest.fn();
    const mockSetAssignInvoice = jest.fn();
    const meInfo = {
        owner_pubkey: "test_pub_key"
    }

    const mockProps = {
        person: person,
        visible: true,
        modalStyle: {},
        dismiss: mockDismiss

    }

    beforeEach(() => {
        mockUseStores.mockReturnValue({
            main: {
                assignInvoice: "",
                setAssignInvoice: mockSetAssignInvoice
            },
            ui: {
                meInfo: meInfo
            }
    })

    })

    test("should render AssignBounty component", () => {
        render(<AssignBounty {...mockProps} />);
        expect(screen.getByText("Asign bounty to your self")).toBeInTheDocument();
        expect(screen.getByText("Each hour cost 200 sats")).toBeInTheDocument();
    });

    test("should call dismiss function when overlay is clicked", () => {
        render(<AssignBounty {...mockProps} />);
        fireEvent.click(screen.getByTestId("overlay"));
        expect(mockDismiss).toHaveBeenCalledTimes(1);
    });

    test("displays the modal when visible is true", () => {
        render(<AssignBounty {...mockProps} />);
        expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    test("hides the modal when visible is false", () => {
        render(<AssignBounty {...mockProps} visible={false} />);
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
        
    test("updates bountyHours state when input value changes", () => {
        render(<AssignBounty {...mockProps} />);
        const input = screen.getByLabelText("Number Of Hours");
        fireEvent.change(input, { target: { value: 2 } });
        expect(input).toHaveValue(2);
    });

    test("renders Invoice component when lnInvoice and mockMeInfo are present", () => {
        render(<AssignBounty {...mockProps} />);
        expect(screen.getByText('Pay the invoice to assign to your self')).toBeInTheDocument();
    });

    test("renders input and button when lnInvoice is not present", () => {
        render(<AssignBounty {...mockProps} />);
        expect(screen.getByLabelText("Number Of Hours")).toBeInTheDocument();
        expect(screen.getByText("Generate Invoice")).toBeInTheDocument();
    });

     test('calls dismiss function when overlay is clicked', () => {
    render(<AssignBounty {...mockProps} />);
    fireEvent.click(screen.getByTestId('overlay'));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  test('displays toast notification when invoice is generated', () => {
    render(<AssignBounty {...mockProps} />);
    fireEvent.click(screen.getByText('Generate Invoice'));
    expect(screen.getByText('Invoice generated')).toBeInTheDocument();
  });

  test('handles invoice expiry correctly', () => {
    render(<AssignBounty {...mockProps} />);
    expect(mockSetAssignInvoice).toHaveBeenCalledWith('');
  });
})