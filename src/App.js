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

    /*
        Cards Structure:
            Top Level Cards
                Child Array with All Subcards (done recursively)
            Copies of All Child Cards
                Parent Array from Top Level to Lowest Level
    */

    function reducer(cards, action) {
        // if there is a pending card, must finish the card before anything can be done
        if (![ACTIONS.SUBMIT, ACTIONS.REMOVE].includes(action.type) && cards.find(card => !card.finalized)) {
            return cards;
        }
        switch(action.type) {
            case ACTIONS.SUBMIT: {
                // find if the card has any parents on the top level -> means it is a child card, need to recursively find the card
                let card = findCard(cards, action.payload.id);
                // modify the card details from the payload
                card.title = action.payload.title;
                card.body = action.payload.body;
                card.finalized = true;
                return cards.map(card => {
                    // if the card is a child, update it's top level copy
                    if (card.child && card.id === action.payload.id) {
                        return { ...card, finalized: true }
                    }
                    return card;
                })
            }
            case ACTIONS.ADD_NEWCARD: {
                return [emptyCard(), ...cards]
            }
            case ACTIONS.ADD_SUBCARD: {
                let id = Date.now();
                let new_cards = cards.map(card => {
                    if (card.id === action.payload.id) {
                        let children = [emptyCard(id), ...card.children];
                        return {...card, children: children}
                    }
                    return card;
                })
                let parents = cards.find(card => card.id === action.payload.id).parents ?? [];
                parents.push(action.payload.id);
                new_cards.push({ id: id, child: true, parents: parents})
                return new_cards;
            }
            case ACTIONS.REMOVE: {
                return cards.filter(card => card.id !== action.payload.id).filter(card => !card.parents?.includes(action.payload.id));
            }
            case ACTIONS.STAR: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        console.log(card);
                        return { ...card, starred: !card.starred};
                    }
                    return card;
                })
            }
            case ACTIONS.UPVOTE: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        return { ...card, score: card.score + 1};
                    }
                    return card;
                })
            }
            case ACTIONS.DOWNVOTE: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        return { ...card, score: card.score - 1};
                    }
                    return card;
                })
            }
            case ACTIONS.EDIT: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        return { ...card, finalized: false, p_title: card.title, p_body: card.body };
                    }
                    return card;
                })
            }
            default:
                return cards;
        }
    }
    
    function goToLink(link) {
        window.open(link, "_blank");
    };

    function emptyCard(id = Date.now(), child = false,) {
        return {
            id: id,
            title: "",
            body: "",
            score: 0,
            starred: false,
            finalized: false,
            child: false,
            children: [],
        }
    }

    function showCards(cards) {
        console.log(cards);
        return cards.filter(card => !card.child).map((card, index) => {
            return (
                <Card
                    key={ index }
                    card={ card }
                    dispatch={ dispatch }
                />
            )
        })
    }

    function findCard(cards, id) {
        let parents = cards.find(card => card.id === id).parents ?? [];
        return findCardHelper(cards, parents, id);
    }

    function findCardHelper(cards, remaining_parents, id) {
        if (!cards.find(card => card.id === id).child) {
            const card = cards.find(card => card.id === id);
            return card;
        }
        const oldestID = remaining_parents[0];
        const parent_card = cards.find(card => card.id === oldestID);
        console.log(cards, parent_card);
        return findCardHelper(parent_card.children, remaining_parents.slice(1), id);
    }

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