import surtr from "./assets/surtrbruh.png"

export default function App() {

  

  return (
    <body className="bg-slate-300 w-screen h-screen flex flex-col justify-start items-center">
      <div className="bg-slate-400 shadow-lg w-full h-24 px-5 flex flex-row items-center">
        <div className="font-mono text-2xl tracking-wide font-bold grow">
          Bookmarks
        </div>
        <img src={surtr} alt="surtr" className="w-16 h-16 rounded-full items-end hover:brightness-90" />
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-11/12 h-5/6 p-10 rounded-xl shadow-lg">
          
        </div>
      </div>
    </body>
  )
}