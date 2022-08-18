import surtr from "./assets/surtr-sq.png";
import { TextParagraph } from "@styled-icons/bootstrap";
import styled from 'styled-components';
import { ACTIONS, test_card, colors } from './utils.js'
import Card from "./Card.js"
import { useReducer } from "react"

const StyledIcon = styled(TextParagraph)`
    color: ${colors.light};
`

function reducer(cards, action) {
    switch(action.type) {
        case ACTIONS.REMOVE:
            return cards.filter(card => card.id !== action.payload.id)
        case ACTIONS.STAR:
            return cards.map(card => {
                if (card.id === action.payload.id) {
                    return { ...card, starred: !card.starred};
                }
                return card;
            })
        case ACTIONS.UPVOTE:
            return cards.map(card => {
                if (card.id === action.payload.id) {
                    return { ...card, score: card.score + 1};
                }
                return card;
            })
        case ACTIONS.DOWNVOTE:
            return cards.map(card => {
                if (card.id === action.payload.id) {
                    return { ...card, score: card.score - 1};
                }
                return card;
            })
        default:
            return cards;
    }
}


export default function App() {

    const test_cards = [test_card]

    const [all_cards, dispatch] = useReducer(reducer, test_cards);
    
    const goToLink = (link) => {
        window.open(link, "_blank");
    };

    const showCards = (cards) => {
        return cards.map((card, index) => {
            return (
                <Card
                    key={ index }
                    card={ card }
                    dispatch={ dispatch }
                />
            )
        })
    }

    return (
        <div className="bg-dark_accent w-screen h-screen flex flex-col justify-start items-center">
        <div className="bg-dark shadow-lg w-full h-24 px-5 flex flex-row items-center">
            <StyledIcon className="h-12 w-12 mr-5"/>
            <div className="font-sorabold text-2xl tracking-widest font-bold grow text-light">
                Bookmarks
            </div>
            <button onClick={() => goToLink("https://github.com/ehg11/comments")}>
                <img src={surtr} alt="surtr" 
                    className="w-16 h-16 rounded-full items-end hover:brightness-90 shadow-xl" 
                />
            </button>
            </div>
            <div className="w-full h-full flex justify-center items-center">
                <div className="bg-white w-11/12 h-5/6 p-10 rounded-xl shadow-lg flex flex-col gap-8">
                    {showCards(all_cards)}
                </div>
            </div>
        </div>
    )

}