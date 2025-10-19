import mainLogo from "../../public/main/mainlogo.png";
import syrus from "../../public/main/syrus.png";
import syrusSona from "../../public/main/fursona.gif";

function Instructions() {
  return (
    <>
      <div>
        <h1 className="mb-3 text-red-500 font-bold">HOW TO USE!</h1>
      </div>

      <section className="w-4/5 flex flex-col items-center space-y-12">
        <div className="flex flex-row justify-between">
          <div className="w-3/5 text-left space-y-7">
            <div>
              <h1 className="text-black">Step 1.</h1>
              <h2 className="text-black text-3xl">
                Take a picture of your whole body selfie! Like this image on
                right.
              </h2>
            </div>

            <div>
              <h1 className="text-3xl! text-red-600">CAUTION!</h1>
              <h2 className="text-xl text-red-800">
                If image not fully capture the entire human body, fursona may
                have <span className="font-bold">missing</span> body parts.
              </h2>
            </div>
          </div>
          <div className="w-1/3">
            <img src={syrus} alt="Syrus" />
            <h3 className="text-red-700 font-bold">"Hello, I am Syrus."</h3>
          </div>
        </div>

        <div className="flex flex-row-reverse justify-between">
          <div className="w-3/5 text-left space-y-7">
            <div>
              <h1 className="text-black">Step 2.</h1>
              <h2 className="text-black text-3xl font-bold">
                Drag and Drop it like it's hot!
              </h2>
            </div>

            <div className="space-y-7">
              <h2 className="text-black text-3xl">
                Just drag and drop that image into our file uploader!
              </h2>

              <h2 className="text-black text-3xl">
                And just like that, our favorite assistant,
                <span className="font-bold text-4xl bg-white px-1">
                  <span className="text-[#0057e7]">G</span>
                  <span className="text-[#d62d20]">O</span>
                  <span className="text-[#ffa700]">O</span>
                  <span className="text-[#0057e7]">G</span>
                  <span className="text-[#008744]">L</span>
                  <span className="text-[#d62d20]">E</span>
                </span>{" "}
                <span className="px-1 inline-block">
                  <img className="w-30" src="/main/geminilogo.png"></img>
                </span>{" "}
                will analyze your appearance and give you the most accurate{" "}
                <span className="font-bold">fursona!</span>
              </h2>
            </div>
          </div>
          <div className="w-1/3">
            <img src={syrusSona} alt="Syrus" />
          </div>
        </div>
      </section>
    </>
  );
}

export function DefaultApp() {
  return (
    <div className="!bg-[#f7c3ef] h-full w- p-10 flex flex-col items-center bg-black text-white space-y-9">
      <div className="bg-black p-10 space-y-4">
        <h1 className="text-[2.7rem]! font-bold text-white">
          "The righteous care for the needs of their animals,"
        </h1>
        <h2 className="!text-4xl">Proverbs 12:10</h2>
      </div>

      <div className="space-y-4">
        <h1>welcome too..</h1>
        <img src={mainLogo} />
        <h2 className="text-2xl text-black font-bold">
          your identity crisis helper!
        </h2>
      </div>

      <Instructions/>
    </div>
  );
}
