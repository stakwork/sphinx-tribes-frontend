import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import BountyDescription from 'bounties/BountyDescription';
import BountyPrice from 'bounties/BountyPrice';
import { Link } from 'react-router-dom';
import { BountiesProps } from 'people/interfaces';
import { EuiText } from '@elastic/eui';
import IconButton from 'components/common/IconButton';
import { userCanManageBounty } from 'helpers';
import { useStores } from 'store';
import ConnectCard from 'people/utils/ConnectCard';
import StartUpModal from 'people/utils/StartUpModal';
import { colors } from '../../config/colors';
import { bountyStore } from '../../store/bountyStore';

interface containerProps {
  unAssignedBackgroundImage?: string;
  assignedBackgroundImage?: string;
  unassigned_border?: string;
  grayish_G200?: string;
  color?: any;
}

const BountyContainer = styled.div<containerProps>`
  display: flex;
  flex-direction: row;
  font-family: 'Barlow';
  min-height: 160px;
  max-height: auto;
  background: transparent;
  background: ${(p: any) => (p.assignedBackgroundImage ? p.assignedBackgroundImage : '')};
  background-repeat: no-repeat;
  background-size: cover;
  border: ${(p: any) => (p.assignedBackgroundImage ? `2px solid ${p.color.grayish.G950}` : '')};
  border-radius: 10px;
  .BountyDescriptionContainer {
    min-width: 153px;
    max-width: 153px;
  }
  .BountyPriceContainer {
    display: flex;
    flex-direction: row;
  }

  :hover {
    border: ${(p: any) => (p?.assignedBackgroundImage ? `2px solid ${p.color.borderGreen2}` : '')};
    border-radius: ${(p: any) => (p.assignedBackgroundImage ? '10px' : '')};
  }
`;

const Container = styled.div`
  margin: 20px 0;
`;

const Header = styled.div`
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

const Placeholder = styled.div`
  color: ${colors.light.text2};
  text-align: center;
  padding: 20px;
`;

const BountyLink = styled(Link)`
  text-decoration: none;
  :hover {
    text-decoration: none;
  }
`;

const UnassignedPersonProfile = styled.div<containerProps>`
  min-width: 336px;
  min-height: 160px;
  max-height: auto;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23B0B7BCFF' stroke-width='3' stroke-dasharray='4' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e");
  border-radius: 10px;
  display: flex;
  padding-top: 32px;
  padding-left: 37px;
  .UnassignedPersonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    width: 80px;
    border-radius: 50%;
    margin-top: 5px;
  }
  .UnassignedPersonalDetailContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 25px;
    margin-bottom: 2px;
  }
  .ProfileText {
    font-size: 15px;
    font-weight: 500;
    font-family: 'Barlow';
    color: ${(p: any) => (p.grayish_G200 ? p.grayish_G200 : '')};
    margin-bottom: -13px;
    line-height: 18px;
    display: flex;
    align-items: center;
  }
