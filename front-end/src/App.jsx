import { useState, useEffect } from "react";
import fursonaLogo from "../public/main/title.gif";
import fireBg from "../public/main/firebg.gif";

import "./App.css";
import { DefaultApp } from "./pages/Default";

function App() {
  const initialSeconds = 6;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      setTimerActive(false); // Stop the timer when it reaches 0
      setIsMainPage(true);
    }
    return () => clearInterval(interval); // Cleanup on component unmount or timer stop
  }, [timerActive, seconds]);

  const [agree, setAgree] = useState(false);
  const [isMainPage, setIsMainPage] = useState(true);

  const handleTermsAgree = () => {
    setAgree(true);
    setSeconds(initialSeconds); // Reset seconds to initial value
    setTimerActive(true);
  };

  if (isMainPage) {
    return <DefaultApp />;
  }

  if (!agree) {
    useEffect(() => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "black";
      document.body.style.backgroundSize = "contain";
    });

    return (
      <>
        <div className="flex flex-col bg-[#691125] items-center min-h-screen text-white">
          <a className="text-4xl" href="/">
            <img src={fursonaLogo} className="logo" alt="fursona logo" />
          </a>

          <section className="bg-red-500 h-300px w-200px text-white">
            <h1 className="font-bold p-10">THIS IS A TERMS OF AGREEMENT</h1>

            <h1 className="p-10">SAY HELLO TO YOUR GREATEST INTERVENTION</h1>
            <h1 className="p-10">
              YOUR ENTIRE IDENTITY SHALL SUMMON A MAGNIFICIENT NEW CREATURE
            </h1>
            <h1 className="p-10">DARE TO TRY?</h1>
          </section>

          <button onClick={handleTermsAgree} className="bg-white my-14 text-lg">
            <p className="text-3xl font-bold text-black px-12 py-6">
              Yes, I am not a coward.
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
            {seconds === 1 ? (
              <p>Welcome in! ^^</p>
            ) : (
              <p>
                The contract has been signed. Please remain in seat for{" "}
                {seconds - 1} seconds.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default App;
