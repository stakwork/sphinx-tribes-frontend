import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import MaterialIcon from '@material/react-material-icon';
import { Workspace, WorkspaceBudget, defaultWorkspaceBudget } from 'store/interface';

import { satToUsd, userHasRole } from 'helpers';
import { useStores } from 'store';
import { EuiFlexGrid, EuiFlexItem, useIsWithinBreakpoints, EuiIcon } from '@elastic/eui';
import { Link } from 'react-router-dom';
import balanceVector from '../../public/static/balancevector.svg';
import {
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

export const BudgetWrapComponent = (props: { org: Workspace | undefined; uuid: string }) => {
  const { uuid } = props;
  const { main, ui } = useStores();
  const isWorkspaceAdmin = props.org?.owner_pubkey === ui.meInfo?.owner_pubkey;
  const [orgBudget, setWorkspaceBudget] = useState<WorkspaceBudget>(defaultWorkspaceBudget);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const isMobile = useIsWithinBreakpoints(['xs', 's']);
  const viewReportDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT');

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

  useEffect(() => {
    getWorkspaceBudget();
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo);
    }
  }, [getWorkspaceBudget, getUserRoles]);

  return (
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
  );
};
