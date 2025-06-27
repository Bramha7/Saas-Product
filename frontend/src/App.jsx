import "./index.css";
import AppRoutes from "./routes/AppRoutes.jsx";
import { UserProvider } from "./context/User.Context.jsx";
function App() {
  return (
    <>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </>
  );
}
export default App;
