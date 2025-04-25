import { EuiText } from '@elastic/eui';
import React from 'react';
import styled from 'styled-components';
import { PriceOuterContainer } from '../..';
import { colors } from '../../../../config';
import { formatSatsInMillions, satToUsd } from '../../../../helpers';
import { LeaderItem } from '../../../../pages/leaderboard/store';
import { UserInfo } from '../../../../pages/leaderboard/userInfo';

const ItemContainer = styled.div`
  --position-gutter: 3rem;
  position: sticky;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  padding-right: 0 !important;
  margin-left: var(--position-gutter);
  background-color: ${colors.light.pureWhite};
  border-radius: 0.5rem;
  border: 1px solid transparent;
  transition-property: border box-shadow;
  transition-timing-function: ease;
  transition-duration: 0.2s;
  &:hover {
    border: 1px solid ${colors.light.borderGreen1};
    box-shadow: 0 0 5px 1px ${colors.light.borderGreen2};
  }

  & .userSummary {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  & .USD_Price {
    font-size: 1rem;
    text-align: right;
    .currency {
      font-size: 0.8em;
    }
  }

  & .position {
    position: absolute;
    left: calc(-1 * var(--position-gutter));
    font-weight: 500;
  }

  & .Price_Dynamic_Text {
    display: flex;
    align-items: center;
  }

  & .Price_inner_Container {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  & .sat-amount {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  & .separator {
    margin: 0 10px;
    color: black;
    font-weight: 500;
  }

  & .usd-amount {
    margin-right: 5px;
    color: ${colors.light.text2};
    &::before {
      content: '|';
      color: ${colors.light.grayish.G900};
    }
  }
`;

type Props = LeaderItem & {
  position: number;
  owner_pubkey: string;
  total_sats_earned: number;
};

const color = colors.light;
export const LeaerboardItem = ({ owner_pubkey, total_sats_earned, position }: Props) => (
  <ItemContainer data-testid="leaerboard-item-component">
    <EuiText color={colors.light.text2} className="position">
      #{position}
    </EuiText>
    <UserInfo id={owner_pubkey} />
    <div className="userSummary">
      <div className="sats">
        <PriceOuterContainer
          price_Text_Color={color.primaryColor.P300}
          priceBackground={color.primaryColor.P100}
        >
          <div className="Price_inner_Container">
            <div className="Price_Dynamic_Text">
              <span className="sat-amount">{formatSatsInMillions(total_sats_earned)} SAT</span>
              <span className="separator">|</span>
              <span className="usd-amount">${satToUsd(total_sats_earned)}</span>
            </div>
          </div>
        </PriceOuterContainer>
      </div>
    </div>
  </ItemContainer>
);