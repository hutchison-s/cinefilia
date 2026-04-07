import { browser } from '$app/environment';
import { get, writable, type Writable } from 'svelte/store';
import type { HomeDiscoveryPayload } from '$lib/types/homeDiscovery';

type HomeDiscoveryState = HomeDiscoveryPayload & {
  userId: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
};

const STORAGE_KEY = 'cinefilia.home-discovery';

const emptyPayload: HomeDiscoveryPayload = {
  inTheaters: [],
  recommendationSections: []
};

const initialState: HomeDiscoveryState = {
  userId: null,
  status: 'idle',
  error: null,
  ...emptyPayload
};

let pendingRequest: Promise<void> | null = null;

function hasHomeDiscoveryPayload(
  value: Partial<HomeDiscoveryPayload> | null | undefined
): value is HomeDiscoveryPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Array.isArray(value.inTheaters) && Array.isArray(value.recommendationSections);
}

function readStoredState(): HomeDiscoveryState {
  if (!browser) {
    return initialState;
  }

  try {
    const rawValue = sessionStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return initialState;
    }

    const parsed = JSON.parse(rawValue) as Partial<HomeDiscoveryState> & {
      userId?: string | null;
    };

    const parsedUserId = parsed.userId;

    if (!parsedUserId || !hasHomeDiscoveryPayload(parsed)) {
      return initialState;
    }

    return {
      userId: parsedUserId,
      status: 'ready',
      error: null,
      inTheaters: parsed.inTheaters,
      recommendationSections: parsed.recommendationSections
    };
  } catch {
    return initialState;
  }
}

function persistState(state: HomeDiscoveryState) {
  if (!browser) {
    return;
  }

  if (state.status !== 'ready' || !state.userId) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      userId: state.userId,
      inTheaters: state.inTheaters,
      recommendationSections: state.recommendationSections
    })
  );
}

function createHomeDiscoveryStore() {
  const store: Writable<HomeDiscoveryState> = writable(readStoredState());

  function setState(state: HomeDiscoveryState) {
    persistState(state);
    store.set(state);
  }

  function syncUser(userId: string | null) {
    const currentState = get(store);

    if (currentState.userId === userId) {
      return;
    }

    pendingRequest = null;

    if (!userId) {
      setState(initialState);
      return;
    }

    const storedState = readStoredState();

    if (storedState.userId === userId) {
      setState(storedState);
      return;
    }

    setState({
      userId,
      status: 'idle',
      error: null,
      ...emptyPayload
    });
  }

  async function ensureLoaded(fetchFn: typeof fetch, userId: string) {
    syncUser(userId);

    const currentState = get(store);

    if (currentState.userId === userId && currentState.status === 'ready') {
      return;
    }

    if (pendingRequest) {
      return pendingRequest;
    }

    store.update((state) => ({
      ...state,
      userId,
      status: 'loading',
      error: null
    }));

    pendingRequest = (async () => {
      const response = await fetchFn('/api/home-discovery');

      if (!response.ok) {
        throw new Error(`Failed to load home discovery (${response.status})`);
      }

      const payload = (await response.json()) as HomeDiscoveryPayload;

      setState({
        userId,
        status: 'ready',
        error: null,
        inTheaters: payload.inTheaters,
        recommendationSections: payload.recommendationSections
      });
    })()
      .catch((error) => {
        store.update((state) => ({
          ...state,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to load home discovery'
        }));
      })
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  }

  function reset() {
    pendingRequest = null;
    setState(initialState);
  }

  return {
    subscribe: store.subscribe,
    ensureLoaded,
    syncUser,
    reset
  };
}

export const homeDiscoveryStore = createHomeDiscoveryStore();
