import { EuiLoadingSpinner, EuiText, EuiTitle } from '@elastic/eui';
import { colors } from 'config';
import { DollarConverter } from 'helpers';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import api from '../../../api';

const ChartContainer = styled.div`
  background-color: ${colors.light.pureWhite};
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);

  .chart-title {
    margin-bottom: 1rem;
  }

  .chart-content {
    height: 300px;
    width: 100%;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: ${colors.light.grayish.G100};
  }
`;

interface DailyEarning {
  date: string;
  total_sats: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: colors.light.pureWhite,
          padding: '10px',
          border: `1px solid ${colors.light.grayish.G600}`,
          borderRadius: '4px'
        }}
      >
        <p style={{ margin: 0 }}>{`Date: ${label}`}</p>
        <p style={{ margin: 0, color: colors.light.primaryColor.P300 }}>
          {`Sats: ${DollarConverter(payload[0].value)}`}
        </p>
      </div>
    );
  }

  return null;
};

const MonthlyChart = () => {
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyEarnings = async () => {
      try {
        setIsLoading(true);
        const data = await api.get('people/bounty/daily-earnings');
        setDailyEarnings(data || []);
      } catch (err) {
        console.error('Error fetching daily earnings:', err);
        setError('Failed to load daily earnings data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyEarnings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formattedData = dailyEarnings.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  if (isLoading) {
    return (
      <ChartContainer>
        <EuiTitle size="s" className="chart-title">
          <h3>Monthly Earnings (Last 30 Days)</h3>
        </EuiTitle>
        <div className="chart-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <EuiLoadingSpinner size="l" />
        </div>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <EuiTitle size="s" className="chart-title">
          <h3>Monthly Earnings (Last 30 Days)</h3>
        </EuiTitle>
        <div className="empty-state">
          <EuiText color="danger">{error}</EuiText>
        </div>
      </ChartContainer>
    );
  }

  if (!dailyEarnings.length) {
    return (
      <ChartContainer>
        <EuiTitle size="s" className="chart-title">
          <h3>Monthly Earnings (Last 30 Days)</h3>
        </EuiTitle>
        <div className="empty-state">
          <EuiText>No earnings data available for the past 30 days</EuiText>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <EuiTitle size="s" className="chart-title">
        <h3>Monthly Earnings (Last 30 Days)</h3>
      </EuiTitle>
      <div className="chart-content">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickMargin={5}
              axisLine={{ stroke: colors.light.grayish.G700 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => DollarConverter(value)}
              axisLine={{ stroke: colors.light.grayish.G700 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total_sats"
              fill={colors.light.primaryColor.P400}
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export { MonthlyChart };