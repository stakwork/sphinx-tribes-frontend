import React from "react";
import {render, screen} from "@testing-library/react";
import "testing-library/jest-dom";
import BadgesModal from "../BadgesModal";

describe("Badges Modal Component", () => {
    const mockSetBadgeToPush = jest.fn();
    const mockSetLiquidAddress = jest.fn();
    const mockSetMemo = jest.fn();
    const mockClaimBadge = jest.fn();

    const mockProps = {
        setBadgeToPush: mockSetBadgeToPush,
        visible: true,
        liquidAddress: "test-liquid-address",
        setLiquidAddress: mockSetLiquidAddress,
        memo: "test-memo",
        setMemo: mockSetMemo,
        claiming: false,
        claimBadge: mockClaimBadge
    };

    test("renders the component", () => {
        render(<BadgesModal {...mockProps} />);
         expect(screen.getByLabelText('Liquid Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Memo (optional)')).toBeInTheDocument();
        expect(screen.getByText('Claim on Liquid')).toBeInTheDocument();
    });
})