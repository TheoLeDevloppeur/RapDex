import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { STORAGE_KEY } from '@/data/collection';

import { CollectionProvider, useCollection } from '../use-collection';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CollectionProvider>{children}</CollectionProvider>
);

async function mountCollection() {
  const view = await renderHook(() => useCollection(), { wrapper });
  await waitFor(() => expect(view.result.current.ready).toBe(true));
  return view;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useCollection', () => {
  it('démarre vide au premier lancement', async () => {
    const { result } = await mountCollection();
    expect(result.current.entries).toEqual([]);
  });

  it('ajoute, refuse les doublons et retire', async () => {
    const { result } = await mountCollection();

    let added = false;
    await act(async () => {
      added = result.current.add('laylow');
    });
    expect(added).toBe(true);
    expect(result.current.has('laylow')).toBe(true);

    await act(async () => {
      added = result.current.add('laylow');
    });
    expect(added).toBe(false);
    expect(result.current.entries).toHaveLength(1);

    await act(async () => {
      result.current.remove('laylow');
    });
    expect(result.current.entries).toEqual([]);
  });

  it('garde la collection après un redémarrage', async () => {
    const first = await mountCollection();
    await act(async () => {
      first.result.current.add('damso');
      first.result.current.add('laylow');
    });
    await waitFor(async () => expect(await AsyncStorage.getItem(STORAGE_KEY)).toContain('laylow'));
    await first.unmount();

    const second = await mountCollection();
    expect(second.result.current.entries.map((e) => e.id)).toEqual(['laylow', 'damso']);
  });
});
