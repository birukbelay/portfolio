import "../styles/globals.css";
import Navbar from "../components/Navbar";
// import { ReactQueryDevtools } from "react-query/devtools";
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      {/* <ReactQueryDevtools /> */}
    </>
  );
}

export default MyApp;
