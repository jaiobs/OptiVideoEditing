//Configure Store

import { createStore, applyMiddleware } from "redux";
import { rootReducer } from "../reducers";
import thunk from "redux-thunk";

export const configStore = createStore(rootReducer, applyMiddleware(thunk));