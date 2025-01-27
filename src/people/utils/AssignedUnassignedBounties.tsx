import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { BountiesProps } from 'people/interfaces';
import { EuiText } from '@elastic/eui';
import { userCanManageBounty } from 'helpers';
import { colors } from '../../config/colors';
import { useStores } from '../../store';
import BountyDescription from '../../bounties/BountyDescription';
import BountyPrice from '../../bounties/BountyPrice';
import BountyProfileView from '../../bounties/BountyProfileView';
import IconButton from '../../components/common/IconButton2';
import ConnectCard from './ConnectCard';
import StartUpModal from './StartUpModal';

interface containerProps {
  unAssignedBackgroundImage?: string;
  assignedBackgroundImage?: string;
  unassigned_border?: string;
  grayish_G200?: string;
  color?: any;
  isBountyLandingPage?: boolean;
}

const BountyContainer = styled.div<containerProps>`
  display: flex;
  flex-direction: row;
  width: 1100px !important;
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
    min-width: 553px;
    max-width: 553px;
  }
  .BountyPriceContainer {
    display: flex;
    flex-direction: row;
    width: 545px;
  }

  :hover {
    border: ${(p: any) => (p?.assignedBackgroundImage ? `2px solid ${p.color.borderGreen2}` : '')};
    border-radius: ${(p: any) => (p.assignedBackgroundImage ? '10px' : '')};
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
    background: ${(p: any) =>
      p.isBountyLandingPage
        ? "url('/static/small_unassigned_bounty_hover_bg.svg')"
        : "url('/static/unassigned_bounty_hover_bg.svg')"};
    background-repeat: no-repeat;
    background-size: ${(p: any) => (p.isBountyLandingPage ? '160% 100%' : 'cover')};
    background-position: ${(p: any) => (p.isBountyLandingPage ? '-125px 0' : '0 0')};
  }
`;

const UnassignedPersonProfile = styled.div<containerProps>`
  min-width: ${(props: any) => (props.isBountyLandingPage ? '282px' : '336px')};
  min-height: 160px;
  max-height: auto;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23B0B7BCFF' stroke-width='3' stroke-dasharray='4' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e");
  border-radius: 10px;
  display: flex;
  padding-top: 32px;
  padding-left: ${(props: any) => (props.isBountyLandingPage ? '10px' : '37px')};
  padding-right: ${(props: any) => (props.isBountyLandingPage ? '10px' : '0')};
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

const Bounties = (props: BountiesProps) => {
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
    isBountyLandingPage
  } = props;

  const color = colors['light'];
  const [openStartUpModel, setOpenStartUpModel] = useState<boolean>(false);
  const closeModal = () => setOpenStartUpModel(false);
  const showModal = () => setOpenStartUpModel(true);
  const [openConnectModal, setConnectModal] = useState<boolean>(false);
  const closeConnectModal = () => setConnectModal(false);
  const showConnectModal = () => setConnectModal(true);
  const [canAssignHunter, setCanAssignHunter] = useState(false);

  const { ui, main } = useStores();
  const userPubkey = ui.meInfo?.owner_pubkey;

  const checkUserRoles = useCallback(async () => {
    const canAssignHunter = await userCanManageBounty(org_uuid, userPubkey, main);
    const bountyOwner = ui.meInfo?.owner_pubkey === person.owner_pubkey;

    const canAssign = canAssignHunter || bountyOwner;
    setCanAssignHunter(canAssign);
  }, [main, org_uuid, userPubkey, person.owner_pubkey, ui.meInfo?.owner_pubkey]);

  useEffect(() => {
    checkUserRoles();
  }, [checkUserRoles]);

  return (
    <>
      {!!assignee?.owner_pubkey && !!assignee?.owner_alias ? (
        <BountyContainer
          assignedBackgroundImage={'url("/static/assigned_bounty_bg.svg")'}
          color={color}
          onClick={onPanelClick}
          style={{
            backgroundPositionY: '-2px'
          }}
        >
          <div className="BountyDescriptionContainer">
            <BountyDescription
              {...person}
              {...props}
              title={title}
              img={person.img}
              org_img={props.img}
              codingLanguage={codingLanguage}
              created={created}
              isBountyLandingPage={isBountyLandingPage}
            />
          </div>
          <div className="BountyPriceContainer">
            <BountyPrice
              priceMin={priceMin}
              priceMax={priceMax}
              price={price}
              sessionLength={sessionLength}
              style={{
                minWidth: '213px',
                maxWidth: '213px',
                borderRight: `1px solid ${color.primaryColor.P200}`
              }}
            />
            <BountyProfileView
              assignee={assignee}
              status={'ASSIGNED'}
              canViewProfile={true}
              statusStyle={{
                width: '55px',
                height: '16px',
                background: color.statusAssigned
              }}
              isBountyLandingPage={isBountyLandingPage}
            />
          </div>
        </BountyContainer>
      ) : (
        <BountyContainer color={color}>
          <DescriptionPriceContainer
            data-testid="description-price-container"
            unAssignedBackgroundImage={'url("/static/unassigned_bounty_bg.svg")'}
            isBountyLandingPage={isBountyLandingPage}
            onClick={onPanelClick}
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
                  maxWidth: isBountyLandingPage ? '220px' : '245px',
                  minWidth: isBountyLandingPage ? '220px' : '245px'
                }}
                isBountyLandingPage={isBountyLandingPage}
              />
            </div>

            <UnassignedPersonProfile
              unassigned_border={color.grayish.G300}
              grayish_G200={color.grayish.G200}
              isBountyLandingPage={isBountyLandingPage}
            >
              <div className="UnassignedPersonContainer">
                <img src="/static/unassigned_profile.svg" alt="" height={'100%'} width={'100%'} />
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
      )}
      {openStartUpModel && (
        <StartUpModal closeModal={closeModal} dataObject={'getWork'} buttonColor={'primary'} />
      )}
      <ConnectCard
        dismiss={() => closeConnectModal()}
        modalStyle={{ top: -64, height: 'calc(100% + 64px)' }}
        person={person}
        visible={openConnectModal}
        created={created}
      />
    </>
  );
};

export default observer(Bounties);
