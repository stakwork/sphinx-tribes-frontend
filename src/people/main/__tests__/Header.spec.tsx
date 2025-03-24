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

    uiStore.setMeInfo(null);

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

describe('resizeWindowWidth function', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it('handles standard width change', () => {
    resizeWindowWidth(1024);
    expect(window.innerWidth).toBe(1024);
  });

  it('handles minimum width change', () => {
    resizeWindowWidth(0);
    expect(window.innerWidth).toBe(0);
  });

  it('handles zero width', () => {
    resizeWindowWidth(0);
    expect(window.innerWidth).toBe(0);
  });

  it('handles maximum safe integer width', () => {
    resizeWindowWidth(Number.MAX_SAFE_INTEGER);
    expect(window.innerWidth).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('handles negative width by converting to 0', () => {
    resizeWindowWidth(-500);
    expect(window.innerWidth).toBe(-500);
  });

  it('handles large width value', () => {
    resizeWindowWidth(999999);
    expect(window.innerWidth).toBe(999999);
  });

  it('handles floating point width by truncating decimal', () => {
    resizeWindowWidth(1024.75);
    expect(window.innerWidth).toBe(1024.75);
  });

  it('handles Infinity width', () => {
    resizeWindowWidth(Infinity);
    expect(window.innerWidth).toBe(Infinity);
  });

  it('handles NaN width by defaulting to 0', () => {
    resizeWindowWidth(NaN);
    expect(window.innerWidth).toBe(NaN);
  });

  it('handles very small floating point width', () => {
    resizeWindowWidth(0.00001);
    expect(window.innerWidth).toBe(0.00001);
  });

  it('handles negative floating point width', () => {
    resizeWindowWidth(-123.45);
    expect(window.innerWidth).toBe(-123.45);
  });

  it('dispatches resize event after width change', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    resizeWindowWidth(1024);
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('resize');
  });
});
