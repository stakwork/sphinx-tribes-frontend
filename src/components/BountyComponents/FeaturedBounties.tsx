import React, { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { DisplayBounties } from '../../people/widgetViews/workspace/style';
import { colors } from '../../config/colors';
import { bountyStore } from '../../store/bountyStore';
import WidgetSwitchViewer from '../../people/widgetViews/WidgetSwitchViewer';

const FeaturedContainer = styled.div`
  margin: 20px 0;
`;

const FeaturedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.light.text1};
    margin: 0;
  }
`;

export const FeaturedBounties: React.FC = observer(() => {
  const featuredBounty = bountyStore.getFeaturedBounty();
  const [currentItems, setCurrentItems] = useState<number>(1);
  const [page, setPage] = useState<number>(1);

  const widgetViewerProps = {
    onPanelClick: (activeWorkspace?: string, bounty?: any) => {
      if (bounty?.id) {
        window.location.href = featuredBounty?.url || '';
      }
    },
    checkboxIdToSelectedMap: {},
    checkboxIdToSelectedMapLanguage: {},
    fromBountyPage: true,
    selectedWidget: 'bounties',
    isBountyLandingPage: true,
    loading: false,
    currentItems,
    setCurrentItems: (items: number) => setCurrentItems(items),
    page,
    setPage: (newPage: number) => setPage(newPage),
    languageString: '',

    bounties: featuredBounty
      ? [
          {
            body: {
              id: featuredBounty.bountyId
            },
            person: {
              wanteds: []
            }
          }
        ]
      : []
  };

  return (
    <FeaturedContainer>
      <FeaturedHeader>
        <h2>Featured Bounties</h2>
      </FeaturedHeader>

      <DisplayBounties>
        <div
          style={{
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '50%',
            overflowY: 'auto'
          }}
        >
          {featuredBounty ? (
            <WidgetSwitchViewer {...widgetViewerProps} />
          ) : (
            <div style={{ color: colors.light.text2, textAlign: 'center', padding: '20px' }}>
              No featured bounties at the moment
            </div>
          )}
        </div>
      </DisplayBounties>
    </FeaturedContainer>
  );
});
