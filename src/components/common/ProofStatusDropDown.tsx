import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { EuiLoadingSpinner } from '@elastic/eui';
import { BountyReviewStatus } from '../../store/interface';
import { bountyReviewStore } from '../../store/bountyReviewStore';
import { colors } from '../../config/colors';

interface StatusDropdownProps {
  bountyId: string;
  proofId: string;
  currentStatus: BountyReviewStatus | null;
  isAssigner: boolean;
  onStatusUpdate: (proofId: string, status: BountyReviewStatus) => void;
  isMobile?: boolean;
  shouldSetAccepted?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = observer(
  ({
    proofId,
    currentStatus,
    isAssigner,
    onStatusUpdate,
    isMobile,
    shouldSetAccepted
  }: StatusDropdownProps) => {
    const { reviewLoading } = bountyReviewStore;
    const isLoading = reviewLoading[proofId];
    const color = colors.light;
    const [newCurrent, setNewCurrent] = useState(currentStatus);

    console.log(currentStatus);

    if (!isAssigner) {
      const getStatusBackgroundColor = (status: BountyReviewStatus | null): string => {
        switch (status) {
          case 'Accepted':
            return color.green1;
          case 'Rejected':
            return color.red1;
          case 'Change Requested':
            return color.orange1;
          default:
            return color.blue1;
        }
      };

      return isMobile ? (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '4px',
            backgroundColor: getStatusBackgroundColor(currentStatus),
            color: color.pureWhite,
            fontSize: '14px',
            marginBottom: '2px'
          }}
        >
          {currentStatus || '---'}
        </span>
      ) : (
        <span
          style={{
            marginLeft: '16px',
            padding: '4px 12px',
            borderRadius: '4px',
            backgroundColor: getStatusBackgroundColor(currentStatus),
            color: color.pureWhite,
            fontSize: '14px',
            marginBottom: '2px'
          }}
        >
          {currentStatus || '---'}
        </span>
      );
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value as BountyReviewStatus;
      console.log('newStatus', newStatus, 'proofId', proofId);
      setNewCurrent(newStatus);
      onStatusUpdate(proofId, newStatus);
    };

    React.useEffect(() => {
      if (shouldSetAccepted) {
        const acceptedStatus = 'Accepted' as BountyReviewStatus;
        setNewCurrent(acceptedStatus);
        onStatusUpdate(proofId, acceptedStatus);
      }
    }, [shouldSetAccepted, proofId, onStatusUpdate]);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative'
        }}
      >
        <select
          value={newCurrent || ''}
          onChange={handleStatusChange}
          disabled={isLoading}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            padding: '6px 32px 6px 12px',
            borderRadius: '4px',
            border: `1px solid ${color.grayish.G300}`,
            backgroundColor: color.pureWhite,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            minWidth: '140px',
            fontSize: '14px',
            fontFamily: 'inherit',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '16px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <option value="" disabled>
            Select Status
          </option>
          {['New', 'Accepted', 'Rejected', 'Change Requested'].map((status: any) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              right: '-28px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <EuiLoadingSpinner size="m" />
          </div>
        )}
      </div>
    );
  }
);

export default StatusDropdown;
