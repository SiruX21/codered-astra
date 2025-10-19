export function Footer() {
  return (
    <footer className="bg-white text-black py-10 text-center">
        <p className="flex justify-center items-center text-4xl">
          &copy; {new Date().getFullYear()}{" "}
          <span>
            <img className="ml-2 mb-2 w-90" src="/main/title.gif"></img>
          </span>
          . All rights reserved.
        </p>
      </footer>
  );
}
