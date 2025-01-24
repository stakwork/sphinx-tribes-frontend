/* eslint-disable no-unused-vars */
/* eslint-disable func-style */
import React, { useState } from 'react';
import { EuiText } from '@elastic/eui';
import { CodingViewProps } from 'people/interfaces';
import styled from 'styled-components';
import StatusDropdown from 'components/common/ProofStatusDropDown';
import { BountyReviewStatus } from 'store/interface';
import { uiStore } from 'store/ui';
import { bountyReviewStore } from '../../../../store/bountyReviewStore';
import { Divider, Modal } from '../../../../components/common';
import BountyProfileView from '../../../../bounties/BountyProfileView';
import ImageButton from '../../../../components/common/ImageButton';
import InvitePeopleSearch from '../../../../components/form/inputs/widgets/PeopleSearch';
import LoomViewerRecorder from '../../../utils/LoomViewerRecorder';
import { colors } from '../../../../config/colors';
import { renderMarkdown } from '../../../utils/RenderMarkdown';
import { formatPrice, satToUsd } from '../../../../helpers';
import {
  Heart,
  AddToFavorites,
  CopyLink,
  ShareOnTwitter,
  ViewTribe,
  ViewGithub,
  BountyEstimates
} from './Components';
import {
  ButtonRow,
  Pad,
  Img,
  GithubIconMobile,
  T,
  Y,
  P,
  D,
  B,
  LoomIconMobile,
  DeliverablesContainer,
  ProofContainer,
  Section,
  Title,
  Description,
  Status,
  UnassignedPersonProfile,
  AutoCompleteContainer
} from './style';
import { ICanHelpButton } from './Components';

