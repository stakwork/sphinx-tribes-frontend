/* eslint-disable func-style */
import React, { useState } from 'react';
import { CodingLanguageLabel } from 'people/interfaces';
import { EuiText } from '@elastic/eui';
import moment from 'moment';
import styled from 'styled-components';
import { colors } from '../../../../config/colors';
import FavoriteButton from '../../../utils/FavoriteButton';
import { Button, Divider } from '../../../../components/common';
import { getSessionValue, sendToRedirect } from '../../../../helpers';
import IconButton from '../../../../components/common/IconButton2';
import { getTwitterLink } from './lib';
import { DividerContainer } from './style';
import ProcessStakeModal from './ProcessStakeModal';

export const Heart = () => <FavoriteButton />;

export const AddToFavorites = (props: any) => {
  if (props.tribe && props.tribe !== 'none') {
    return (
      <Button
        text={'Add to Favorites'}
        color={'white'}
        icon={'favorite_outline'}
        iconSize={18}
        iconStyle={{ left: 14 }}
        style={{
          fontSize: 14,
          height: 48,
          width: '100%',
          marginBottom: 20,
          paddingLeft: 5
        }}
      />
    );
  }
  return <></>;
};

export const ViewGithub = (props: any) => {
  const { ticket_url, repo, issue } = props;

  if (ticket_url) {
    return (
      <Button
        text={'Github Ticket'}
        color={'white'}
        endingIcon={'launch'}
        iconSize={14}
        style={{ fontSize: 14, height: 48, width: '100%', marginBottom: 20 }}
        onClick={() => {
          const repoUrl = ticket_url ? ticket_url : `https://github.com/${repo}/issues/${issue}`;
          sendToRedirect(repoUrl);
        }}
      />
    );
  }

  return <></>;
};

export const CopyLink = (props: any) => {
  const { isCopied, handleCopyUrl } = props;

  return (
    <Button
      text={isCopied ? 'Copied' : 'Copy Link'}
      color={'white'}
      icon={'content_copy'}
      iconSize={18}
      iconStyle={{ left: 14 }}
      style={{
        fontSize: 14,
        height: 48,
        width: '100%',
        marginBottom: 20,
        paddingLeft: 5
      }}
      onClick={handleCopyUrl}
    />
  );
};

type ShareOnTwitterProps = {
  titleString?: string;
  labels?: Array<CodingLanguageLabel>;
  issueCreated?: number;
  ownerPubkey?: string;
};
export const ShareOnTwitter = ({
  titleString,
  labels,
  issueCreated,
  ownerPubkey
}: ShareOnTwitterProps) => {
  if (!(titleString && issueCreated && ownerPubkey)) {
    return null;
  }
  const twitterHandler = () => {
    const twitterLink = getTwitterLink({
      title: titleString,
      labels,
      issueCreated: String(issueCreated),
      ownerPubkey
    });

    sendToRedirect(twitterLink);
  };

  return (
    <Button
      text={'Share to Twitter'}
      color={'white'}
      icon={'share'}
      iconSize={18}
      iconStyle={{ left: 14 }}
      style={{
        fontSize: 14,
        height: 48,
        width: '100%',
        marginBottom: 20,
        paddingLeft: 5
      }}
      onClick={twitterHandler}
    />
  );
};

export const ViewTribe = (props: any) => {
  const { tribe, tribeInfo } = props;

  const isTribeValid = tribe && tribe.toLowerCase() !== 'none';

  return (
    <Button
      text={'View Tribe'}
      color={'white'}
      leadingImgUrl={tribeInfo && isTribeValid ? tribeInfo.img : ' '}
      endingIcon={'launch'}
      iconSize={14}
      imgStyle={{ position: 'absolute', left: 10 }}
      style={{
        fontSize: 14,
        height: 48,
        width: '100%',
        marginBottom: 20,
        opacity: isTribeValid ? 1 : 0.5,
        pointerEvents: isTribeValid ? 'auto' : 'none'
      }}
      onClick={() => {
        if (isTribeValid) {
          const profileUrl = `https://community.sphinx.chat/t/${tribe}`;
          sendToRedirect(profileUrl);
        }
      }}
      disabled={!isTribeValid}
    />
  );
};

