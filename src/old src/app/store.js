import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/User";
import goalReducer from "../features/GoalSlice";
import QuestionSlice from "../features/QuestionSlice";
export const store = configureStore({
  reducer: {
    goals: goalReducer,
    user: userReducer,
    questionNo: QuestionSlice,
  },
});
