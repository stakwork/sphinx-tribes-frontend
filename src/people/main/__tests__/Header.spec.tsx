import '@testing-library/jest-dom';
import { act, fireEvent, render, waitFor, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import nock from 'nock';
import React from 'react';
import { Router } from 'react-router-dom';
import { mainStore } from 'store/main';
import { person } from '__test__/__mockData__/persons';
import { uiStore } from 'store/ui';
import { setupStore } from '../../../__test__/__mockData__/setupStore';
import { user } from '../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../__test__/__mockFn__/useHistory';
import Header from '../Header';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

const resizeWindowWidth = (x: number) => {
  window.innerWidth = x;
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('AboutView Component', () => {
  nock(user.url).get('/person/id/1').reply(200, {});
  nock(user.url).get(`/person/${user.uuid}`).reply(200, {});

  it('should not navigate to profile page if clicked on profile', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());
    const history = createMemoryHistory();
    history.push('/p');
    await act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const me = getByText(user.alias);
      fireEvent.click(me);
      expect(history.location.pathname).toEqual(`/p/${user.uuid}/workspaces`);
      expect(history.length).toEqual(3);
    });
  });

  it('should not add go to edit user page if already on it', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());
    const history = createMemoryHistory();
    history.push(`/p/${user.uuid}/workspaces`);
    await act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const me = getByText(user.alias);
      fireEvent.click(me);
      expect(history.location.pathname).toEqual(`/p/${user.uuid}/workspaces`);
      expect(history.length).toEqual(2);
    });
  });

  it('should render get sphinx button', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());
    const history = createMemoryHistory();
    await act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const getSphinxButton = getByText('Get Sphinx');
      expect(getSphinxButton).toBeInTheDocument();
    });
  });

  it('should render sign in button', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(null);
    const history = createMemoryHistory();
    act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const signInBtn = getByText('Sign in');
      expect(signInBtn).toBeInTheDocument();
    });
  });

  it('should render user image if signed in', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(user);
    const history = createMemoryHistory();
    await act(async () => {
      const { getByTestId } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const userImg = getByTestId('userImg');
      expect(userImg).toHaveAttribute('src', user.img);
    });
  });

  it('should not render sign in button for signed in user', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(user);
    const history = createMemoryHistory();
    await act(async () => {
      const { queryByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      const signInBtn = queryByText('Sign in');
      expect(signInBtn).not.toBeInTheDocument();
    });
  });

  it('Test that clicking on "Get Sphinx" button is visible and renders the startup modal on clicking', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(null);
    const history = createMemoryHistory();
    await act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      fireEvent.click(getByText('Get Sphinx'));
      await waitFor(() => {
        const iHaveSphinxButton = screen.getByText('Sign in');
        expect(iHaveSphinxButton).toBeInTheDocument();
      });
    });
  });

  it(' Test that clicking on "sign-in button", the sign-in component is rendered', async () => {
    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(null);
    const history = createMemoryHistory();
    act(async () => {
      const { getByText } = render(
        <Router history={history}>
          <Header />
        </Router>
      );
      fireEvent.click(getByText('Sign in'));
      expect(await screen.findByRole('button', { name: /Login with Sphinx/i })).toBeInTheDocument();
    });
  });

  test.each([
    1440, // Desktop
    1200,
    1024,
    950 // The lower end of desktop viewport
  ])('tests that username is visible at viewport width %ipx', async (width: number) => {
    resizeWindowWidth(width); // resize window width

    jest.spyOn(mainStore, 'getIsAdmin').mockReturnValue(Promise.resolve(false));
    jest.spyOn(mainStore, 'getPersonById').mockReturnValue(Promise.resolve(person));
    jest.spyOn(mainStore, 'getSelf').mockReturnValue(Promise.resolve());

    uiStore.setMeInfo(user);
    const history = createMemoryHistory();
    await act(async () => {
      render(
        <Router history={history}>
          <Header />
        </Router>
      );

      const usernameElement = screen.getByText(person.owner_alias);
      expect(usernameElement).toBeInTheDocument();

      await waitFor(() => {
        const isVisible = usernameElement.offsetParent === null;
        expect(isVisible).toBe(true);
      });
    });
  });
});
