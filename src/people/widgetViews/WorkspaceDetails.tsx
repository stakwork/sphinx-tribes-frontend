import React, { useCallback, useEffect, useState } from 'react';
import { useStores } from 'store';
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiGlobalToastList,
  useIsWithinBreakpoints,
  EuiIcon
} from '@elastic/eui';
import { Button } from 'components/common';
import {
  BountyRoles,
  defaultWorkspaceBudget,
  Workspace,
  WorkspaceBudget,
  PaymentHistory,
  Person
} from 'store/main';
import MaterialIcon from '@material/react-material-icon';
import { Route, Router, Switch, useRouteMatch } from 'react-router-dom';
import { satToUsd, userHasRole } from 'helpers';
import { BountyModal } from 'people/main/bountyModal';
import { Link } from 'react-router-dom';
import history from '../../config/history';
import avatarIcon from '../../public/static/profile_avatar.svg';
import balanceIcon from '../../public/static/toll.svg';
import balanceVector from '../../public/static/balancevector.svg';
import DeleteTicketModal from './DeleteModal';
import RolesModal from './workspace/RolesModal';
import HistoryModal from './workspace/HistoryModal';
import AddUserModal from './workspace/AddUserModal';
import AddBudgetModal from './workspace/AddBudgetModal';
import WithdrawBudgetModal from './workspace/WithdrawBudgetModal';
import EditWorkspaceModal from './workspace/EditWorkspaceModal';
import Users from './workspace/UsersList';

import {
  ActionWrap,
  Budget,
  BudgetSmallHead,
  BudgetWrap,
  Container,
  DetailsWrap,
  Grey,
  HeadButton,
  HeadButtonWrap,
  HeadNameWrap,
  HeadWrap,
  NoBudgetText,
  NoBudgetWrap,
  WorkspaceImg,
  WorkspaceName,
  UserWrap,
  UsersHeadWrap,
  UsersHeader,
  ViewBudgetTextWrap,
  BudgetData,
  ActionHeader,
  BalanceImg,
  BudgetStatsWrap,
  BalanceAmountImg,
  BudgetBountyLink,
  BudgetCount,
  BudgetHeaderWrap
} from './workspace/style';
import AssignUserRoles from './workspace/AssignUserRole';

let interval;