`;

const DescriptionPriceContainer = styled.div<containerProps>`
  display: flex;
  flex-direction: row;
  width: 758px;
  min-height: 160px;
  max-height: auto;
  height: 100%;
  background: ${(p: any) => (p.unAssignedBackgroundImage ? p.unAssignedBackgroundImage : '')};
  background-repeat: no-repeat;
  background-size: cover;

  :hover {
    background: url('/static/unassigned_bounty_hover_bg.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }
`;

const Card = styled.div`
  background: ${colors.light.background100};
  border-radius: 10px;
  overflow: hidden;
`;

export const FeaturedBounties: React.FC<BountiesProps> = observer((props: BountiesProps) => {
  const {
    assignee,
    price,
    sessionLength,
    priceMin,
    priceMax,
    codingLanguage,
    title,
    person,
    onPanelClick,
    widget,
    created,
    org_uuid,
    activeWorkspace
  } = props;

  const featuredBounty = bountyStore.getFeaturedBounty();
  const color = colors['light'];
  const [openStartUpModel, setOpenStartUpModel] = useState<boolean>(false);
  const closeModal = () => setOpenStartUpModel(false);
  const showModal = () => setOpenStartUpModel(true);
  const [openConnectModal, setConnectModal] = useState<boolean>(false);
  const closeConnectModal = () => setConnectModal(false);
  const showConnectModal = () => setConnectModal(true);

  const { ui, main } = useStores();
  const userPubkey = ui.meInfo?.owner_pubkey;

  const canAssignHunter = useMemo(() => {
    if (!org_uuid || !userPubkey) return false;

    const isBountyOwner = ui.meInfo?.owner_pubkey === person.owner_pubkey;

    const canManage = userCanManageBounty(org_uuid, userPubkey, main);

    return isBountyOwner || canManage;
  }, [org_uuid, userPubkey, person.owner_pubkey, main]);

  return (
    <Container>
      <Header>
        <h2>Featured Bounties</h2>
      </Header>

      {featuredBounty ? (
        <Card>
          <Link
            to={{
              pathname: `/bounty/${props.id}`,
              state: { activeWorkspace }
            }}
          >
            <BountyContainer color={color}>
              <DescriptionPriceContainer
                data-testid="description-price-container"
                unAssignedBackgroundImage={'url("/static/unassigned_bounty_bg.svg")'}
              >
                <BountyLink
                  to={{
                    pathname: `/bounty/${props.id}`,
                    state: { activeWorkspace }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <BountyDescription
                      {...person}
                      {...props}
                      img={person.img}
                      org_img={props.img}
                      title={title}
                      codingLanguage={codingLanguage}
                      widget={widget}
                      created={created}
                    />
                    <BountyPrice
                      priceMin={priceMin}
                      priceMax={priceMax}
                      price={price}
                      sessionLength={sessionLength}
                      style={{
                        borderLeft: `1px solid ${color.grayish.G700}`,
                        maxWidth: '245px',
                        minWidth: '245px'
                      }}
                    />
                  </div>
                </BountyLink>

                <UnassignedPersonProfile
                  unassigned_border={color.grayish.G300}
                  grayish_G200={color.grayish.G200}
                >
                  <div className="UnassignedPersonContainer">
                    <img
                      src="/static/unassigned_profile.svg"
                      alt=""
                      height={'100%'}
                      width={'100%'}
                    />
                  </div>
                  <div className="UnassignedPersonalDetailContainer">
                    {!canAssignHunter && (
                      <EuiText className="ProfileText">Do your skills match?</EuiText>
                    )}
                    <IconButton
                      text={canAssignHunter ? 'Assign Hunter' : 'I can help'}
                      onClick={(e: any) => {
                        if (ui.meInfo) {
                          canAssignHunter ? onPanelClick() : showConnectModal();
                          e.stopPropagation();
                        } else {
                          e.stopPropagation();
                          showModal();
                        }
                      }}
                      endingIcon={'arrow_forward'}
                      width={166}
                      height={48}
                      style={{ marginTop: 20 }}
                      color="primary"
                      hovercolor={color.button_secondary.hover}
                      activecolor={color.button_secondary.active}
                      shadowcolor={color.button_secondary.shadow}
                      iconSize={'16px'}
                      iconStyle={{
                        top: '17px',
                        right: '14px'
                      }}
                      textStyle={{
                        width: '108px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        fontFamily: 'Barlow'
                      }}
                    />
                  </div>
                </UnassignedPersonProfile>
              </DescriptionPriceContainer>
            </BountyContainer>
            {openStartUpModel && (
              <StartUpModal
                closeModal={closeModal}
                dataObject={'getWork'}
                buttonColor={'primary'}
              />
            )}
            <ConnectCard
              dismiss={() => closeConnectModal()}
              modalStyle={{ top: -64, height: 'calc(100% + 64px)' }}
              person={person}
              visible={openConnectModal}
              created={created}
            />
          </Link>
        </Card>
      ) : (
        <Placeholder>No featured bounties at the moment</Placeholder>
      )}
    </Container>
  );
});
