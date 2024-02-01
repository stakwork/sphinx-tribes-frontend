import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { organizations } from '__test__/__mockData__/organization';
import {OrgHeader} from '../index';
import {defaultOrgBountyStatus} from '../../../../../store/main'

const organization = organizations[0];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    uuid: "cmkln4tm098m49vhlt80",
    id: '67'
  })
}));

describe('OrgHeader Component', () => {
  it('renders the component with organization logo and name', async () => {
    const url = 'https://people-test.sphinx.chat';

    nock(url).get(`/organizations/${organization.uuid}`).reply(200, organization);

    render(
      <OrgHeader
        organizationData={{}}
        onChangeStatus={jest.fn()}
        onChangeLanguage={jest.fn()}
        checkboxIdToSelectedMap={defaultOrgBountyStatus}
        checkboxIdToSelectedMapLanguage={{}}
        languageString={''}
        org_uuid={organization.uuid}
      />
    );

    
    waitFor(() => expect(screen.findByText(organization.name)).toBeInTheDocument());
    waitFor(() => expect(screen.findByAltText(`${organization.name} logo`)).toBeInTheDocument()); 
  });
});