import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/JWTContext";

function App() {
  return (
    <>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
