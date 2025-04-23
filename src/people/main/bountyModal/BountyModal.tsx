import { Modal } from 'components/common';
import { useIsMobile, usePerson } from 'hooks';
import { widgetConfigs } from 'people/utils/Constants';
import React, { useEffect, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AccessDenied } from 'components/common/AccessDenied';
import { useStores } from 'store';
import { BountyModalProps } from 'people/interfaces';
import { PersonBounty } from 'store/interface';
import FocusedView from '../FocusView';

const config = widgetConfigs.bounties;
export const BountyModal = ({ basePath, fromPage, bountyOwner }: BountyModalProps) => {
  const history = useHistory();
  const { wantedId, wantedIndex, uuid } = useParams<{
    wantedId: string;
    wantedIndex: string;
    uuid: string;
  }>();

  const { ui, main } = useStores();
  const { person } = usePerson(ui.selectedPerson);
  const [bounty, setBounty] = useState<PersonBounty[]>([]);
  const [afterEdit, setAfterEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ToDisplay, setToDisplay] = useState<any>();
  const [hasAccess, setHasAccess] = useState(false);

  const personToDisplay = fromPage === 'usertickets' ? bountyOwner : person;

  const onGoBack = async () => {
    await main.getPersonCreatedBounties({}, uuid);
    await main.getPersonAssignedBounties({}, uuid);

    ui.setBountyPerson(0);
    history.push({
      pathname: basePath
    });
  };

  const checkAccess = useCallback(
    (bountyData: PersonBounty[]) => {
      if (!ui.meInfo?.owner_pubkey) {
        return false;
      }

      if (!bountyData || !bountyData[0]) return false;

      const bountyDetails = bountyData[0];

      const isBountyOwner = ui.meInfo?.owner_pubkey === bountyDetails.person?.owner_pubkey;

      const isWorkspaceOwner = ui.meInfo?.owner_pubkey === bountyDetails.body?.workspace_owner_id;

      const isAssignee = bountyDetails.body?.assignee?.owner_pubkey === ui.meInfo?.owner_pubkey;

      const isPublic = bountyDetails.body?.show !== false;

      return isBountyOwner || isWorkspaceOwner || isAssignee || isPublic;
    },
    [ui.meInfo]
  );

  const getBounty = useCallback(
    async (afterEdit?: boolean) => {
      /** check for the bounty length, else the request
       * will be made continously which will lead to an
       * infinite loop and crash the app
       */
      if (!ui.meInfo?.owner_pubkey) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      if ((wantedId && !bounty.length) || afterEdit) {
        try {
          const bountyData = await main.getBountyById(Number(wantedId));
          setBounty(bountyData);

          const canAccess = checkAccess(bountyData);
          setHasAccess(canAccess);

          if (personToDisplay === undefined) {
            setToDisplay(bountyData[0].person);
          } else {
            setToDisplay(personToDisplay);
          }
        } catch (error) {
          console.error('Error fetching bounty:', error);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      }
    },
    [bounty, main, wantedId, personToDisplay, checkAccess, ui.meInfo]
  );

  useEffect(() => {
    getBounty();
  }, [getBounty]);

  useEffect(() => {
    if (afterEdit) {
      getBounty(afterEdit);
      setAfterEdit(false);
    }
  }, [afterEdit, getBounty]);

  const isMobile = useIsMobile();

  if (loading) {
    return null;
  }

  if (!ui.meInfo?.owner_pubkey || !hasAccess) {
    return (
      <Modal
        visible={true}
        style={{
          background: 'rgba(0, 0, 0, 0.75)'
        }}
        envStyle={{
          maxHeight: '100vh',
          marginTop: 0,
          borderRadius: 0,
          background: '#fff',
          width: 'auto',
          minWidth: 500,
          maxWidth: '80%',
          zIndex: 20
        }}
        overlayClick={onGoBack}
       data-testid="bounty-modal-component">
        <AccessDenied onClose={onGoBack} />
      </Modal>
    );
  }

  if (isMobile) {
    return (
      <Modal visible={true} fill={true}>
        <FocusedView
          person={person}
          personBody={person}
          canEdit={false}
          selectedIndex={Number(wantedIndex)}
          config={config}
          goBack={onGoBack}
          getBounty={getBounty}
          setAfterEdit={setAfterEdit}
          bounty={bounty}
          fromBountyPage={true}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={true}
      style={{
        background: 'rgba( 0 0 0 /75% )'
      }}
      envStyle={{
        maxHeight: '100vh',
        marginTop: 0,
        borderRadius: 0,
        background: '#fff',
        width: 'auto',
        minWidth: 500,
        maxWidth: '80%',
        zIndex: 20
      }}
      overlayClick={onGoBack}
      bigCloseImage={onGoBack}
      bigCloseImageStyle={{
        top: '18px',
        right: '-50px',
        borderRadius: '50%'
      }}
    >
      <FocusedView
        person={ToDisplay}
        personBody={person}
        canEdit={false}
        selectedIndex={Number(wantedIndex)}
        config={config}
        bounty={bounty}
        goBack={() => {
          onGoBack();
        }}
        getBounty={getBounty}
        fromBountyPage={true}
        setAfterEdit={setAfterEdit}
      />
    </Modal>
  );
};
