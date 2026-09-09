import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('flowboard-current-user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('flowboard-access-token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      localStorage.setItem('flowboard-current-user', JSON.stringify(user));
      localStorage.setItem('flowboard-access-token', accessToken);
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('flowboard-current-user');
      localStorage.removeItem('flowboard-access-token');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;