import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/JWTContext";
import { AuthContextProvider } from "./contexts/AuthGoogleContext";

function App() {
  return (
    <>
      <AppProvider>
        <AuthProvider>
          <AuthContextProvider>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </AuthContextProvider>
        </AuthProvider>
      </AppProvider>
    </>
  );
}

export default App;
