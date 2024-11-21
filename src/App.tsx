import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/JWTContext";

function App() {
  return (
    <>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </>
  );
}

export default App;
