/**
 * Commented out all superadmin restrictions for now
 * To enable colaborations
 */
import React, { useCallback, useEffect, useState } from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { BountyMetrics, defaultBountyStatus } from 'store/main';
import { useStores } from 'store';
import moment from 'moment';
import { useInViewPort } from 'hooks';
import { MyTable } from './tableComponent';
import { Header } from './header';
import { Statistics } from './statistics';
import AdminAccessDenied from './accessDenied';
import { normalizeMetrics } from './utils/metrics';
import { pageSize, visibleTabs } from './constants.ts';

const Container = styled.body`
  height: 100vh; /* Set a fixed height for the container */
  overflow-y: auto; /* Enable vertical scrolling */
  align-items: center;
  margin: 0px auto;
  padding: 4.5rem 0;
`;

const LoaderContainer = styled.div`
  height: 20%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SuperAdmin = () => {
  //Todo: Remove all comments when metrcis development is done
  const { main } = useStores();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bounties, setBounties] = useState<any[]>([]);
  const [bountyMetrics, setBountyMetrics] = useState<BountyMetrics | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(defaultBountyStatus);
  const [loading, setLoading] = useState(false);
  const [activeTabs, setActiveTabs] = useState<number[]>([]);
  const [totalBounties, setTotalBounties] = useState(0);

  /**
   * Todo use the same date range,
   * and status for all child components
   * */
  const [endDate, setEndDate] = useState(moment().unix());
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days').unix());
  const [inView, ref] = useInViewPort({
    rootMargin: '0px',
    threshold: 0.25
  });

  const onDateFilterChange = useCallback((option: string) => setSortOrder(option), []);

  const paginationLimit = Math.floor(totalBounties / pageSize) + 1;

  const getIsSuperAdmin = useCallback(async () => {
    const isSuperAdmin = await main.getSuperAdmin();
    setIsSuperAdmin(isSuperAdmin);
  }, [main]);

  useEffect(() => {
    getIsSuperAdmin();
  }, [getIsSuperAdmin]);

  const getBounties = useCallback(async () => {
    setLoading(true);
    if (startDate && endDate) {
      try {
        const bounties = await main.getBountiesByRange(
          {
            start_date: String(startDate),
            end_date: String(endDate)
          },
          {
            page: currentPage,
            resetPage: true,
            ...checkboxIdToSelectedMap,
            direction: sortOrder
          }
        );
        setBounties(bounties);
      } catch (error) {
        // Handle errors if any
        console.error('Error fetching total bounties:', error);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    }
  }, [main, startDate, endDate, checkboxIdToSelectedMap, sortOrder, currentPage]);

  useEffect(() => {
    getBounties();
  }, [getBounties, currentPage]);

  const onChangeStatus = (optionId: any) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId]
      }
    };
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  const getMetrics = useCallback(async () => {
    if (startDate && endDate) {
      try {
        const metrics = await main.getBountyMetrics(String(startDate), String(endDate));
        const normalizedMetrics = normalizeMetrics(metrics);
        setBountyMetrics(normalizedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }
  }, [main, startDate, endDate]);

  useEffect(() => {
    getMetrics();
  }, [getMetrics]);

  const getTotalBounties = useCallback(async () => {
    if (startDate && endDate) {
      const { Open, Assigned, Paid } = checkboxIdToSelectedMap;

      if (Open || Assigned || Paid) {
        const totalBounties = await main.getBountiesCountByRange(
          String(startDate),
          String(endDate),
          {
            ...checkboxIdToSelectedMap,
            direction: sortOrder
          }
        );
        setTotalBounties(totalBounties);
      } else {
        const totalBounties = await main.getBountiesCountByRange(
          String(startDate),
          String(endDate)
        );
        setTotalBounties(totalBounties);
      }
    }
  }, [main, startDate, endDate, checkboxIdToSelectedMap]);

  useEffect(() => {
    getTotalBounties();
  }, [getTotalBounties]);

  const getActiveTabs = useCallback(() => {
    const dataNumber: number[] = [];
    for (let i = 1; i <= Math.ceil(paginationLimit); i++) {
      if (i > visibleTabs) break;
      dataNumber.push(i);
    }

    setActiveTabs(dataNumber);
  }, [paginationLimit]);

  useEffect(() => {
    getActiveTabs();
  }, [getActiveTabs]);

  return (
    <>
      {!isSuperAdmin ? (
        <AdminAccessDenied />
      ) : (
        <Container>
          <Header
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <Statistics freezeHeaderRef={ref} metrics={bountyMetrics} />
          {loading ? (
            <LoaderContainer>
              <EuiLoadingSpinner size="l" />
            </LoaderContainer>
          ) : (
            <MyTable
              bounties={bounties}
              startDate={startDate}
              endDate={endDate}
              headerIsFrozen={inView}
              sortOrder={sortOrder}
              onChangeFilterByDate={onDateFilterChange}
              onChangeStatus={onChangeStatus}
              checkboxIdToSelectedMap={checkboxIdToSelectedMap}
              currentPage={currentPage}
              totalBounties={totalBounties}
              paginationLimit={paginationLimit}
              setCurrentPage={setCurrentPage}
              activeTabs={activeTabs}
              setActiveTabs={setActiveTabs}
            />
          )}
        </Container>
      )}
    </>
  );
};
