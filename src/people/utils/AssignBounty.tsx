import React, { useEffect, useState } from 'react';
import { ConnectCardProps } from 'people/interfaces';
import { useStores } from 'store';
import { EuiGlobalToastList } from '@elastic/eui';
import moment from 'moment';
import { isInvoiceExpired } from 'helpers';
import Invoice from '../widgetViews/summaries/wantedSummaries/Invoice';
import { colors } from '../../config/colors';
import { Button, Modal } from '../../components/common';
import { InvoiceInput, InvoiceLabel, InvoiceForm, B, N, ModalBottomText } from './style';

let interval;

export default function AssignBounty(props: ConnectCardProps) {
  const color = colors['light'];
  const { visible } = props;
  const { main, ui } = useStores();

  const [bountyHours, setBountyHours] = useState(1);
  const [lnInvoice] = useState('');
  const [invoiceStatus] = useState(false);

  const pollMinutes = 2;

  const [toasts, setToasts]: any = useState([]);

  const removeToast = () => {
    setToasts([]);
  };

  useEffect(() => {
    if (main.assignInvoice !== '') {
      const expired = isInvoiceExpired(main.assignInvoice);
      if (expired) {
        main.setAssignInvoice('');
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [main]);

  return (
    <div onClick={(e: any) => e.stopPropagation()}>
      <Modal style={props.modalStyle} overlayClick={() => props.dismiss()} visible={visible}>
        <div style={{ textAlign: 'center', paddingTop: 59, width: 310 }}>
          <div
            style={{ textAlign: 'center', width: '100%', overflow: 'hidden', padding: '0 50px' }}
          >
            <N color={color}>Asign bounty to your self</N>
            <B>Each hour cost 200 sats</B>
            {lnInvoice && ui.meInfo?.owner_pubkey && (
              <Invoice
                startDate={new Date(moment().add(pollMinutes, 'minutes').format().toString())}
                invoiceStatus={invoiceStatus}
                lnInvoice={lnInvoice}
                invoiceTime={pollMinutes}
              />
            )}

            {!lnInvoice && ui.meInfo?.owner_pubkey && (
              <>
                <InvoiceForm>
                  <InvoiceLabel>Number Of Hours</InvoiceLabel>
                  <InvoiceInput
                    type="number"
                    value={bountyHours}
                    onChange={(e: any) => setBountyHours(Number(e.target.value))}
                  />
                </InvoiceForm>
                <Button
                  text={'Generate Invoice'}
                  color={'primary'}
                  style={{ paddingLeft: 25, margin: '12px 0 10px' }}
                  img={'sphinx_white.png'}
                  imgSize={27}
                  height={48}
                  width={'100%'}
                />
              </>
            )}
          </div>
        </div>
        <ModalBottomText color={color}>
          <img src="/static/scan_qr.svg" alt="scan" />
          <div className="bottomText">Pay the invoice to assign to your self</div>
        </ModalBottomText>
      </Modal>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </div>
  );
}
