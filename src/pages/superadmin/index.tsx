/**
 * Commented out all superadmin restrictions for now
 * To enable colaborations
 */
import React, { useCallback, useEffect, useState } from 'react';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { BountyMetrics, defaultSuperAdminBountyStatus, Person } from 'store/interface';
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
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(
    defaultSuperAdminBountyStatus
  );
  const [loading, setLoading] = useState(false);
  const [activeTabs, setActiveTabs] = useState<number[]>([]);
  const [totalBounties, setTotalBounties] = useState(0);
  const [search, setSearch] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [providersCurrentPage, setProvidersCurrentPage] = useState(1);
  const [providersCheckboxSelected, setProvidersCheckboxSelected] = useState<Person[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string>('');
  const [workspace, setWorkspace] = useState<string>('');
  const [toasts, setToasts]: any = useState([]);

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

  const addToast = (title: string, color: 'success' | 'error') => {
    setToasts([
      {
        id: `${Math.random()}`,
        title,
        color
      }
    ]);
  };

  const removeToast = () => {
    setToasts([]);
  };

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
            direction: sortOrder,
            workspace: workspace,
            provider: selectedProviders
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
  }, [main, startDate, endDate, sortOrder, currentPage, selectedProviders, workspace, search]);

  const getProviders = useCallback(
    async (curPage?: number) => {
      try {
        const providersData = await main.getProviderList(
          {
            start_date: String(startDate),
            end_date: String(endDate)
          },
          {
            page: curPage ? curPage : 1,
            ...checkboxIdToSelectedMap,
            direction: sortOrder
          }
        );

        if (curPage && curPage > 1) {
          setProvidersCurrentPage(curPage);
          setProviders((prev: Person[]) => {
            // Create a new array combining previous and new providers
            const combinedProviders = [...prev, ...providersData];
            // Filter out duplicates based on 'owner_pubkey'
            const uniqueProviders = combinedProviders.reduce((acc: Person[], current: Person) => {
              const x = acc.find((item: Person) => item.owner_pubkey === current.owner_pubkey);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);
            return uniqueProviders;
          });
        } else {
          setProviders(providersData);
        }
      } catch (error) {
        // Handle errors if any
        console.error('Error fetching providers:', error);
      }
    },
    [main, startDate, endDate, checkboxIdToSelectedMap, sortOrder]
  );

  useEffect(() => {
    getBounties();
    setSearch(false);
  }, [getBounties]);

  useEffect(() => {
    getBounties();
  }, []);

  useEffect(() => {
    getProviders();
  }, [getProviders]);

  const onClickApply = () => {
    setSearch(true);
  };

  const onChangeStatus = (optionId: any) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId]
      }
    };

    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  const handleProviderSelection = (provider: Person) => {
    if (providersCheckboxSelected.some((p: Person) => p.owner_pubkey === provider.owner_pubkey)) {
      setProvidersCheckboxSelected(
        providersCheckboxSelected.filter((p: Person) => p.owner_pubkey !== provider.owner_pubkey)
      );
    } else {
      setProvidersCheckboxSelected([...providersCheckboxSelected, provider]);
    }
  };

  const handleClearButtonClick = () => {
    setSelectedProviders('');
    setProvidersCheckboxSelected([]);
  };

  const handleApplyButtonClick = () => {
    const selectedProviders: string = providers
      .filter((provider: Person) =>
        providersCheckboxSelected.find(
          (providersCheckboxSelected: Person) =>
            providersCheckboxSelected.owner_pubkey === provider.owner_pubkey
        )
      )
      .map((provider: Person) => provider.owner_pubkey)
      .join(',');

    setSelectedProviders(selectedProviders);
  };

  const getMetrics = useCallback(async () => {
    if (startDate && endDate) {
      try {
        const metrics = await main.getBountyMetrics(String(startDate), String(endDate), workspace);
        const normalizedMetrics = normalizeMetrics(metrics);
        setBountyMetrics(normalizedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }
  }, [main, startDate, endDate, workspace]);

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
            direction: sortOrder,
            provider: selectedProviders,
            workspace
          }
        );
        setTotalBounties(totalBounties);
      } else {
        const totalBounties = await main.getBountiesCountByRange(
          String(startDate),
          String(endDate),
          {
            provider: selectedProviders,
            workspace
          }
        );
        setTotalBounties(totalBounties);
      }
    }
  }, [main, startDate, endDate, checkboxIdToSelectedMap, selectedProviders, workspace]);

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
            addToast={addToast}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            workspace={workspace}
            setWorkspace={setWorkspace}
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
              clickApply={onClickApply}
              onChangeStatus={onChangeStatus}
              checkboxIdToSelectedMap={checkboxIdToSelectedMap}
              currentPage={currentPage}
              totalBounties={totalBounties}
              paginationLimit={paginationLimit}
              setCurrentPage={setCurrentPage}
              activeTabs={activeTabs}
              setActiveTabs={setActiveTabs}
              providers={providers}
              providersCheckboxSelected={providersCheckboxSelected}
              handleProviderSelection={handleProviderSelection}
              handleClearButtonClick={handleClearButtonClick}
              handleApplyButtonClick={handleApplyButtonClick}
              getProviders={getProviders}
              providersCurrentPage={providersCurrentPage}
            />
          )}
          <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
        </Container>
      )}
    </>
  );
};