const WorkspaceDetails = (props: {
  close: () => void;
  org: Workspace | undefined;
  resetWorkspace: (Workspace) => void;
  getWorkspaces: () => Promise<void>;
}) => {
  const { main, ui } = useStores();

  const [loading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddUser, setIsOpenAddUser] = useState<boolean>(false);
  const [isOpenRoles, setIsOpenRoles] = useState<boolean>(false);
  const [isOpenBudget, setIsOpenBudget] = useState<boolean>(false);
  const [isOpenWithdrawBudget, setIsOpenWithdrawBudget] = useState<boolean>(false);
  const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
  const [isOpenEditWorkspace, setIsOpenEditWorkspace] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [orgBudget, setWorkspaceBudget] = useState<WorkspaceBudget>(defaultWorkspaceBudget);
  const [paymentsHistory, setPaymentsHistory] = useState<PaymentHistory[]>([]);
  const [disableFormButtons, setDisableFormButtons] = useState(false);
  const [users, setUsers] = useState<Person[]>([]);
  const [user, setUser] = useState<Person>();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [toasts, setToasts]: any = useState([]);
  const [invoiceStatus, setInvoiceStatus] = useState(false);
  const { path, url } = useRouteMatch();
  const [isOpenAssignRoles, setIsOpenAssignRoles] = useState<boolean>(false);

  const isWorkspaceAdmin = props.org?.owner_pubkey === ui.meInfo?.owner_pubkey;

  const editWorkspaceDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION');
  const viewReportDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT');
  const addBudgetDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'ADD BUDGET');
  const addWithdrawDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'WITHDRAW BUDGET');

  const { org, close, getWorkspaces } = props;
  const uuid = org?.uuid || '';
  const isMobile = useIsWithinBreakpoints(['xs', 's']);

  function addToast(title: string, color: 'danger' | 'success') {
    setToasts([
      {
        id: `${Math.random()}`,
        title,
        color
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const getWorkspaceUsers = useCallback(async () => {
    if (uuid) {
      const users = await main.getWorkspaceUsers(uuid);
      setUsers(users);
      return users;
    }
  }, [main, uuid]);

  const deleteWorkspaceUser = async (user: any) => {
    if (uuid) {
      const res = await main.deleteWorkspaceUser(user, uuid);

      if (res.status === 200) {
        addToast('User deleted successfully', 'success');
        await getWorkspaceUsers();
      } else {
        addToast('Error: could not delete user', 'danger');
      }
    }
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const confirmDelete = async () => {
    try {
      if (user) {
        await deleteWorkspaceUser(user);
      }
    } catch (error) {
      console.log(error);
    }
    closeDeleteModal();
  };

  const getUserRoles = useCallback(
    async (user: any) => {
      const pubkey = user.owner_pubkey;
      if (uuid && pubkey) {
        const userRoles = await main.getUserRoles(uuid, pubkey);
        setUserRoles(userRoles);
      }
    },
    [uuid, main]
  );

  const getWorkspaceBudget = useCallback(async () => {
    if (!viewReportDisabled) {
      const workspaceBudget = await main.getWorkspaceBudget(uuid);
      setWorkspaceBudget(workspaceBudget);
    }
  }, [main, uuid, viewReportDisabled]);

  const getPaymentsHistory = useCallback(async () => {
    if (!viewReportDisabled) {
      const paymentHistories = await main.getPaymentHistories(uuid, 1, 2000);

      if (Array.isArray(paymentHistories)) {
        const payments = paymentHistories.map((history: PaymentHistory) => {
          if (!history.payment_type) {
            history.payment_type = 'payment';
          }
          return history;
        });
        setPaymentsHistory(payments);
      }
    }
  }, [main, uuid, viewReportDisabled]);

  const handleSettingsClick = async (user: any) => {
    setUser(user);
    setIsOpenRoles(true);
    getUserRoles(user);
  };

  const handleDeleteClick = async (user: any) => {
    setUser(user);
    setShowDeleteModal(true);
  };

  const closeAddUserHandler = () => {
    setIsOpenAddUser(false);
  };

  const closeRolesHandler = () => {
    setIsOpenRoles(false);
  };

  const closeBudgetHandler = () => {
    setIsOpenBudget(false);
  };

  const closeHistoryHandler = () => {
    setIsOpenHistory(false);
  };

  const closeWithdrawBudgetHandler = () => {
    setIsOpenWithdrawBudget(false);
  };

  const closeAssignRolesHandler = () => {
    setIsOpenAssignRoles(false);
  };

  const onSubmitUser = async (body: any) => {
    setIsLoading(true);

    body.workspace_uuid = uuid;

    const res = await main.addWorkspaceUser(body);
    if (res.status === 200) {
      addToast('User added to workspace successfully', 'success');
      const recentUsers = await getWorkspaceUsers();
      const user = recentUsers?.filter((user: Person) => user.owner_pubkey === body.owner_pubkey);
      if (user?.length === 1) {
        setUser(user[0]);
        setIsOpenAssignRoles(true);
      }
    } else {
      addToast('Error: could not add user', 'danger');
    }
    closeAddUserHandler();
    setIsLoading(false);
  };

  const onDeleteWorkspace = async () => {
    const res = await main.workspaceDelete(uuid);
    if (res.status === 200) {
      addToast('Deleted workspace', 'success');
      if (ui.meInfo) {
        getWorkspaces();
        close();
      }
    } else {
      addToast('Error: could not delete workspace', 'danger');
    }
  };

  const submitRoles = async (bountyRoles: BountyRoles[]) => {
    const roleData = bountyRoles
      .filter((r: any) => r.status)
      .map((role: any) => ({
        owner_pubkey: user?.owner_pubkey,
        workspace_uuid: uuid,
        role: role.name
      }));

    if (uuid && user?.owner_pubkey) {
      const res = await main.addUserRoles(roleData, uuid, user.owner_pubkey);
      if (res.status === 200) {
        await main.getUserRoles(uuid, user.owner_pubkey);
      } else {
        addToast('Error: could not add user roles', 'danger');
      }
      setIsOpenRoles(false);
    }
  };

  const successAction = () => {
    setInvoiceStatus(true);
    main.setBudgetInvoice('');
    // get new workspace budget
    getWorkspaceBudget();
    getPaymentsHistory();
  };

  const pollInvoices = useCallback(async () => {
    let i = 0;
    interval = setInterval(async () => {
      try {
        await main.pollWorkspaceBudgetInvoices(uuid);
        getWorkspaceBudget();

        const count = await main.workspaceInvoiceCount(uuid);
        if (count === 0) {
          clearInterval(interval);
        }

        i++;
        if (i > 5) {
          if (interval) clearInterval(interval);
        }
      } catch (e) {
        console.warn('Poll invoices error', e);
      }
    }, 6000);
  }, []);

  useEffect(() => {
    pollInvoices();

    return () => {
      clearInterval(interval);
    };
  }, [pollInvoices]);

  async function startPolling(paymentRequest: string) {
    let i = 0;
    interval = setInterval(async () => {
      try {
        const invoiceData = await main.pollInvoice(paymentRequest);
        if (invoiceData) {
          if (invoiceData.success && invoiceData.response.settled) {
            successAction();
            clearInterval(interval);
          }
        }

        i++;
        if (i > 22) {
          if (interval) clearInterval(interval);
        }
      } catch (e) {
        console.warn('AddBudget Modal Invoice Polling Error', e);
      }
    }, 5000);
  }

  useEffect(() => {
    getWorkspaceUsers();
    getWorkspaceBudget();
    getPaymentsHistory();
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo);
    }
  }, [getWorkspaceUsers, getWorkspaceBudget, getPaymentsHistory, getUserRoles]);

  return (
    <Container>
      <HeadWrap>
        <HeadNameWrap>
          <MaterialIcon
            onClick={() => props.close()}
            icon={'arrow_back'}
            style={{
              fontSize: 25,
              cursor: 'pointer'
            }}
          />
          <WorkspaceImg src={org?.img || avatarIcon} />
          <WorkspaceName>{org?.name}</WorkspaceName>
        </HeadNameWrap>
        <HeadButtonWrap forSmallScreen={false}>
          <HeadButton
            text="Edit"
            data-testid="edit-button"
            color="white"
            disabled={editWorkspaceDisabled}
            onClick={() => setIsOpenEditWorkspace(true)}
            style={{ borderRadius: '5px' }}
          />
          <Link
            to={`/workspace/${uuid}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'none'
            }}
            target="_blank"
            data-testid="mission-link"
          >
            <Button
              disabled={editWorkspaceDisabled}
              text="Edit Mission"
              data-testid="mission-btn"
              color="white"
              style={{
                borderRadius: '5px',
                width: '100%'
              }}
              endingIcon="open_in_new"
            />
          </Link>
          <Link
            to={`/workspace/bounties/${uuid}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            target="_blank"
          >
            <Button
              disabled={!org?.bounty_count}
              text="View Bounties"
              data-testid="view-bounties"
              color="white"
              style={{ borderRadius: '5px', width: '100%' }}
              endingIcon="open_in_new"
            />
          </Link>
        </HeadButtonWrap>
      </HeadWrap>
      <ActionWrap>
        <ActionHeader>
          Balance <BalanceImg src={balanceIcon} />
        </ActionHeader>
        <HeadButtonWrap forSmallScreen={true}>
          <Button
            disabled={viewReportDisabled}
            text="History"
            data-testid="history-button"
            dataTestId="workspace-view-transaction-history-button"
            color="white"
            style={{ borderRadius: '5px' }}
            onClick={() => setIsOpenHistory(true)}
          />
          <Button
            disabled={addWithdrawDisabled}
            text="Withdraw"
            data-testid="withdrawal-button"
            dataTestId="workspace-withdraw-budget-button"
            color="withdraw"
            style={{ borderRadius: '5px' }}
            onClick={() => setIsOpenWithdrawBudget(true)}
          />
          <Button
            data-testid="deposit-button"
            disabled={addBudgetDisabled}
            text="Deposit"
            dataTestId="workspace-deposit-budget-button"
            color="success"
            style={{ borderRadius: '5px' }}
            onClick={() => setIsOpenBudget(true)}
          />
        </HeadButtonWrap>
      </ActionWrap>
      <BudgetWrap>
        {viewReportDisabled ? (
          <NoBudgetWrap>
            <MaterialIcon
              icon={'lock'}
              style={{
                fontSize: 30,
                cursor: 'pointer',
                color: '#ccc'
              }}
            />
            <NoBudgetText>
              You have restricted permissions and are unable to view the budget. Reach out to the
              workspace admin to get them updated.
            </NoBudgetText>
          </NoBudgetWrap>
        ) : (
          <BudgetStatsWrap>
            <EuiFlexGrid responsive={false} columns={isMobile ? 2 : 4}>
              <EuiFlexItem>
                <BudgetData background="#FAFBFC" borderColor="#DDE1E5">
                  <BudgetHeaderWrap>
                    <BudgetSmallHead color="#3C3F41">Current Balance</BudgetSmallHead>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget data-testid="current-balance-amount">
                      {orgBudget.current_budget ? orgBudget.current_budget.toLocaleString() : 0}{' '}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(orgBudget.current_budget)} <Grey>USD</Grey>
                    </Budget>
                  </ViewBudgetTextWrap>
                </BudgetData>
              </EuiFlexItem>
              <EuiFlexItem>
                <BudgetData background="#9157F612" borderColor="#A76CF34D">
                  <BudgetBountyLink>
                    <Link target="_blank" to={'/bounties?status=completed'}>
                      <EuiIcon type="popout" color="#9157F6" />
                    </Link>
                  </BudgetBountyLink>
                  <BudgetHeaderWrap>
                    <BudgetSmallHead color="#9157F6">Completed</BudgetSmallHead>
                    <BudgetCount color="#9157F6">
                      {orgBudget.completed_count ? orgBudget.completed_count.toLocaleString() : 0}
                    </BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {orgBudget.completed_budget ? orgBudget.completed_budget.toLocaleString() : 0}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(orgBudget.completed_budget)} <Grey>USD</Grey>
                    </Budget>
                  </ViewBudgetTextWrap>
                </BudgetData>
              </EuiFlexItem>
              <EuiFlexItem>
                <BudgetData background="#49C99812" borderColor="#49C9984D">
                  <BudgetBountyLink>
                    <Link target="_blank" to={'/bounties?status=assigned'}>
                      <EuiIcon type="popout" color="#2FB379" />
                    </Link>
                  </BudgetBountyLink>
                  <BudgetHeaderWrap>
                    <BudgetSmallHead color="#2FB379">Assigned</BudgetSmallHead>
                    <BudgetCount color="#2FB379">
                      {orgBudget.assigned_count ? orgBudget.assigned_count.toLocaleString() : 0}
                    </BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {orgBudget.assigned_budget ? orgBudget.assigned_budget.toLocaleString() : 0}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(orgBudget.assigned_budget)} <Grey>USD</Grey>
                    </Budget>
                  </ViewBudgetTextWrap>
                </BudgetData>
              </EuiFlexItem>
              <EuiFlexItem>
                <BudgetData background="#618AFF12" borderColor="#618AFF4D">
                  <BudgetBountyLink>
                    <Link target="_blank" to={'/bounties?status=open'}>
                      <EuiIcon type="popout" color="#5078F2" />
                    </Link>
                  </BudgetBountyLink>
                  <BudgetHeaderWrap>
                    <BudgetSmallHead color="#5078F2">Open</BudgetSmallHead>
                    <BudgetCount color="#5078F2">
                      {orgBudget.open_count ? orgBudget.open_count.toLocaleString() : 0}
                    </BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {orgBudget.open_budget ? orgBudget.open_budget.toLocaleString() : 0}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(orgBudget.open_budget)} <Grey>USD</Grey>
                    </Budget>
                  </ViewBudgetTextWrap>
                </BudgetData>
              </EuiFlexItem>
            </EuiFlexGrid>
          </BudgetStatsWrap>
        )}
      </BudgetWrap>
      <UserWrap>
        <UsersHeadWrap>
          <UsersHeader>Users</UsersHeader>
          <HeadButtonWrap forSmallScreen={false}>
            <Button
              disabled={editWorkspaceDisabled}
              text="Add User"
              data-testid="add-user"
              color="white"
              style={{
                borderRadius: '5px'
              }}
              onClick={() => setIsOpenAddUser(true)}
            />
          </HeadButtonWrap>
        </UsersHeadWrap>
        <Users
          org={org}
          handleDeleteClick={handleDeleteClick}
          handleSettingsClick={handleSettingsClick}
          userRoles={userRoles}
          users={users}
        />
      </UserWrap>
      <DetailsWrap>
        {isOpenEditWorkspace && (
          <EditWorkspaceModal
            isOpen={isOpenEditWorkspace}
            close={() => setIsOpenEditWorkspace(false)}
            onDelete={onDeleteWorkspace}
            org={org}
            resetWorkspace={props.resetWorkspace}
            addToast={addToast}
          />
        )}
        {showDeleteModal && (
          <DeleteTicketModal
            closeModal={closeDeleteModal}
            confirmDelete={confirmDelete}
            text={'User'}
            imgUrl={user?.img}
            userDelete={true}
          />
        )}
        {isOpenAddUser && (
          <AddUserModal
            isOpen={isOpenAddUser}
            close={closeAddUserHandler}
            onSubmit={onSubmitUser}
            disableFormButtons={disableFormButtons}
            setDisableFormButtons={setDisableFormButtons}
            loading={loading}
          />
        )}
        {isOpenAssignRoles && (
          <AssignUserRoles
            close={closeAssignRolesHandler}
            isOpen={isOpenAssignRoles}
            loading={loading}
            onSubmit={submitRoles}
            user={user}
            setLoading={setIsLoading}
            addToast={addToast}
          />
        )}
        {isOpenRoles && (
          <RolesModal
            uuid={uuid}
            user={user}
            addToast={addToast}
            close={closeRolesHandler}
            isOpen={isOpenRoles}
            submitRoles={submitRoles}
          />
        )}
        {isOpenBudget && (
          <AddBudgetModal
            isOpen={isOpenBudget}
            close={closeBudgetHandler}
            uuid={uuid}
            invoiceStatus={invoiceStatus}
            startPolling={startPolling}
            setInvoiceStatus={setInvoiceStatus}
          />
        )}
        {isOpenHistory && (
          <HistoryModal
            url={url}
            paymentsHistory={paymentsHistory}
            close={closeHistoryHandler}
            isOpen={isOpenHistory}
          />
        )}
        {isOpenWithdrawBudget && (
          <WithdrawBudgetModal
            uuid={uuid}
            isOpen={isOpenWithdrawBudget}
            close={closeWithdrawBudgetHandler}
            getWorkspaceBudget={getWorkspaceBudget}
          />
        )}
      </DetailsWrap>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
      <Router history={history}>
        <Switch>
          <Route path={`${path}/:wantedId/:wantedIndex`}>
            <BountyModal basePath={url} />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
};

export default WorkspaceDetails;
