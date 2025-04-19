import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from '../store';
import { initialState } from '../initialState';
import { UserState, PostState } from '../types';

describe('Store', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe('Initial State', () => {
    it('initializes with default state', () => {
      const state = store.getState();
      expect(state).toEqual(initialState);
    });
  });

  describe('User State', () => {
    it('updates user state on login', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      store.dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: 'mock-token' } });

      const state = store.getState();
      expect(state.user).toEqual({
        ...initialState.user,
        data: user,
        isAuthenticated: true,
        token: 'mock-token',
      });
    });

    it('updates user state on logout', () => {
      // First login
      store.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        },
      });

      // Then logout
      store.dispatch({ type: 'LOGOUT' });

      const state = store.getState();
      expect(state.user).toEqual(initialState.user);
    });

    it('handles login error', () => {
      const error = 'Invalid credentials';
      store.dispatch({ type: 'LOGIN_ERROR', payload: error });

      const state = store.getState();
      expect(state.user).toEqual({
        ...initialState.user,
        error,
      });
    });

    it('updates user profile', () => {
      // First login
      store.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        },
      });

      // Update profile
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
      };

      store.dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUser });

      const state = store.getState();
      expect(state.user.data).toEqual(updatedUser);
    });
  });

  describe('Post State', () => {
    it('adds new post', () => {
      const post = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      };

      store.dispatch({ type: 'ADD_POST_SUCCESS', payload: post });

      const state = store.getState();
      expect(state.posts.items).toContainEqual(post);
    });

    it('updates existing post', () => {
      // First add a post
      const post = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      };

      store.dispatch({ type: 'ADD_POST_SUCCESS', payload: post });

      // Update the post
      const updatedPost = {
        ...post,
        title: 'Updated Title',
        content: 'Updated Content',
      };

      store.dispatch({ type: 'UPDATE_POST_SUCCESS', payload: updatedPost });

      const state = store.getState();
      expect(state.posts.items).toContainEqual(updatedPost);
    });

    it('deletes post', () => {
      // First add a post
      const post = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      };

      store.dispatch({ type: 'ADD_POST_SUCCESS', payload: post });

      // Delete the post
      store.dispatch({ type: 'DELETE_POST_SUCCESS', payload: post.id });

      const state = store.getState();
      expect(state.posts.items).not.toContainEqual(post);
    });

    it('handles post loading state', () => {
      store.dispatch({ type: 'FETCH_POSTS_REQUEST' });

      const state = store.getState();
      expect(state.posts.loading).toBe(true);
    });

    it('handles post error state', () => {
      const error = 'Failed to fetch posts';
      store.dispatch({ type: 'FETCH_POSTS_ERROR', payload: error });

      const state = store.getState();
      expect(state.posts.error).toBe(error);
    });
  });

  describe('State Persistence', () => {
    it('persists state to localStorage', () => {
      // Update state
      store.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        },
      });

      // Check localStorage
      const persistedState = JSON.parse(localStorage.getItem('app-state') || '{}');
      expect(persistedState.user.isAuthenticated).toBe(true);
      expect(persistedState.user.token).toBe('mock-token');
    });

    it('loads state from localStorage on initialization', () => {
      // Set up localStorage
      const persistedState = {
        user: {
          ...initialState.user,
          isAuthenticated: true,
          token: 'mock-token',
          data: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };
      localStorage.setItem('app-state', JSON.stringify(persistedState));

      // Create new store
      const newStore = createStore();
      const state = newStore.getState();

      expect(state.user.isAuthenticated).toBe(true);
      expect(state.user.token).toBe('mock-token');
      expect(state.user.data).toEqual(persistedState.user.data);
    });
  });

  describe('State Selectors', () => {
    it('selects user state', () => {
      const userState = store.getState().user;
      expect(userState).toEqual(initialState.user);
    });

    it('selects posts state', () => {
      const postsState = store.getState().posts;
      expect(postsState).toEqual(initialState.posts);
    });

    it('selects authenticated user', () => {
      // Login
      store.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        },
      });

      const state = store.getState();
      expect(state.user.isAuthenticated).toBe(true);
      expect(state.user.data).toBeDefined();
    });
  });
});
