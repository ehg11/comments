import surtr from "./assets/surtr-sq.png";
import { TextParagraph, PlusLg } from "@styled-icons/bootstrap";
import styled from 'styled-components';
import { ACTIONS, test_card, colors } from './utils.js'
import Card from "./Card.js"
import { useReducer } from "react"


const StyledIcon = styled(TextParagraph)`
    color: ${colors.light};
`

export default function App() {

    const test_cards = [test_card]

    const [all_cards, dispatch] = useReducer(reducer, test_cards);

    function reducer(cards, action) {
        switch(action.type) {
            case ACTIONS.SUBMIT:
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        return { ...card, title: action.payload.title, body: action.payload.body, finalized: true };
                    }
                    return card;
                })
            case ACTIONS.ADD_NEWCARD:
                if (cards.find(card => !card.finalized)) {
                    return cards;
                }
                return [emptyCard(), ...cards]
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
    
    function goToLink(link) {
        window.open(link, "_blank");
    };

    function emptyCard() {
        return {
            id: Date.now(),
            title: "",
            body: "",
            score: 0,
            starred: false,
            finalized: false,
        }
    }

    function showCards(cards) {
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

    console.log(all_cards)

    return (
        <div className="bg-dark_accent w-screen h-screen flex flex-col justify-start items-center">
            <div className="bg-dark shadow-lg w-full h-24 px-5 flex flex-row items-center opacity-90">
                <StyledIcon className="h-12 w-12 mr-5"/>
                <div className="font-sorabold text-2xl tracking-widest font-bold grow text-light">
                    Bookmarks
                </div>
                <button onClick={() => goToLink("https://github.com/ehg11/comments")}>
                    <img src={surtr} alt="surtr" 
                        className="w-12 h-12 rounded-full items-end hover:brightness-90 shadow-xl mx-4" 
                    />
                </button>
            </div>
            <div className="w-full h-full flex justify-center items-top py-12 overflow-y-auto scroll">
                <div className="bg-white w-11/12 min-h-full h-fit p-12 rounded-xl shadow-lg flex flex-col gap-8">
                    <button 
                        className="bg-light p-2 rounded-2xl drop-shadow-md border-2 border-light hover:border-light_accent h-12 flex items-center justify-center"
                        onClick={() => dispatch({ type: ACTIONS.ADD_NEWCARD })}
                    >
                        <PlusLg className="h-6"/>
                    </button>
                    {showCards(all_cards)}
                </div>
            </div>
        </div>
    )

}