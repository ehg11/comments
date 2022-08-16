import surtr from "./assets/surtr-sq.png";
import { TextParagraph } from "@styled-icons/bootstrap";
import Card from "./Card.js"

export default function App() {

    const goToLink = (link) => {
        window.open(link, "_blank");
    };

    return (
        <div className="bg-slate-300 w-screen h-screen flex flex-col justify-start items-center">
        <div className="bg-slate-400 shadow-lg w-full h-24 px-5 flex flex-row items-center">
            <TextParagraph className="h-12 w-12 mr-5"/>
            <div className="font-sorabold text-2xl tracking-widest font-bold grow">
                Bookmarks
            </div>
            <button onClick={() => goToLink("https://github.com/ehg11/comments")}>
                <img src={surtr} alt="surtr" 
                    className="w-16 h-16 rounded-full items-end hover:brightness-90 shadow-xl" 
                />
            </button>
            </div>
            <div className="w-full h-full flex justify-center items-center">
                <div className="bg-white w-11/12 h-5/6 p-10 rounded-xl shadow-lg">
                    <Card />
                </div>
            </div>
        </div>
    )

}