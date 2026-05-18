import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import Tours from "./pages/Tours";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import MyTickets from "./pages/MyTickets";
import CreateEvent from "./pages/CreateEvent";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Signup,
  },
  {
    path: "/esqueci-senha",
    Component: ForgotPassword,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Root />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Home },
      { path: "evento/:id", Component: EventDetails },
      { path: "checkout/:id", Component: Checkout },
      { path: "visitas", Component: Tours },
      { path: "comunidade", Component: Community },
      { path: "analytics", Component: Analytics },
      { path: "perfil", Component: Profile },
      { path: "meus-ingressos", Component: MyTickets },
      { path: "admin/criar-evento", Component: CreateEvent },
      { path: "*", Component: NotFound },
    ],
  },
]);