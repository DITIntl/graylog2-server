// @flow strict
import * as React from 'react';
import { cleanup, render, fireEvent } from 'wrappedTestingLibrary';
import { act } from 'react-dom/test-utils';
import asMock from 'helpers/mocking/AsMock';
import entityShareState from 'fixtures/entityShareState';
import selectEvent from 'react-select-event';

import { EntityShareStore, EntityShareAction } from 'stores/permissions/EntityShareStore';

import EntityShareModal from './EntityShareModal';

const mockEmptyStore = { state: undefined };

jest.mock('stores/permissions/EntityShareStore', () => ({
  EntityShareActions: {
    prepare: jest.fn(() => Promise.resolve()),
  },
  EntityShareStore: {
    listen: jest.fn(),
    getInitialState: jest.fn(() => mockEmptyStore),
  },
}));

describe('EntityShareModal', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanup);

  const SimpleEntityShareModal = ({ ...props }) => {
    return (
      <EntityShareModal description="The description"
                        entityId="grn::::dashboard:dead-beaf"
                        entityType="dashboard"
                        onClose={() => {}}
                        title="The title"
                        {...props} />
    );
  };

  it('show loading spinner while loading entity share state', () => {
    asMock(EntityShareStore.getInitialState).mockReturnValue(mockEmptyStore);
    const { getByText } = render(<SimpleEntityShareModal />);

    act(() => jest.advanceTimersByTime(200));

    expect(getByText('Loading...')).not.toBeNull();
  });

  it('list selected grantees', () => {
    asMock(EntityShareStore.getInitialState).mockReturnValue({ state: entityShareState });
    const ownerTitle = entityShareState.selectedGrantees.first().title;
    const { getByText } = render(<SimpleEntityShareModal />);

    expect(getByText(ownerTitle)).not.toBeNull();
  });

  it('should add selected grantee', async () => {
    asMock(EntityShareStore.getInitialState).mockReturnValue({ state: entityShareState });
    const ownerTitle = entityShareState.selectedGrantees.first().title;
    const { getByText, getByTestId } = render(<SimpleEntityShareModal />);

    const granteesSelect = getByTestId('grantees-select');

    await selectEvent.openMenu(granteesSelect);

    fireEvent.change(granteesSelect, { target: { value: 'grn::::user:john-id' } });

    const submitButton = getByText('Add Collaborator');

    fireEvent.click(submitButton);

    expect(EntityShareAction.prepare).toBeCalledWith('a', 'b');
  });
});
