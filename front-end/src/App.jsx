import { useState } from "react";
import fursonaLogo from "../public/main/title.gif";
import fireBg from "../public/main/firebg.gif";

import "./App.css";
import { DefaultApp } from "./pages/normal";

function App() {
  // const [count, setCount] = useState(0)
  const [agree, setAgree] = useState(false);
  const [isMainPage, setIsMainPage] = useState(true);

  const handleTermsAgree = () => {
    setAgree(true);
    setTimeout(() => {
      setIsMainPage(true);
    }, 5000); // Wait for 2 seconds
  };

  if (isMainPage) {
    return (
      <DefaultApp />
    );
  }

  if (!agree) {
    return (
      <>
        <div className="flex flex-col bg-[#691125] items-center min-h-screen text-white">
          <a className="text-4xl" href="/">
            <img src={fursonaLogo} className="logo" alt="fursona logo" />
          </a>

          <section className="bg-red-500 h-300px w-200px text-white">
            <h1 className="font-bold p-10">THIS IS A TERMS OF AGREEMENT</h1>

            <h1 className="p-10">
              SAY HELLO TO YOUR GREATEST DIVINE INTERENTION
            </h1>
            <h1 className="p-10">
              YOUR ENTIRE IDENTITY SHALL SUMMON A MAGNIFICIENT NEW CREATURE
            </h1>
            <h1 className="p-10">DARE TO TRY?</h1>
          </section>

          <button
            onClick={handleTermsAgree}
            className="bg-white my-14 text-lg"
          >
            <p className="text-3xl font-bold text-black px-12 py-6">
              I agree to sell my soul and shall let my inside creature roam
              free.
            </p>
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        {/* <img className="absolute" src={firebg} /> */}

        <div className="flex flex-col items-center min-h-screen text-white">
          <img
            src={fireBg}
            className="absolute w-full h-full mix-blend-screen"
          />

          <div className="absolute bottom-20 text-4xl flex flex-col items-center justify-center h-full text-white">
            Fair play. Please remain in seat.
          </div>
        </div>
      </>
    );
  }
}

export default App;
