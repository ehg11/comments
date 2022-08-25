import { TextParagraph, FileEarmarkPlus, JournalPlus, Github, X } from "@styled-icons/bootstrap";
import { UserCircle} from "@styled-icons/boxicons-solid";
import styled from 'styled-components';
import { ACTIONS, test_card, colors, getChildren } from './utils.js';
import Card from "./Card.js";
import { useReducer, useState } from "react";

const StyledIcon = styled(TextParagraph)`
    color: ${colors.light};
`

const StyledGithub = styled(Github)`
    color: ${colors.light};
`

const StyledUser = styled(UserCircle)`
    color: ${colors.light};
`

const StyledX = styled(X)`
    &:hover {
        color: ${colors.danger};
    } 
`

export default function App() {

    const test_cards = [test_card]

    const [all_cards, dispatch] = useReducer(reducer, test_cards);
    const [login, set_login] = useState(false);
    const [login_warning, set_login_warning] = useState(true);

    function reducer(cards, action) {
        // if there is a pending card, must finish the card before anything can be done
        if (![ACTIONS.SUBMIT, ACTIONS.REMOVE].includes(action.type) && cards.find(card => !card.finalized)) {
            return cards;
        }
        switch(action.type) {
            case ACTIONS.SUBMIT: {
                let parentID = cards.find(card => card.id === action.payload.id).parents.at(-1);
                let prev_title = cards.find(card => card.id === action.payload.id).p_title;
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        if (card.collection) {
                            return {...card, title: action.payload.title, display: action.payload.display, finalized: true}
                        }
                        return {...card, title: action.payload.title, body: action.payload.body, finalized: true}
                    }
                    if (parentID && card.id === parentID) {
                        if (card.collection) {
                            if (!action.payload.cancel) {
                                console.log(prev_title);
                                console.log(card.body);
                                if (prev_title && action.payload.title !== prev_title) {
                                    let body = [...card.body];
                                    console.log(body);
                                    let index = body.findIndex(e => e === prev_title);
                                    body[index] = action.payload.title;
                                    return {...card, body: body}
                                }
                                let body = [action.payload.title, ...card.body];
                                return {...card, body: body}
                            }
                        }
                    }
                    return card;
                })
            }
            case ACTIONS.ADD_NEWCARD: {
                return [emptyCard(), ...cards]
            }
            case ACTIONS.ADD_SUBCARD: {
                let id = Date.now();
                let parent = cards.find(card => card.id === action.payload.id);
                if (!parent.collection) {
                    return [emptyCard(id, [...parent.parents, action.payload.id]), ...cards]
                }
                return [emptyCard(id, [...parent.parents, action.payload.id], true), ...cards]
            }
            case ACTIONS.REMOVE: {
                return cards.filter(card => card.id !== action.payload.id).filter(card => !card.parents?.includes(action.payload.id));
            }
            case ACTIONS.STAR: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
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
            case ACTIONS.TOGGLE_DISPLAY: {
                return cards.map(card => {
                    if (card.id === action.payload.id) {
                        return { ...card, display: action.payload.type }
                    }
                    return card;
                })
            }
            case ACTIONS.ADD_NEWCOLLECTION: {
                return [emptyCard(undefined, undefined, true), ...cards];
            }
            default:
                return cards;
        }
    }
    
    function goToLink(link) {
        window.open(link, "_blank");
    };

    function emptyCard(id = Date.now(), parents = [], collection = false) {
        return {
            id: id,
            title: "",
            body: "",
            score: 0,
            starred: false,
            finalized: false,
            display: true,
            parents: parents,
            collection: collection,
        }
    }

    function showCards(cards) {
        console.log(cards);
        return cards.filter(card => card.parents.length === 0 && card.display).map((card, index) => {
            return (
                <Card
                    key={ index }
                    card={ card }
                    children={ getChildren(cards, card.id) }
                    dispatch={ dispatch }
                />
            )
        })
    }

    return (
        <div className="bg-dark_accent w-screen h-screen flex flex-col justify-start items-center">
            <div className="bg-dark shadow-lg w-full h-24 px-5 flex flex-row items-center opacity-90">
                <StyledIcon className="h-12 w-12 mr-5"/>
                <div className="font-sorabold text-2xl tracking-widest font-bold grow text-light">
                    Comments
                </div>
                <button onClick={() => set_login(!login)}>
                    <StyledUser className="w-12 h-12 hover:brightness-90 shadow-xl mx-4 rounded-full"/>
                </button>
                <button onClick={() => goToLink("https://github.com/ehg11/comments")}>
                    <StyledGithub className="w-10 h-10 hover:brightness-90 shadow-xl mx-4 rounded-full"/>
                </button>
            </div>
            <div className="w-full h-full flex justify-center items-top py-12 overflow-y-scroll scroll">
                <div className="bg-white w-11/12 max-w-11/12 min-h-full h-fit p-12 rounded-xl shadow-lg flex flex-col gap-6">
                    { !login && login_warning 
                        ? <div className="bg-danger w-full h-10 rounded-2xl p-2 flex items-center justify-center bg-opacity-50">
                            <div className="flex-grow font-sora">
                                Comments will not be saved without an Account. Click  
                                <span className="font-sorabold underline px-1.5 hover:text-danger">here</span>
                                 to make an account.
                            </div>
                            <button className="flex items-center" onClick={ () => set_login_warning(false)}>
                                <StyledX className="h-6 w-6"/>
                            </button>
                        </div>
                        : null
                    }
                    <div className="bg-slate-300 h-2 w-full">
                        susy
                    </div>
                    <div className="flex gap-4">
                        <button 
                            className="bg-light p-2 rounded-2xl drop-shadow-md border-2 border-light hover:border-light_accent h-12 flex items-center justify-center flex-grow"
                            onClick={() => dispatch({ type: ACTIONS.ADD_NEWCARD })}
                        >
                            <FileEarmarkPlus className="h-6"/>
                        </button>
                        <button 
                            className="bg-light p-2 rounded-2xl drop-shadow-md border-2 border-light hover:border-light_accent h-12 flex items-center justify-center flex-grow"
                            onClick={() => dispatch({ type: ACTIONS.ADD_NEWCOLLECTION })}
                        >
                            <JournalPlus className="h-6"/>
                        </button>
                    </div>
                    {showCards(all_cards)}
                </div>
            </div>
        </div>
    )

}