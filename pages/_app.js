import "bootstrap/dist/css/bootstrap.min.css";
import { UserProvider } from "../dataconnect/context/UserContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}