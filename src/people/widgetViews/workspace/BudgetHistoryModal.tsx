import React from 'react';
import { WorkspaceWrap } from 'components/form/style';
import { useIsMobile } from 'hooks/uiHooks';
import { nonWidgetConfigs } from 'people/utils/Constants';
import moment from 'moment';
import { BudgetHistory } from 'store/interface';
import { Modal } from '../../../components/common';
import { colors } from '../../../config/colors';
import { ModalTitle } from './style';
import { BudgetHistoryModalProps } from './interface';

const color = colors['light'];

const BudgetHistoryModal = (props: BudgetHistoryModalProps) => {
  const isMobile = useIsMobile();
  const { isOpen, close, budgetsHistory } = props;

  const config = nonWidgetConfigs['workspaceusers'];

  return (
    <Modal
      visible={isOpen}
      style={{
        height: '100%',
        flexDirection: 'column'
      }}
      envStyle={{
        marginTop: isMobile ? 64 : 0,
        background: color.pureWhite,
        zIndex: 20,
        ...(config?.modalStyle ?? {}),
        maxHeight: '100%',
        borderRadius: '10px'
      }}
      overlayClick={close}
      bigCloseImage={close}
      bigCloseImageStyle={{
        top: '-18px',
        right: '-18px',
        background: '#000',
        borderRadius: '50%'
      }}
     data-testid="budget-history-modal-component">
      <WorkspaceWrap>
        <ModalTitle>Budget history</ModalTitle>
        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {budgetsHistory.map((b: BudgetHistory, i: number) => (
              <tr key={i}>
                <td className="ellipsis">{b.sender_name}</td>
                <td>{b.amount} sats</td>
                <td>{b.payment_type}</td>
                <td>{b.status ? 'settled' : 'pending'}</td>
                <td>{moment(b.created).format('DD/MM/YY')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </WorkspaceWrap>
    </Modal>
  );
};

export default BudgetHistoryModal;
