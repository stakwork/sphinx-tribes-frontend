import { EuiText } from '@elastic/eui';
import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { Button, ButtonContainer, Divider } from 'components/common';
import { colors } from '../config/colors';

const ButtonSetContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 36px;
  padding-top: 39px;
  min-height: 300px;
`;

const ButtonSet = ({ showGithubBtn, ...props }: any) => {
  const color = colors['light'];
  return (
    <ButtonSetContainer
      style={{
        ...props.ButtonSetContainerStyle
      }}
     data-testid="button-set-component">
      {showGithubBtn && (
        <ButtonContainer onClick={props?.githubShareAction} color={color}>
          <div className="LeadingImageContainer">
            <img
              className="buttonImage"
              src={'/static/github_icon.svg'}
              alt={'github_ticket'}
              height={'20px'}
              width={'20px'}
            />
          </div>
          <EuiText className="ButtonText">Github Ticket</EuiText>
          <div className="ImageContainer">
            <img
              className="buttonImage"
              src={'/static/github_ticket.svg'}
              alt={'github_ticket'}
              height={'14px'}
              width={'14px'}
            />
          </div>
        </ButtonContainer>
      )}
      {props?.replitLink && (
        <ButtonContainer
          topMargin={'16px'}
          onClick={() => {
            window.open(props.replitLink[0]);
          }}
          color={color}
        >
          <div
            className="LeadingImageContainer"
            style={{
              marginLeft: '20px'
            }}
          >
            <img
              className="buttonImage"
              src={'/static/replit_icon.svg'}
              alt={'github_ticket'}
              height={'18px'}
              width={'14px'}
            />
          </div>
          <EuiText className="ButtonText">Replit</EuiText>
          <div className="ImageContainer">
            <img
              className="buttonImage"
              src={'/static/github_ticket.svg'}
              alt={'github_ticket'}
              height={'14px'}
              width={'14px'}
            />
          </div>
        </ButtonContainer>
      )}
      {typeof props.tribe === 'string' && props.tribe !== 'None' ? (
        <ButtonContainer
          topMargin={'16px'}
          onClick={() => {
            props?.tribeFunction();
          }}
          color={color}
        >
          <div
            className="LeadingImageContainer"
            style={{
              marginLeft: '6px',
              marginRight: '12px'
            }}
          >
            <img
              src={'/static/tribe_demo.svg'}
              alt={'github_ticket'}
              height={'32px'}
              width={'32px'}
            />
          </div>
          <EuiText className="ButtonText">
            {props.tribe.slice(0, 14)} {props.tribe.length > 14 && '...'}
          </EuiText>
          <div className="ImageContainer">
            <img
              className="buttonImage"
              src={'/static/github_ticket.svg'}
              alt={'github_ticket'}
              height={'14px'}
              width={'14px'}
            />
          </div>
        </ButtonContainer>
      ) : (
        <ButtonContainer
          topMargin={'16px'}
          color={color}
          style={{ pointerEvents: 'none', opacity: 0.5 }}
        >
          <div
            className="LeadingImageContainer"
            style={{
              marginLeft: '6px',
              marginRight: '12px'
            }}
          >
            <img
              src={'/static/tribe_demo.svg'}
              alt={'github_ticket'}
              height={'32px'}
              width={'32px'}
            />
          </div>
          <EuiText className="ButtonText">
            {props.tribe
              ? props.tribe.slice(0, 14) + (props.tribe.length > 14 ? '...' : '')
              : 'No Tribe'}
          </EuiText>
          <div className="ImageContainer">
            <img
              className="buttonImage"
              src={'/static/github_ticket.svg'}
              alt={'github_ticket'}
              height={'14px'}
              width={'14px'}
            />
          </div>
        </ButtonContainer>
      )}

      <ButtonContainer topMargin={'16px'} onClick={props.copyURLAction} color={color}>
        <div className="LeadingImageContainer">
          <img
            className="buttonImage"
            src={'/static/copy_icon_link.svg'}
            alt={'copy_link'}
            height={'20px'}
            width={'20px'}
          />
        </div>
        <EuiText className="ButtonText">{props.copyStatus}</EuiText>
      </ButtonContainer>
      <ButtonContainer topMargin={'16px'} onClick={props.twitterAction} color={color}>
        <div className="LeadingImageContainer">
          <img
            className="buttonImage"
            src={'/static/share_with_twitter.svg'}
            alt={'twitter'}
            height={'15px'}
            width={'19px'}
          />
        </div>
        <EuiText className="ButtonText">Share to Twitter</EuiText>
      </ButtonContainer>
      {props.isOwner && props.show === false && (
        <>
          <div
            style={{
              padding: '2px 16px',
              marginTop: '16px',
              backgroundColor: '#FFF8E1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MaterialIcon
              icon={'info_outline'}
              style={{
                fontSize: 20,
                color: '#FB8C00',
                marginRight: 8
              }}
            />
            <EuiText style={{ fontSize: '14px', color: '#5F6368' }}>
              This bounty isn&apos;t public.
            </EuiText>
          </div>
          <ButtonContainer
            topMargin={'16px'}
            onClick={props.generateShareableLinkAction}
            color={color}
          >
            <div style={{ marginLeft: 14, marginRight: 10 }}>
              <MaterialIcon
                icon={'link'}
                style={{
                  fontSize: 24,
                  marginTop: 10,
                  color: '#acb4bc'
                }}
              />
            </div>
            <EuiText className="ButtonText">Generate Shareable Link</EuiText>
          </ButtonContainer>
        </>
      )}
      <Divider style={{ marginTop: 20 }} />
      {props.showProof && (
        <Button
          iconSize={14}
          width={220}
          height={48}
          color="withdraw"
          onClick={props.showProofAction}
          style={{ marginTop: '30px', marginBottom: '-20px', textAlign: 'left' }}
          text="Submit Proof"
        />
      )}
    </ButtonSetContainer>
  );
};

export default ButtonSet;
