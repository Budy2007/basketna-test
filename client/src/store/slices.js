// Redux Toolkit slice for what the visitor chooses: the interface language.
import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: { lang: 'ar' },
  reducers: {
    setLang: (state, { payload }) => { state.lang = payload === 'en' ? 'en' : 'ar'; },
    toggleLang: (state) => { state.lang = state.lang === 'ar' ? 'en' : 'ar'; },
  },
});

export const { setLang, toggleLang } = uiSlice.actions;
