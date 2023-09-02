import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from "react";
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
