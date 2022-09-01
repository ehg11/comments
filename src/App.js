import { TextParagraph, FileEarmarkPlus, JournalPlus, Github, X, Google, Wrench } from "@styled-icons/bootstrap";
import { UserCircle } from "@styled-icons/boxicons-solid";
import { LogOut } from "@styled-icons/boxicons-regular";
import styled from 'styled-components';
import { ACTIONS, PAGES, test_card, colors, getChildren, colors2hex } from './utils.js';
import Card from "./Card.js";
import { useReducer, useState, useEffect } from "react";
import { auth, googleSignIn, logout, pushCards, pullCards } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

const StyledIcon = styled(TextParagraph)`
    color: ${colors.light};
`

const StyledGithub = styled(Github)`
    color: ${colors.light};
`

const StyledUserLight = styled(UserCircle)`
    color: ${colors.light};
`

const StyledUserDark = styled(UserCircle)`
    color: ${colors.dark};
`

const StyledX = styled(X)`
    &:hover {
        color: ${colors.danger};
    } 
`

const StyledGoogle = styled(Google)`
    color: ${colors.light};
`

const FlippedLogout = styled(LogOut)`
    color: ${colors.light};
    transform: scaleX(-1);
`

export default function App() {

    const test = false;

    const cards = test ? [test_card] : [];

    const [all_cards, dispatch] = useReducer(reducer, cards);
    const [login_warning, set_login_warning] = useState(true);
    const [login_page, show_login_page] = useState(false);
    const [user, set_user] = useState(null);
    const [pulled, set_pulled] = useState(false);
    
    useEffect(() => {
        const pull = async (user) => {
            const cards = await pullCards(user?.uid);
            dispatch({ type: ACTIONS.INIT, payload: { cards: cards ?? [] }});
            set_pulled(!!cards);
        }
        onAuthStateChanged(auth, (u) => {
            if (user === u || (!user && !u)) {
                return;
            }
            if (u) {
                // console.log(u);
                if (user !== u) {
                    set_user(u);
                    pull(u);
                    show_login_page(false);
                }
            }
            else {
                // console.log("no user");
                if (user) {
                    set_user(null);
                    dispatch({ type: ACTIONS.INIT, payload: { cards: [] }});
                }
            }
        })
    }, [user])

    useEffect(() => {
        if (!pulled || all_cards.some(card => !card.finalized)) {
            return;
        }
        pushCards(all_cards);
    }, [all_cards, pulled])

    function reducer(cards, action) {
        console.log(cards);
        // if there is a pending card, must finish the card before anything can be done
        if (![ACTIONS.SUBMIT, ACTIONS.REMOVE, ACTIONS.CHANGE_COLOR].includes(action.type) && cards.find(card => !card.finalized)) {
            return cards;
        }
        switch(action.type) {
            case ACTIONS.INIT: {
                return action.payload.cards;
            }
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
                                // console.log(prev_title);
                                // console.log(card.body);
                                if (prev_title && action.payload.title !== prev_title) {
                                    let body = [...card.body];
                                    // console.log(body);
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
                if (action.payload.color) {
                    return cards.map(card => {
                        if (card.id === action.payload.id) {
                            return { ...card, finalized: false, p_color: card.color };
                        }
                        return card;
                    })
                }
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
            case ACTIONS.CHANGE_COLOR: {
                console.log("changing color");
                if (action.payload.cancel) {
                    return cards.map(card => {
                        if (card.id === action.payload.id) {
                            console.log("setting finalized to true");
                            return { ...card, color: card.p_color, finalized: true}
                        }
                        return card;
                    })
                }
                if (action.payload.color) {
                    const color = colors2hex( ...action.payload.color);
                    if (action.payload.settings[2]) {
                        console.log("changing all");
                        return cards.map(card => {
                            return { ...card, color: color, finalized: true}
                        })
                    }
                    if (action.payload.settings[1]) {
                        console.log("changing stack");
                        const self = cards.find(card => card.id === action.payload.id);
                        const parent_ids = self.parents;
                        const children = cards.filter(card => card.parents.includes(self.id));
                        const children_ids = children.map(card => card.id);
                        const stack_ids = [self.id, ...parent_ids, ...children_ids];
                        return cards.map(card => {
                            if (stack_ids.includes(card.id)) {
                                return { ...card, color: color, finalized: true}
                            }
                            return card;
                        })
                    }
                    if (action.payload.settings[0]) {
                        console.log("changing children");
                        const children = cards.filter(card => card.parents.includes(action.payload.id));
                        const children_ids = children.map(card => card.id)
                        const stack_ids = [...children_ids, action.payload.id];
                        console.log(stack_ids);
                        return cards.map(card => {
                            if (stack_ids.includes(card.id)) {
                                return { ...card, color: color, finalized: true}
                            }
                            return card;
                        })
                    }
                    console.log("changing single");
                    return cards.map(card => {
                        if (card.id === action.payload.id) {
                            return { ...card, color: color, finalized: true}
                        }
                        return card;
                    })
                }
                return cards;
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
            color: colors.light_accent,
        }
    }

    function showCards(cards) {
        console.log(cards);
        if (cards.length === 0) {
            return (
                <div className="flex grow items-center justify-center text-primary font-sora m-6">
                    No Comments to Show
                </div>
            )
        }
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

    function showPage(page) {
        switch (page) {
            case PAGES.CARDS: {
                return (
                    <div className="flex flex-col gap-6">
                        { !user && login_warning 
                            ? <div className="bg-danger w-full min-h-10 h-fit rounded-2xl p-2 flex items-center justify-center bg-opacity-50">
                                <div className="flex-grow font-sora">
                                    Comments will not be saved without an Account. Click  
                                    <span className="font-sorabold underline px-1.5 hover:text-danger" onClick={() => show_login_page(true)}>here</span>
                                    to make an account.
                                </div>
                                <button className="flex items-center" onClick={ () => set_login_warning(false)}>
                                    <StyledX className="h-6 w-6"/>
                                </button>
                            </div>
                            : null
                        }
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
                )
            }
            case PAGES.LOGIN: {
                return (
                    <div className="flex flex-col gap-4 justify-center items-center">
                        <StyledUserDark className="h-28 w-28 my-4 drop-shadow-lg" />
                        <button onClick={() => googleSignIn()}
                            className="h-24 min-h-fit w-full my-4 flex items-center justify-center bg-light_accent p-4 rounded-full border-2 border-light_accent hover:brightness-75
                                hover:border-dark drop-shadow-lg">
                            <StyledGoogle className="h-2/3" />
                            <div className="m-4 font-sorabold text-light text-2xl">
                                Sign in With Google
                            </div>
                        </button>
                    </div>
                )
            }
            case PAGES.PREFS: {
                return (
                    <div className="flex flex-col gap-4 justify-center items-center">
                        <div className="flex gap-4 w-full">
                            <Wrench className="w-12 h-12"/>
                            <div className="grow font-sorabold flex items-center text-2xl mx-4">
                                Settings
                            </div>
                        </div>
                        <span className="grow" />
                        <button className="flex transition-colors rounded-full w-full text-light bg-light_accent hover:bg-danger justify-center items-center"
                            onClick={() => logout()}
                        >
                            <FlippedLogout className="w-12 h-12 p-2"/>
                            <span className="font-sora text-lg"> Logout </span>
                        </button>
                    </div>
                )
            }
            default:
                return;
        }
    }

    return (
        <div className="bg-dark_accent w-screen h-screen flex flex-col justify-start items-center">
            <div className="bg-dark shadow-lg w-full h-24 px-5 flex flex-row items-center opacity-90 gap-x-8">
                <button className="flex grow items-center hover:brightness-75" onClick={() => show_login_page(false)}>
                    <StyledIcon className="h-12 w-12 mr-5"/>
                    <div className="font-sorabold text-2xl tracking-widest font-bold text-light">
                        Comments
                    </div>
                </button>
                <button onClick={() => goToLink("https://github.com/ehg11/comments")}>
                    <StyledGithub className="w-8 h-8 hover:brightness-75 shadow-xl rounded-full"/>
                </button>
                <button onClick={() => show_login_page(!login_page)}>
                    { !user 
                        ? <StyledUserLight className="w-10 h-10 hover:brightness-75 shadow-xl rounded-full"/>
                        : <img src={user.photoURL} alt={"Profile"} className="w-8 h-8 hover:brightness-90 shadow-xl rounded-full"/>
                    }
                    
                </button>
                { user && 
                    <button onClick={() => logout()}>
                        <FlippedLogout className="w-8 h-8 hover:brightness-75 shadow-xl" />
                    </button>
                }
            </div>
            <div className="w-full h-full flex justify-center items-top py-12 overflow-y-scroll scroll">
                <div className={`bg-white w-11/12 max-w-11/12 min-h-full h-fit p-12 rounded-xl shadow-lg flex flex-col gap-6 transition-size ease-in-out duration-500 ${login_page && "w-1/3 min-h-fit"}`}
                >
                    { !login_page ? showPage(PAGES.CARDS) : !user ? showPage(PAGES.LOGIN) : showPage(PAGES.PREFS) }
                </div>
            </div>
        </div>
    )

}