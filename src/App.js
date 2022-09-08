import { TextParagraph, FileEarmarkPlus, JournalPlus, Github, X, Google, Wrench, Check2 } from "@styled-icons/bootstrap";
import { UserCircle } from "@styled-icons/boxicons-solid";
import { LogOut } from "@styled-icons/boxicons-regular";
import styled from 'styled-components';
import { ACTIONS, PAGES, test_card, colors, getChildren, colors2hex, hex2colors } from './utils.js';
import Card from "./Card.js";
import { useReducer, useState, useEffect, useRef } from "react";
import { auth, googleSignIn, logout, pushCards, pullCards, pushPrefs, pullPrefs } from "./firebase.js";
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

const StyledCheck = styled(Check2)`
    &:hover {
        color: ${colors.success};
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
    const def_prefs = {
        rainbow_levels: false,
        default_color: colors.light_accent,
    }

    const [all_cards, dispatch] = useReducer(reducer, cards);
    const [user_prefs, prefs_dispatch] = useReducer(prefs_reducer, def_prefs)
    const [login_warning, set_login_warning] = useState(true);
    const [login_page, show_login_page] = useState(false);
    const [user, set_user] = useState(null);
    const [pulled, set_pulled] = useState(false);
    const [color_menu, show_color_menu] = useState(false);

    const [r, set_r] = useState(hex2colors(user_prefs.default_color)[0] ?? hex2colors(colors.light_accent)[0]);
    const [g, set_g] = useState(hex2colors(user_prefs.default_color)[1] ?? hex2colors(colors.light_accent)[1]);
    const [b, set_b] = useState(hex2colors(user_prefs.default_color)[2] ?? hex2colors(colors.light_accent)[2]);

    const colorRef = useRef(null);

    useEffect(() => {
        if (!(login_page && user)) {
            show_color_menu(false);
            return;
        }
        if (colorRef && colorRef.current) {
            colorRef.current.style.backgroundColor = colors2hex(r, g, b);
        }
    }, [r, g, b, login_page, user])
    
    useEffect(() => {
        const pull = async (user) => {
            const cards = await pullCards(user?.uid);
            const prefs = await pullPrefs(user?.uid);
            console.log(prefs);
            dispatch({ type: ACTIONS.INIT, payload: { cards: cards ?? [] }});
            prefs_dispatch({ type: ACTIONS.INIT_PREFS, payload: { prefs: prefs ?? { rainbow_levels: false, default_color: null } }})
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

    useEffect(() => {
        async function pullPrefHelper(uid) {
            const pulled_preferences = await pullPrefs(uid);
            prefs_dispatch({ type: ACTIONS.INIT_PREFS, payload: { prefs: pulled_preferences ?? { rainbow_levels: false, default_color: null } }});

        }
        if (login_page && user) {
            pullPrefHelper(user.uid);
        }
    }, [login_page, user]);

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
                if (action.payload.cancel) {
                    return cards.map(card => {
                        if (card.id === action.payload.id) {
                            return { ...card, color: card.p_color, finalized: true}
                        }
                        return card;
                    })
                }
                if (action.payload.color) {
                    const color = colors2hex( ...action.payload.color);
                    if (action.payload.settings[2]) {
                        return cards.map(card => {
                            return { ...card, color: color, finalized: true}
                        })
                    }
                    if (action.payload.settings[1]) {
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
                        const children = cards.filter(card => card.parents.includes(action.payload.id));
                        const children_ids = children.map(card => card.id)
                        const stack_ids = [...children_ids, action.payload.id];
                        return cards.map(card => {
                            if (stack_ids.includes(card.id)) {
                                return { ...card, color: color, finalized: true}
                            }
                            return card;
                        })
                    }
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

    function prefs_reducer(prefs, action) {
        switch (action.type) {
            case ACTIONS.INIT_PREFS: {
                return action.payload.prefs;
            }
            case ACTIONS.TOGGLE_RAINBOW_LEVEL: {
                return { ...prefs, rainbow_levels: !prefs.rainbow_levels}
            }
            case ACTIONS.SET_DEFAULT_COLOR: {
                return { ...prefs, default_color: action.payload.color}
            }
            default: {
                return prefs;
            }
        }
    }
    
    function goToLink(link) {
        window.open(link, "_blank");
    };

    function emptyCard (id = Date.now(), parents = [], collection = false) {
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
            color: null,
        }
    }

    function showCards(cards) {
        console.log(cards);
        console.log(user_prefs);
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
                    user_prefs={ user_prefs }
                />
            )
        })
    }

    function savePrefs() {
        pushPrefs(user_prefs).then(() => show_login_page(false));
    }

    function setDefaultColor(action, color = null) {
        switch (action) {
            case ACTIONS.COLOR_RESET: {
                set_r(hex2colors(colors.light_accent)[0]);
                set_g(hex2colors(colors.light_accent)[1]);
                set_b(hex2colors(colors.light_accent)[2]);
                prefs_dispatch({ type: ACTIONS.SET_DEFAULT_COLOR, payload: { color: null}});
                break;
            }
            case ACTIONS.COLOR_CANCEL: {
                set_r(hex2colors(user_prefs.default_color)[0] ?? hex2colors(colors.light_accent)[0]);
                set_g(hex2colors(user_prefs.default_color)[1] ?? hex2colors(colors.light_accent)[1]);
                set_b(hex2colors(user_prefs.default_color)[2] ?? hex2colors(colors.light_accent)[2]);
                break;
            }
            case ACTIONS.COLOR_SUBMIT: {
                prefs_dispatch({ type: ACTIONS.SET_DEFAULT_COLOR, payload: { color: color }});
                break;
            }
            default: 
                break;
        }
        show_color_menu(false);
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
                    <div className="flex flex-col gap-4 justify-center items-center h-full">
                        <div className="flex gap-4 w-full mb-4">
                            <Wrench className="w-12 h-12"/>
                            <div className="grow font-sorabold flex items-center text-2xl mx-4">
                                Settings
                            </div>
                        </div>
                        <div className="flex gap-4 w-full items-center">
                            <button className={`flex gap-4 flex-col justify-start w-16 h-8 rounded-full bg-danger transition-colors ${user_prefs.rainbow_levels && "bg-success"}`}
                                onClick={() => prefs_dispatch({ type: ACTIONS.TOGGLE_RAINBOW_LEVEL })}
                            >
                                <div className={`m-1 w-6 h-6 rounded-full bg-white ${user_prefs.rainbow_levels && "self-end"}`} />
                            </button>
                            <span className="font-sora text-primary"> Use Rainbow Comment Levels </span>
                        </div>
                        <div className="flex gap-4 w-full items-center">
                            <div>
                                { color_menu &&
                                    <div className="flex flex-col gap-2 absolute bg-light drop-shadow-lg p-3 rounded-xl translate-y-1/4">
                                        <div className="flex gap-2">
                                            <span className="font-sorabold text-red-500 w-6">R</span>
                                            <span className="font-mono w-6">{r}</span>
                                            <input type="range" min="0" max="255" defaultValue={r} onChange={e => set_r(e.target.value)}/>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-sorabold text-green-500 w-6">G</span>
                                            <span className="font-mono w-6">{g}</span>
                                            <input type="range" min="0" max="255" defaultValue={g} onChange={e => set_g(e.target.value)}/>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-sorabold text-blue-500 w-6">B</span>
                                            <span className="font-mono w-6">{b}</span>
                                            <input type="range" min="0" max="255" defaultValue={b} onChange={e => set_b(e.target.value)}/>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button className="font-sora text-sm hover:underline" onClick={() => prefs_dispatch({ type: ACTIONS.SET_DEFAULT_COLOR, payload: { color: colors.light_accent}})}>
                                                Reset
                                            </button>
                                            <div className="grow" />
                                            <button onClick={ () => setDefaultColor(ACTIONS.COLOR_CANCEL) }>
                                                <StyledX className="h-6 w-6"/>
                                            </button> 
                                            <button onClick={ () => setDefaultColor(ACTIONS.COLOR_SUBMIT, colors2hex(r, g, b))}>
                                                <StyledCheck className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </div>
                                }
                                <button className="h-8 w-8 mx-4 bg-red-100 rounded-full" ref={ colorRef } onClick={ !color_menu ? () => show_color_menu(true) : () => setDefaultColor(ACTIONS.COLOR_CANCEL)}/>
                            </div>
                            <span className="font-sora text-primary"> Default Color </span>
                        </div>
                        <div className="grow" />
                        <div className="flex w-full mb-6">
                            <button className="flex-grow font-sora text-lg p-2 hover:underline border-2 border-white hover:text-success hover:border-success rounded-full"
                                onClick={ () => savePrefs() }
                            >
                                Save Preferences
                            </button>
                            <button className="flex-grow font-sora text-lg p-2 hover:underline border-2 border-white hover:text-danger hover:border-danger rounded-full"
                                onClick={ () => show_login_page(false) }
                            >
                                Cancel
                            </button>
                        </div>
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

    return ( pulled &&
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
                <div className={`bg-white w-11/12 max-w-11/12 p-12 rounded-xl shadow-lg flex flex-col gap-6 transition-size ease-in-out duration-500 ${login_page ? user ? "h-full" : "w-1/3 min-h-fit" : "h-fit min-h-full"}`}
                >
                    { !login_page ? showPage(PAGES.CARDS) : !user ? showPage(PAGES.LOGIN) : showPage(PAGES.PREFS) }
                    {/* { showPage(PAGES.PREFS) } */}
                </div>
            </div>
        </div>
    )

}