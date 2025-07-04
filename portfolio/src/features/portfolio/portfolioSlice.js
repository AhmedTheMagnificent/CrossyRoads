import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    activeProject: null
};

export const portfolioSlice = createSlice({
    name: "portfolio",
    initialState,
    reducers: {
        setActiveProject: (state, action) => {
            state.activeProject = action.payload;
        },
        clearActiveProject: (state) => {
            state.activeProject = null;
        }
    }
});

export const { setActiveProject, clearActiveProject } = portfolioSlice.actions;
export default portfolioSlice.reducers;