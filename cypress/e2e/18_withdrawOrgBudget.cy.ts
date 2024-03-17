import { Decoder } from '@nuintun/qrcode';
const qrcode = new Decoder();

describe('It Withdraws from Organization budget', () => {
    it('It generates an invoice and withdraws from organization budget', async () => {
        cy.login('carol');

        // create org
        const org = {
            loggedInAs: 'carol',
            name: 'Withdrawsl Organization 1',
            description: 'We are testing out our oeganization',
            website: 'https://community.sphinx.chat',
            github: 'https://github.com/stakwork/sphinx-tribes-frontend'
        };

        cy.create_org(org);
        cy.wait(1000);

        cy.contains('Manage').click();

        const depositAmount = 10000;
        const withdrawAmount = 2000;

        // add organization budget
        cy.contains('Deposit').click();
        cy.get('[data-testid="input-amount"]').type(String(depositAmount));
        cy.get('[data-testid="generate-button"]').click();
        cy.contains('Invoice Created Successfully');
        cy.wait(4000);

        // get invoice from clipboard anf pay bounty
        cy.get('[data-challenge]')
            .invoke('attr', 'data-challenge')
            .then((value) => {
                cy.pay_invoice({ payersName: 'carol', invoice: value });
                cy.wait(4000);
                cy.contains('Successfully Deposited');
                cy.get('body').click(0, 0);
            });

        cy.contains('Manage').click();
        cy.wait(1000);

        // Withdraw organization budget
        cy.contains('Withdraw').click();
        cy.wait(1000);

        const invoice = cy.add_invoice({ payersName: 'alice', amount: withdrawAmount, memo: '' });


        cy.get('[data-testid="withdrawInvoiceInput"]').type(String(withdrawAmount));
        cy.contains('Confirm').click();
        cy.wait(1000);

        cy.contains('You are about to withdraw');
        cy.contains('Withdraw').click();
        cy.wait(2000);

        cy.contains('Successfully Withdraw');
        cy.contains(`${withdrawAmount} SATS`)
        cy.get('body').click(0, 0);

        // logout
        cy.logout('carol');
    });
});