type BountyEstimatesProp = {
  completion_date?: string;
  session_length?: string;
};
export const BountyEstimates = (props: BountyEstimatesProp) => {
  const color = colors['light'];
  const SessionContainer = styled.div`
    padding-left: 20px;
    .schedule_img {
      padding-left: 17px;
    }
    .session_text {
      font-size: 13px;
      font-weight: 700;
      color: ${color.grayish.G10};
      font-family: 'Barlow';
      display: flex;
      flex-direction: column;
    }
    .label_text {
      font-weight: 400;
      font-family: 'Barlow';
    }
  `;

  return (
    <>
      {props.completion_date || props.session_length ? (
        <DividerContainer>
          <Divider />
        </DividerContainer>
      ) : (
        <></>
      )}
      <div className="d-flex align-items-center">
        {props.completion_date || props.session_length ? (
          <SessionContainer>
            <img className="schedule_img" src="/static/schedule.svg" alt="" />
          </SessionContainer>
        ) : (
          <></>
        )}
        {props.session_length ? (
          <SessionContainer>
            <EuiText className="session_text">
              <span
                className="label_text"
                style={{
                  color: color.grayish.G100
                }}
              >
                Estimate:
              </span>{' '}
              <span>{getSessionValue(props.session_length || '') || props.session_length}</span>
            </EuiText>
          </SessionContainer>
        ) : (
          <></>
        )}
        {props.completion_date ? (
          <SessionContainer>
            <EuiText className="session_text">
              <span
                className="label_text"
                style={{
                  color: color.grayish.G100
                }}
              >
                Due date:
              </span>{' '}
              <span>
                {props.completion_date ? moment(props.completion_date).format('MMM DD, YYYY') : ''}
              </span>
            </EuiText>
          </SessionContainer>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

type ICanHelpButtonProps = {
  onClick: () => void;
};

export const ICanHelpButton = ({ onClick }: ICanHelpButtonProps) => {
  const color = colors['light'];

  return (
    <IconButton
      text={'I can help'}
      endingIcon={'arrow_forward'}
      width={153}
      height={48}
      onClick={onClick}
      color="primary"
      hovercolor={color.button_secondary.hover}
      activecolor={color.button_secondary.active}
      shadowcolor={color.button_secondary.shadow}
      iconSize={'16px'}
      iconStyle={{
        top: '16px',
        right: '14px'
      }}
      textStyle={{
        width: '106px',
        display: 'flex',
        justifyContent: 'flex-start',
        fontFamily: 'Barlow'
      }}
    />
  );
};

type SelfAssignButtonProps = {
  onClick: () => void;
  stakeMin: number;
  EstimatedSessionLength: string;
  workspaceUuid?: string;
  bountyId?: number;
};

export const SelfAssignButton = ({
  onClick,
  stakeMin,
  EstimatedSessionLength,
  workspaceUuid,
  bountyId
}: SelfAssignButtonProps) => {
  const color = colors['light'];
  const [showStakeModal, setShowStakeModal] = useState(false);

  const handleClick = () => {
    if (bountyId && workspaceUuid) {
      setShowStakeModal(true);
    } else {
      onClick();
    }
  };

  return (
    <>
      <div style={{ width: '100%', marginTop: '16px' }}>
        <IconButton
          text={'Self Assign'}
          endingIcon={'arrow_forward'}
          width={'100%'}
          height={48}
          onClick={handleClick}
          color="primary"
          hovercolor={color.button_secondary.hover}
          activecolor={color.button_secondary.active}
          shadowcolor={color.button_secondary.shadow}
          iconSize={'16px'}
          iconStyle={{
            top: '16px',
            right: '14px'
          }}
          textStyle={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'Barlow'
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 8
          }}
        >
          <span style={{ fontSize: 12, color: color.grayish.G100 }}>
            Deposit this amount to Self Assign
          </span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{stakeMin?.toLocaleString()} SAT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: color.grayish.G100 }}>Time to Complete</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{EstimatedSessionLength}</span>
        </div>
      </div>

      {showStakeModal && bountyId && workspaceUuid && (
        <ProcessStakeModal
          isOpen={showStakeModal}
          onClose={() => setShowStakeModal(false)}
          bountyId={bountyId}
          stakeMin={stakeMin}
          workspaceUuid={workspaceUuid}
        />
      )}
    </>
  );
};
