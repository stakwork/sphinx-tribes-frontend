import React from 'react';
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
}

const StatusDropdown = observer(
  ({ bountyId, proofId, currentStatus, isAssigner, onStatusUpdate }: StatusDropdownProps) => {
    const { reviewLoading } = bountyReviewStore;
    const isLoading = reviewLoading[proofId];
    const color = colors['light'];

    console.log('StatusDropdown props:', { bountyId, proofId, currentStatus, isAssigner });

    if (!isAssigner) {
      return (
        <span
          style={{
            marginLeft: '16px',
            padding: '4px 12px',
            borderRadius: '4px',
            backgroundColor: color.grayish.G100,
            color: color.grayish.G600,
            fontSize: '14px'
          }}
        >
          {currentStatus || '---'}
        </span>
      );
    }

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
          value={currentStatus || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onStatusUpdate(proofId, e.target.value as BountyReviewStatus)
          }
          disabled={isLoading}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            padding: '6px 32px 6px 12px',
            borderRadius: '4px',
            border: `1px solid ${color.grayish.G300}`,
            backgroundColor: color.pureWhite,
            color: color.grayish.G600,
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
          <option value="New">New</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Change Requested">Change Requested</option>
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