export default function MobileView(props: CodingViewProps) {
  const {
    description,
    ticket_url,
    price,
    loomEmbedUrl,
    estimated_session_length,
    assignee,
    titleString,
    nametag,
    labels,
    payBounty,
    showPayBounty,
    owner_id,
    created,
    markPaidOrUnpaid,
    paid,
    estimated_completion_date,
    extraModalFunction,
    deliverables,
    id,
    bountyPaid,
    hasAccess,
    editAction,
    deleteAction,
    isEditButtonDisable,
    deletingState,
    enableDelete,
    bountyPending,
    isAssigned,
    assignedPerson,
    pillText,
    pillColor,
    changeAssignedPerson,
    setEnableDelete,
    assigneeHandlerOpen,
    assigneeValue,
    peopleList,
    handleAssigneeDetails,

  } = props;

  const color = colors['light'];
  const { proofs } = bountyReviewStore;
  const bountyID = id?.toString() || '';

  const handleAssigneeClose = () => {
    if (changeAssignedPerson && setEnableDelete) {
      changeAssignedPerson();
      setEnableDelete(false);
    }
  };

  const handleAssigneeOpen = () => {
    if (assigneeHandlerOpen && setEnableDelete) {
      assigneeHandlerOpen();
      setEnableDelete(true);
    }
  };

  const StyledUnassignedPersonProfile = styled(UnassignedPersonProfile)`
    padding-left: 0 !important;
    margin-top: 10 !important;
  `;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toasts, setToasts]: any = useState([]);
  const isAssigner = owner_id === uiStore._meInfo?.owner_pubkey;

  const handleStatusUpdate = async (proofId: string, status: BountyReviewStatus) => {
    try {
      console.log(proofId, status);
      await bountyReviewStore.updateProofStatus(bountyID, proofId, status);

      setToasts([
        {
          id: `${Math.random()}`,
          title: 'Status Updated',
          color: 'success',
          text: 'Proof status updated successfully'
        }
      ]);
    } catch (error: any) {
      setToasts([
        {
          id: `${Math.random()}`,
          title: 'Update Failed',
          color: 'danger',
          text: error.message || 'Failed to update proof status'
        }
      ]);
    }
  };

  return (
    <>
      {assigneeValue && (
        <Modal
          visible={true}
          envStyle={{
            borderRadius: '10px',
            background: color.pureWhite,
            maxHeight: '459px',
            width: '90%',
            margin: '0 auto'
          }}
          bigCloseImage={assigneeHandlerOpen}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: color.pureBlack,
            borderRadius: '50%',
            zIndex: 11
          }}
        >
          <AutoCompleteContainer color={color}>
            <EuiText className="autoCompleteHeaderText">Assign Developer</EuiText>
            <InvitePeopleSearch
              peopleList={peopleList || []}
              isProvidingHandler={true}
              handleAssigneeDetails={(value: any) => {
                handleAssigneeDetails && handleAssigneeDetails(value);
              }}
            />
          </AutoCompleteContainer>
        </Modal>
      )}
      {paid && (
        <Img
          src={'/static/paid_ribbon.svg'}
          style={{
            position: 'absolute',
            top: -1,
            right: 0,
            width: 64,
            height: 72,
            zIndex: 100,
            pointerEvents: 'none'
          }}
        />
      )}
      <div style={{ padding: 20, overflow: 'auto', height: 'calc(100% - 60px)' }}>
        <Pad>
          {!bountyPaid && hasAccess && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              <ImageButton
                buttonText={'Edit'}
                ButtonContainerStyle={{
                  width: '120px',
                  height: '40px'
                }}
                leadingImageSrc={'/static/editIcon.svg'}
                leadingImageContainerStyle={{
                  left: '10px'
                }}
                buttonAction={editAction}
                buttonTextStyle={{
                  paddingRight: '30px'
                }}
                disabled={isEditButtonDisable || bountyPending}
              />
              <ImageButton
                data-testid="delete-btn"
                buttonText={!deletingState ? 'Delete' : 'Deleting'}
                ButtonContainerStyle={{
                  width: '120px',
                  height: '40px'
                }}
                leadingImageSrc={'/static/Delete.svg'}
                leadingImageContainerStyle={{
                  left: '10px'
                }}
                disabled={enableDelete || bountyPending}
                buttonAction={deleteAction}
                buttonTextStyle={{
                  paddingRight: '30px'
                }}
              />
            </div>
          )}

          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {nametag}
          </div>

          <T>{titleString}</T>
          <StyledUnassignedPersonProfile
            unassigned_border={color.grayish.G300}
            grayish_G200={color.grayish.G200}
            color={color}
            style={{ marginBottom: '20px' }}
          >
            {!isAssigned && (
              <div className="UnassignedPersonContainer">
                <img src="/static/unassigned_profile.svg" alt="" height={'100%'} width={'100%'} />
              </div>
            )}

            {isAssigned ? (
              <div className="BountyProfileOuterContainerCreatorView">
                <BountyProfileView
                  assignee={!assignedPerson ? assignee : assignedPerson}
                  status={pillText || ''}
                  canViewProfile={false}
                  statusStyle={{
                    width: '66px',
                    height: '16px',
                    background: pillColor
                  }}
                  UserProfileContainerStyle={{
                    height: 48,
                    width: 'fit-content',
                    minWidth: 'fit-content',
                    padding: 0
                  }}
                  isNameClickable={true}
                  UserImageStyle={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '200px',
                    overflow: 'hidden'
                  }}
                  NameContainerStyle={{
                    height: '28px',
                    maxWidth: '154px'
                  }}
                  userInfoStyle={{
                    marginLeft: '12px'
                  }}
                />
                {!bountyPaid && !bountyPending && (
                  <div
                    data-testid="edit-btn"
                    className="AssigneeCloseButtonContainer"
                    onClick={handleAssigneeClose}
                  >
                    <img
                      src="/static/assignee_close.png"
                      alt="cross_icon"
                      height={'100%'}
                      width={'100%'}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="UnassignedPersonalDetailContainer">
                <ImageButton
                  buttonText={'Not Assigned'}
                  ButtonContainerStyle={{
                    width: '159px',
                    height: '48px',
                    background: color.pureWhite,
                    marginLeft: '-12px'
                  }}
                  buttonTextStyle={{
                    color: color.grayish.G50,
                    width: '114px',
                    paddingLeft: '20px'
                  }}
                  endImageSrc={'/static/addIcon.svg'}
                  endingImageContainerStyle={{
                    right: '34px',
                    fontSize: '12px'
                  }}
                  buttonAction={handleAssigneeOpen}
                />
              </div>
            )}
          </StyledUnassignedPersonProfile>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            {ticket_url && (
              <GithubIconMobile
                onClick={(e: any) => {
                  e.stopPropagation();
                  window.open(ticket_url, '_blank');
                }}
              >
                <img height={'100%'} width={'100%'} src="/static/github_logo.png" alt="github" />
              </GithubIconMobile>
            )}
            {loomEmbedUrl && (
              <LoomIconMobile
                onClick={(e: any) => {
                  e.stopPropagation();
                  window.open(loomEmbedUrl, '_blank');
                }}
              >
                <img height={'100%'} width={'100%'} src="/static/loom.png" alt="loomVideo" />
              </LoomIconMobile>
            )}
          </div>

          <EuiText
            style={{
              fontSize: '13px',
              color: color.grayish.G100,
              fontWeight: '500'
            }}
          >
            {estimated_session_length && 'Session:'}{' '}
            <span
              style={{
                fontWeight: '500',
                color: color.pureBlack
              }}
            >
              {estimated_session_length ?? ''}
            </span>
          </EuiText>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              marginTop: '10px',
              minHeight: '10px'
            }}
          >
            {(labels ?? []).map((x: any) => (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    height: '22px',
                    width: 'fit-content',
                    backgroundColor: color.grayish.G1000,
                    border: `1px solid ${color.grayish.G70}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    marginRight: '3px',
                    boxShadow: `1px 1px ${color.grayish.G70}`
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: color.black300
                    }}
                  >
                    {x.label}
                  </div>
                </div>
              </>
            ))}
          </div>

          {showPayBounty && payBounty}

          {!assignee && extraModalFunction && <ICanHelpButton onClick={extraModalFunction} />}

          <BountyEstimates
            completion_date={estimated_completion_date}
            session_length={estimated_session_length}
          />
          <ButtonRow style={{ margin: '10px 0' }}>
            <ViewGithub {...props} />
            <ViewTribe {...props} />
            <AddToFavorites {...props} />
            <CopyLink {...props} />
            <ShareOnTwitter
              issueCreated={created}
              ownerPubkey={owner_id}
              labels={labels}
              titleString={titleString}
            />
          </ButtonRow>

          {markPaidOrUnpaid}
          <LoomViewerRecorder readOnly loomEmbedUrl={loomEmbedUrl} style={{ marginBottom: 20 }} />

          <Divider />
          <Y>
            <P color={color}>
              <B color={color}>{formatPrice(price || 0)}</B> SAT /{' '}
              <B color={color}>{satToUsd(price || 0)}</B> USD
            </P>
            <Heart />
          </Y>
          <Divider style={{ marginBottom: 20 }} />
          <D color={color}>{renderMarkdown(description)}</D>
          {deliverables ? (
            <DeliverablesContainer>
              <div className="deliverablesContainer">
                <EuiText className="deliverablesHeading">Deliverables</EuiText>
                <EuiText className="deliverablesDesc">{deliverables}</EuiText>
              </div>
            </DeliverablesContainer>
          ) : null}

          <ProofContainer>
            <Section>
              <Title>Proof of Work</Title>
              {proofs[bountyID]?.length ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%'
                  }}
                >
                  {proofs[bountyID].map((proof: any, index: any) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        width: '100%'
                      }}
                    >
                      <Status style={{ flex: 0.3 }}>
                        <StatusDropdown
                          bountyId={bountyID}
                          proofId={proof.id}
                          currentStatus={proof.status}
                          isAssigner={isAssigner}
                          onStatusUpdate={handleStatusUpdate}
                          isMobile={true}
                        />
                      </Status>
                      <Description style={{ flex: 1, textAlign: 'left' }}>
                        {proof.description
                          .split(/(https?:\/\/[^\s]+)/)
                          .map((part: string, i: number) => {
                            if (part.match(/https?:\/\/[^\s]+/)) {
                              return (
                                <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                                  {part}
                                </a>
                              );
                            }
                            return part;
                          })}
                      </Description>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No proofs available</p>
              )}
            </Section>
          </ProofContainer>
        </Pad>
      </div>
    </>
  );
}
