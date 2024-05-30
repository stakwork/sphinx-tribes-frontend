import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import MaterialIcon from '@material/react-material-icon';
import {
  Workspace,
  WorkspaceBudget,
  defaultWorkspaceBudget,
  PaymentHistory
} from 'store/interface';
import { satToUsd, userHasRole } from 'helpers';
import { useStores } from 'store';
import { EuiFlexGrid, EuiFlexItem, useIsWithinBreakpoints, EuiIcon } from '@elastic/eui';
import { Link, useRouteMatch } from 'react-router-dom';
import { Button } from 'components/common';
import balanceIcon from '../../public/static/toll.svg';
import balanceVector from '../../public/static/balancevector.svg';
import {
  ActionWrap,
  HeadButtonWrap,
  ActionHeader,
  BalanceImg,
  Budget,
  BudgetSmallHead,
  BudgetWrap,
  Grey,
  NoBudgetText,
  NoBudgetWrap,
  ViewBudgetTextWrap,
  BudgetData,
  BudgetStatsWrap,
  BalanceAmountImg,
  BudgetBountyLink,
  BudgetCount,
  BudgetHeaderWrap
} from './workspace/style';

import HistoryModal from './workspace/HistoryModal';
import WithdrawBudgetModal from './workspace/WithdrawBudgetModal';
import AddBudgetModal from './workspace/AddBudgetModal';

export const BudgetWrapComponent = (props: { org: Workspace | undefined; uuid: string }) => {
  const { url } = useRouteMatch();
  const { uuid } = props;
  const { main, ui } = useStores();
  const [orgBudget, setWorkspaceBudget] = useState<WorkspaceBudget>(defaultWorkspaceBudget);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const isMobile = useIsWithinBreakpoints(['xs', 's']);
  const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
  const [isOpenWithdrawBudget, setIsOpenWithdrawBudget] = useState<boolean>(false);
  const [isOpenBudget, setIsOpenBudget] = useState<boolean>(false);
  const [paymentsHistory, setPaymentsHistory] = useState<PaymentHistory[]>([]);
  const [invoiceStatus, setInvoiceStatus] = useState(false);

  const closeHistoryHandler = () => {
    setIsOpenHistory(false);
  };
  const closeWithdrawBudgetHandler = () => {
    setIsOpenWithdrawBudget(false);
  };
  const closeBudgetHandler = () => {
    setIsOpenBudget(false);
  };

  const isWorkspaceAdmin =
    props.org?.owner_pubkey &&
    ui.meInfo?.owner_pubkey &&
    props.org?.owner_pubkey === ui.meInfo?.owner_pubkey;

  const addWithdrawDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'WITHDRAW BUDGET');

  const viewReportDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT');

  const addBudgetDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'ADD BUDGET');

  const getWorkspaceBudget = useCallback(async () => {
    if (!viewReportDisabled) {
      const workspaceBudget = await main.getWorkspaceBudget(uuid);
      setWorkspaceBudget(workspaceBudget);
    }
  }, [main, uuid, viewReportDisabled]);

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

  let interval;

  const successAction = () => {
    setInvoiceStatus(true);
    main.setBudgetInvoice('');
    // get new workspace budget
    getWorkspaceBudget();
    getPaymentsHistory();
  };

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
    getPaymentsHistory();
    getWorkspaceBudget();
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo);
    }
  }, [getWorkspaceBudget, getPaymentsHistory, getUserRoles, uuid, ui.meInfo]);

  const orgBudgetText = orgBudget && orgBudget.current_budget ? orgBudget.current_budget : 0;
  const completedCountText = orgBudget && orgBudget.completed_count ? orgBudget.completed_count : 0;
  const completedBudget = orgBudget && orgBudget.completed_budget ? orgBudget.completed_budget : 0;
  const assignedCountText = orgBudget && orgBudget.assigned_count ? orgBudget.assigned_count : 0;
  const assignedBudget = orgBudget && orgBudget.assigned_budget ? orgBudget.assigned_budget : 0;
  const openCountText = orgBudget && orgBudget.open_count ? orgBudget.open_count : 0;
  const openBudget = orgBudget && orgBudget.open_budget ? orgBudget.open_budget : 0;

  return (
    <>
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
                      {orgBudgetText.toLocaleString()} <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(orgBudgetText)} <Grey>USD</Grey>
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
                    <BudgetCount color="#9157F6">{completedCountText.toLocaleString()}</BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {completedBudget.toLocaleString()}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(completedBudget)} <Grey>USD</Grey>
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
                    <BudgetCount color="#2FB379">{assignedCountText.toLocaleString()}</BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {assignedBudget.toLocaleString()}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(assignedBudget)} <Grey>USD</Grey>
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
                    <BudgetCount color="#5078F2">{openCountText.toLocaleString()}</BudgetCount>
                  </BudgetHeaderWrap>
                  <ViewBudgetTextWrap>
                    <Budget>
                      {openBudget.toLocaleString()}
                      <Grey>SATS</Grey>
                    </Budget>
                    <Budget className="budget-small">
                      <BalanceAmountImg src={balanceVector} />
                      {satToUsd(openBudget)} <Grey>USD</Grey>
                    </Budget>
                  </ViewBudgetTextWrap>
                </BudgetData>
              </EuiFlexItem>
            </EuiFlexGrid>
          </BudgetStatsWrap>
        )}
      </BudgetWrap>
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
    </>
  );
};
