import { ReactNode, createContext, useEffect, useReducer } from "react";

type AppContextState = {
  isLoading: boolean;
};

const initialState = {
  isLoading: false,
};

enum Types {
  INITIALIZE = "INITIALIZE",
  EnableLoading = "EnableLoading",
  DisableLoading = "DisableLoading",
}

const reducer = (state: AppContextState, action: any) => {
  switch (action.type) {
    case Types.INITIALIZE:
      return {
        ...state,
        initialState,
      };
    case Types.EnableLoading:
      return {
        ...state,
        isLoading: true,
      };
    case Types.DisableLoading:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AppContext = createContext<any | null>(null);

function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        dispatch({
          type: Types.INITIALIZE,
        });
      } catch {}
    };

    initialize();
  }, []);

  const enableLoading = () => {
    dispatch({
      type: Types.EnableLoading,
    });
  };

  const disableLoading = () => {
    dispatch({
      type: Types.DisableLoading,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        method: "AppContext",
        enableLoading,
        disableLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
