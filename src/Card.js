import { X, Plus, ArrowUpShort, ArrowDownShort, Star, StarFill } from "@styled-icons/bootstrap";
import { ModeEdit } from "@styled-icons/material"
import styled from 'styled-components';
import { ACTIONS, colors } from "./utils.js";
import { useState, useRef, useEffect } from "react";
import Subcards from "./Subcards.js";

const StyledX = styled(X)`
    &:hover {
        color: ${colors.danger};
    } 
`

const StyledStarFill = styled(StarFill)`
    color: ${colors.light_accent}
`

export default function Card({ card, children, card_level, card_siblings, dispatch }) {
    const id = card.id;
    const title = card.title ?? "";
    const body = card.body ?? "";
    const score = card.score ?? 0;
    const starred = card.starred ?? false;
    const level = card_level ?? 1;
    const siblings = card_siblings ?? [];
    const direct_children = children.filter(card => card.parents.length === level);
    const indirect_children = children.filter(card => card.parents.length !== level);

    const [new_title, set_new_title] = useState("");
    const [new_body, set_new_body] = useState(""); 
    const [error, set_error] = useState("");

    const titleRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (titleRef && titleRef.current) {
            titleRef.current.style.height = "0px";
            const scrollHeight = titleRef.current.scrollHeight;
            titleRef.current.style.height = `${scrollHeight}px`;
        }
    }, [new_title])
    
    useEffect(() => {
        if (bodyRef && bodyRef.current) {
            bodyRef.current.style.height = "0px";
            const scrollHeight = bodyRef.current.scrollHeight;
            bodyRef.current.style.height = `${scrollHeight}px`;
        }
    }, [new_body])

    useEffect(() => {
        if (!card.finalized) {
            if (card.p_title) {
                if (titleRef && titleRef.current) {
                    titleRef.current.style.height = "0px";
                    let scrollHeight = titleRef.current.scrollHeight;
                    titleRef.current.style.height = `${scrollHeight}px`;

                    const text_length = titleRef.current.value.length;
                    titleRef.current.setSelectionRange(text_length, text_length);
                    titleRef.current.focus();
                }
                if (bodyRef && bodyRef.current) {
                    bodyRef.current.style.height = "0px";
                    const scrollHeight = bodyRef.current.scrollHeight;
                    bodyRef.current.style.height = `${scrollHeight}px`;
                }
            }
        } 
    }, [card.finalized, card.p_title, card.p_body])
    
    function handleSubmit() {
        console.log(siblings);
        if (new_title === "") {
            set_error("Please Enter a Title");
            setTimeout(() => {
                set_error("");
            }, 2000);
        }
        if (siblings.some(card => card.title === new_title)) {
            set_error("Another Subcollection already has this Title");
            setTimeout(() => {
                set_error("");
            }, 2000);
        }
        else if (!card.collection && new_body === "") {
            set_error("Please Enter a Comment");
            setTimeout(() => {
                set_error("");
            }, 2000);
        }
        else {
            if (!card.collection) {
                dispatch({ type: ACTIONS.SUBMIT, payload: {id: id, title: new_title, body: new_body }})
            }
            else if (level > 1) {
                dispatch({ type: ACTIONS.SUBMIT, payload: {id: id, title: new_title, body: new_body, display: false }})
            }
            else {
                dispatch({ type: ACTIONS.SUBMIT, payload: {id: id, title: new_title, body: new_body, display: true }})
            }
            set_new_title("");
            set_new_body("");
        }
    }

    function beginEdit() {
        set_new_title(title);
        if (!card.collection) {
            set_new_body(body);
        }
        dispatch({ type: ACTIONS.EDIT, payload: { id: id }})
    }

    function cancelEdit() {
        set_new_title("");
        set_new_body("");
        if (card.p_title) {
            dispatch({ type: ACTIONS.SUBMIT, payload: {id: id, title: card.p_title, body: card.p_body, display: true, cancel: true }});
        }
        else {
            dispatch({ type: ACTIONS.REMOVE, payload: {id: id}} );
        }
    }

    function removeCard() {
        set_new_title("");
        set_new_body("");
        dispatch({ type: ACTIONS.REMOVE, payload: {id: id}} );
    }

    function showSubcollection(title) {
        indirect_children.forEach(card => dispatch({ type: ACTIONS.TOGGLE_DISPLAY, payload: { id: card.id, type: false}}));
        direct_children.filter(card => card.title !== title).forEach(card => dispatch({ type: ACTIONS.TOGGLE_DISPLAY, payload: { id: card.id, type: false}}));
        dispatch({ type: ACTIONS.TOGGLE_DISPLAY, payload: { id: direct_children.find(card => card.title === title).id, type: true}});
    }

    function collectionButtons(collection) {
        return (
            <div className="bg-light flex-grow h-fit py-4 flex flex-col items-start">
                {collection && collection.map((ele, index) => {
                    return (
                        <button key={ index } className="font-sora text-primary text-sm hover:brightness-50 hover:underline" onClick={ () => showSubcollection(ele) }>
                            { ele }
                        </button>
                    )  
                })}
            </div>
        )
    }

    if (card.finalized) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex">
                    {/* {levelBars()} */}
                    <div className="flex flex-col w-full h-fit min-h-1/3 rounded-2xl align-top overflow-hidden child:px-5 drop-shadow-lg">
                        <div className="bg-light h-fit min-h-16 w-full flex items-center gap-1 pt-5">
                            <span className="flex-grow font-sorabold text-2xl text-important mr-1"> {title} </span>
                            <button 
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center self-start"
                                onClick={() => dispatch({ type: ACTIONS.STAR, payload: {id: id}})}
                            >
                                { !starred
                                    ? <Star className="h-6 w-6 p-1" />
                                    : <StyledStarFill className="h-6 w-6 p-1" />
                                }
                            </button>
                            <button 
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center self-start"
                                onClick={() => dispatch({ type: ACTIONS.REMOVE, payload: {id: id}})}
                            >
                                <StyledX className="h-6 w-6" />
                            </button>
                        </div>
                        { !card.collection 
                            ? <div className="bg-light flex-grow h-fit py-4 font-sora text-primary text-sm">
                                { body }
                            </div>
                            : collectionButtons(body)
                        }
                        <div className="bg-light_accent h-8 flex items-center">
                            <button 
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2"
                                onClick={() => dispatch({ type: ACTIONS.ADD_SUBCARD, payload: {id: id }})}
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                            <button
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center"
                                onClick={() => beginEdit()}
                            >
                                <ModeEdit className="h-6 w-6 p-1" />
                            </button>
                            <span className="flex-grow" />
                            <span className="font-mono px-2"> {score} </span>
                            <button 
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center"
                                onClick={() => dispatch({ type: ACTIONS.UPVOTE, payload: { id: id }})}
                            >
                                    <ArrowUpShort className="h-6 w-6" />
                            </button>
                            <button 
                                className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center"
                                onClick={() => dispatch({ type: ACTIONS.DOWNVOTE, payload: {id: id }})}
                            >
                                <ArrowDownShort className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
                { direct_children.length > 0 &&
                        <Subcards
                            cards={ direct_children }
                            children={ indirect_children }
                            card_level={ level + 1 }
                            dispatch={ dispatch }
                        />
                }
            </div>
        )
    }
    else {
        return (
            <div className="flex">
                <div
                    className={`flex flex-col w-full h-fit min-h-1/3 rounded-2xl align-top overflow-hidden child:px-5 drop-shadow-lg ${error ? "shake" : ""}`}
                >
                    <div className="bg-light h-fit w-full flex items-center gap-1 pt-5">
                        <textarea ref={ titleRef } value={ new_title } rows="1"
                                placeholder={`Give your ${!card.collection ? "Card" : "Collection"} a Title...`}
                                onChange={e => set_new_title(e.target.value)}
                                className="flex-grow text-2xl w-full text-important max-w-full bg-inherit focus:outline-none resize-none font-sorabold"
                            />
                        <button 
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center self-start"
                            onClick={() => dispatch({ type: ACTIONS.STAR, payload: {id: id}})}
                        >
                            { !starred
                                ? <Star className="h-6 w-6 p-1" />
                                : <StyledStarFill className="h-6 w-6 p-1" />
                            }
                        </button>
                        <button 
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center self-start"
                            onClick={() => removeCard()}
                        >
                            <StyledX className="h-6 w-6" />
                        </button>
                    </div>
                    { !card.collection  
                        ? <textarea ref={ bodyRef } value={ new_body } rows="1"
                            placeholder="Add a Comment..."
                            onChange={e => set_new_body(e.target.value) }
                            className="w-full h-fit bg-light focus:outline-none resize-none flex-grow py-4 font-sora text-primary text-sm"
                        />
                        : collectionButtons(body)
                    }
                    <div className={`${!error ? "bg-light_accent" : "danger-color" } h-8 flex items-center`}>
                        <button onClick={ () => handleSubmit() }
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2 underline px-2 py-0.5 font-sorabold"
                        >
                            Submit
                        </button>
                        <button onClick={ () => cancelEdit() }
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2 underline px-2 py-0.5 font-sorabold"
                        >
                            Cancel
                        </button>
                        <div className="flex-grow flex">
                            <span className={`font-sorabold ${error ? "fade-text" : ""}`}> { error } </span>
                        </div>
                        <span className="font-mono px-2"> {score} </span>
                        <button 
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center"
                            onClick={() => dispatch({ type: ACTIONS.UPVOTE, payload: { id: id }})}
                        >
                                <ArrowUpShort className="h-6 w-6" />
                        </button>
                        <button 
                            className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center"
                            onClick={() => dispatch({ type: ACTIONS.DOWNVOTE, payload: {id: id }})}
                        >
                            <ArrowDownShort className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}