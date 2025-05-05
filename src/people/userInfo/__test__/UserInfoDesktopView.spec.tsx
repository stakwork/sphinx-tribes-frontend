import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { UserInfoDesktopView } from 'people/userInfo/UserInfoDesktopView';
import nock from 'nock';
import { user } from '__test__/__mockData__/user';
import MockStoreEnvironment from '../../../__test__/__mockStore__/MockStoreEnvironment';
import { MOCK_ENVIRONMENT_HOOKS } from '__test__/__mockStore__/constants';
import { renderMarkdown } from 'people/utils/RenderMarkdown';

describe('Test for UserInfoDesktopView', () => {
  beforeEach(() => {
    nock(user.url).get('/person/id/1').reply(200, {});
  });

  const setShowSupport = jest.fn();

  it('Test that user profile photo is visible', async () => {
    render(
      <MockStoreEnvironment data-testid="user-info-desktop-view-component">
        <UserInfoDesktopView setShowSupport={setShowSupport} />
      </MockStoreEnvironment>
    );
    const profileImg = screen.getByTestId('profile-img');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toBeVisible();
  });

  it('Test that user connect QR button is rendered and upon clicking it renders connect modal on page', async () => {
    const user = render(
      <MockStoreEnvironment>
        <UserInfoDesktopView setShowSupport={setShowSupport} />
      </MockStoreEnvironment>
    );

    const qrIcon = screen.getByText('qr_code_2');
    expect(qrIcon).toBeInTheDocument();
    await act(async () => {
      user.getByText('qr_code_2').click();
      await waitFor(() => {
        const modal = user.getByTestId('connect-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toBeVisible();
      });
    });
  });

  it('Test that connect are rendered and open connect modal upon clicking', async () => {
    const user = render(
      <MockStoreEnvironment>
        <UserInfoDesktopView setShowSupport={setShowSupport} />
      </MockStoreEnvironment>
    );

    expect(user.getByText('Connect')).toBeInTheDocument();

    await act(async () => {
      user.getByText('Connect').click();
      await waitFor(() => {
        const modal = user.getByTestId('connect-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toBeVisible();
        expect(screen.getByText('Discuss this bounty with')).toBeInTheDocument();
        expect(screen.getByText('Connect with Sphinx')).toBeInTheDocument();
      });
    });
  });

  it('Test that send tip are rendered and open send tip modals upon clicking', async () => {
    render(
      <MockStoreEnvironment>
        <UserInfoDesktopView setShowSupport={setShowSupport} />
      </MockStoreEnvironment>
    );
    await act(async () => {
      const sendTip = screen.getByText('Send Tip');
      expect(sendTip).toBeInTheDocument();

      waitFor(async () => {
        fireEvent.click(sendTip);
        const modal = await screen.getByTestId('modal_support');
        expect(modal).toBeInTheDocument();
        expect(modal).toBeVisible();
        expect(screen.getByText('Support Me')).toBeInTheDocument();
        expect(screen.getByText('Donate')).toBeInTheDocument();
      });
    });
  });

  it('Test that description/bio for a user is visible if provided', async () => {
    render(
      <MockStoreEnvironment hooks={[MOCK_ENVIRONMENT_HOOKS.SELF_PROFILE_STORE]}>
        <UserInfoDesktopView setShowSupport={() => null} />
      </MockStoreEnvironment>
    );

    waitFor(() => {
      const description = screen.getByTestId('user-description');
      expect(description).toBeInTheDocument();
      expect(description).toBeVisible();
      expect(description.textContent).toEqual(user.description);
    });
  });

  it('Test that price to connect, pubkey , copy button, email if provided, and github account if provided are visible', async () => {
    render(
      <MockStoreEnvironment hooks={[MOCK_ENVIRONMENT_HOOKS.SELF_PROFILE_STORE]}>
        <UserInfoDesktopView setShowSupport={() => null} />
      </MockStoreEnvironment>
    );

    waitFor(() => {
      const price = screen.getByText('Price to Connect:');
      expect(price).toBeInTheDocument();
      expect(price.innerText).toEqual(user.price_to_meet);

      const pubkey = screen.getByTestId('pubkey_user');
      expect(pubkey).toBeInTheDocument();
      expect(pubkey.innerText).toEqual(user.pubkey);

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toBeInTheDocument();

      if (user.extras.email) {
        const email = screen.getByTestId('email-address');
        expect(email).toBeInTheDocument();
        expect(email.innerText).toEqual(user.extras.email[0].value);
      }

      if (user.extras.github) {
        const github = screen.getByTestId('github-tag');
        expect(github).toBeInTheDocument();
        expect(github.innerText).toEqual(user.extras.github[0].value);
      }
    });
  });

  it('Test that user skills are visible and rendered if provided', () => {
    render(
      <MockStoreEnvironment hooks={[MOCK_ENVIRONMENT_HOOKS.SELF_PROFILE_STORE]}>
        <UserInfoDesktopView setShowSupport={() => null} />
      </MockStoreEnvironment>
    );

    waitFor(() => {
      const skills = screen.getByTestId('user-skills');
      expect(skills).toBeInTheDocument();
      if (user.extras.coding_languages) {
        expect(skills.innerText).toEqual(user.extras.coding_languages[0].value);
      }
    });
  });
});
