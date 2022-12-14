import { getChildren, ACTIONS, colors, rainbow } from "./utils.js";
import Card from "./Card.js";
import { useState, useRef, useEffect } from "react";
import { ArrowBarDown } from "@styled-icons/bootstrap";
import styled from 'styled-components';

const StyledExpand = styled(ArrowBarDown)`
    color: ${colors.dark_accent};
`

export default function Subcards({cards, children, card_level, dispatch, user_prefs, user }) {

    const level = card_level;
    const [display, set_display] = useState(!cards.some(card => card.collection));

    const level_ref = useRef(null);

    useEffect(() => {
        if (level_ref && level_ref.current) {
            level_ref.current.style.backgroundColor = rainbow.at((level - 2) % rainbow.length);
            level_ref.current.style.opacity = 0.5;
        }
    }, [level, display])

    function toggleDisplay(type) {
        if (cards.concat(children).some(card => !card.finalized)) {
            return;
        }
        set_display(type);
        children.forEach(card => {
            dispatch({ type: ACTIONS.TOGGLE_DISPLAY, payload: { id: card.id, type: type}})
        })
        cards.forEach(card => {
            dispatch({ type: ACTIONS.TOGGLE_DISPLAY, payload: { id: card.id, type: type}})
        })
    }

    function levelBars() {
        if (level > 1) {
            if (user_prefs.rainbow_levels) {
                return <button className={`w-1 mr-3 hover:brightness-50 rounded-full drop-shadow-md`} onClick={() => toggleDisplay(false)} ref={ level_ref }/>;
            }
            return <button className="w-1 bg-dark_accent mr-3 hover:brightness-50 rounded-full drop-shadow-md" onClick={() => toggleDisplay(false)}/>;
        }
    }

    if (display) {
        return (
            <div className="flex">
                { levelBars() }
                <div className="flex flex-col gap-1 flex-grow">
                    {
                        cards.map((card, index) => {
                            return (
                                <Card
                                    key={ index }
                                    card={ card }
                                    children={ getChildren(children, card.id) }
                                    card_level={ level }
                                    card_siblings={ cards.filter(sibling => sibling.id !== card.id) }
                                    dispatch={ dispatch }
                                    user_prefs={ user_prefs }
                                />
                            )
                        })
                    }
                </div>
            </div>
        )   
    }
    else {
        return (
                <div className="flex flex-col">
                    <div className="flex">
                    { levelBars() }
                    <div className="flex flex-col gap-1 flex-grow">
                        {
                            cards.filter(card => !card.finalized || card.display).map((card, index) => {
                                return (
                                    <Card
                                        key={ index }
                                        card={ card }
                                        children={ getChildren(children, card.id) }
                                        card_level={ level }
                                        card_siblings={ cards.filter(sibling => sibling.id !== card.id) }
                                        dispatch={ dispatch }
                                        user_prefs={ user_prefs }
                                        user={ user }
                                    />
                                )
                            })
                        }
                    </div>
                </div>
                { cards.some(card => card.finalized && !card.display) &&
                    <button className="flex items-center hover:brightness-50" onClick={ () => toggleDisplay(true) }>
                        <div className="w-8 h-1 bg-dark_accent rounded-full" />
                        <StyledExpand className="h-8 w-8 p-1"/>
                        <div className="flex-grow h-1 bg-dark_accent rounded-full" />
                    </button>
                }
            </div>
        )
    }

}