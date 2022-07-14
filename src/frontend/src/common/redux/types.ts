export type ActionType<T> = (payload?: T) => {
  type: CZGEReduxActions;
  payload?: T;
};

export enum Pathogen {
  COVID = "covid",
}

// export action type for use in reducers and middleware
export enum CZGEReduxActions {
  SET_GROUP_ACTION_TYPE = "group/setGroup",
  SET_PATHOGEN_ACTION_TYPE = "pathogen/setPathogen",
}

// persisted names are for use in localstorage
export enum ReduxPersistenceTokens {
  GROUP = "currentGroup",
  PATHOGEN = "currentPathogen",
}