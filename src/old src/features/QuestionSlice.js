// questionNoSlice.js

import { createSlice } from "@reduxjs/toolkit";

const questionNoSlice = createSlice({
  name: "questionNo",
  initialState: {
    value: 1, // Initial question number
  },
  reducers: {
    incrementQ: (state) => {
      state.value += 1;
    },
    decrementQ: (state) => {
      state.value -= 1;
    },
    setQuestionNo: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { incrementQ, decrementQ, setQuestionNo } =
  questionNoSlice.actions;
export default questionNoSlice.reducer;
