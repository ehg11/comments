import { X, Plus, ArrowUpShort, ArrowDownShort, Star, StarFill } from "@styled-icons/bootstrap";
import { ModeEdit } from "@styled-icons/material"
import styled from 'styled-components';
import { ACTIONS, colors } from "./utils.js";
import { useState, useRef, useEffect } from "react";

const StyledX = styled(X)`
    &:hover {
        color: ${colors.danger};
    } 
`

const StyledStarFill = styled(StarFill)`
    color: ${colors.light_accent}
`

export default function Card({ card, dispatch }) {
    const id = card.id;
    const title = card.title ?? "Default Title";
    const body = card.body ?? "Default Body";
    const score = card.score ?? 0;
    const starred = card.starred ?? false;

    const [new_title, set_new_title] = useState("");
    const [new_body, set_new_body] = useState(""); 
    const [error, set_error] = useState("");

    const titleRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (titleRef && titleRef.current) {
            titleRef.current.style.height = "0px";
            const scrollHeight = titleRef.current.scrollHeight;
            titleRef.current.style.height = `${scrollHeight + 3}px`;
        }
    }, [new_title])
    
    useEffect(() => {
        if (bodyRef && bodyRef.current) {
            bodyRef.current.style.height = "0px";
            const scrollHeight = bodyRef.current.scrollHeight;
            bodyRef.current.style.height = `${scrollHeight + 3}px`;
        }
    }, [new_body])
    
    function handleSubmit(e) {
        e.preventDefault();
        if (new_title === "") {
            set_error("Please Enter a Title");
            setTimeout(() => {
                set_error("");
            }, 2000);
        }
        else if (new_body === "") {
            set_error("Please Enter a Comment");
            setTimeout(() => {
                set_error("");
            }, 2000);
        }
        else {
            dispatch({ type: ACTIONS.SUBMIT, payload: {id: id, title: new_title, body: new_body }})
            set_new_title("");
            set_new_body("");
        }
    }

    function cancelEdit() {

    }

    if (card.finalized) {
        return (
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
                <div className="bg-light flex-grow h-fit py-4 font-sora text-primary text-sm">
                    {body}
                </div>
                <div className="bg-light_accent h-8 flex items-center">
                    <button className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2">
                        <Plus className="h-6 w-6" />
                    </button>
                    <button className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center">
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
        )
    }
    else {
        return (
            <form 
                className={`flex flex-col w-full h-fit min-h-1/3 rounded-2xl align-top overflow-hidden child:px-5 drop-shadow-lg ${error ? "shake" : ""}`}
                onSubmit={ handleSubmit }
            >
                <div className="bg-light h-fit w-full flex items-center gap-1 pt-5">
                    <div className="flex-grow font-sorabold text-2xl text-important bg-inherit h-fit">
                        <textarea ref={ titleRef } value={ new_title } 
                            placeholder="Give your Comment a Title..."
                            onChange={e => set_new_title(e.target.value)}
                            className="w-full max-w-full bg-inherit focus:outline-none resize-none font-sorabold"
                        />
                    </div>
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
                <div className="bg-light flex-grow h-fit py-4 font-sora text-primary text-sm">
                    <textarea ref={ bodyRef } value={ new_body }
                        placeholder="Add a Comment..."
                        onChange={e => set_new_body(e.target.value) }
                        className="w-full bg-inherit focus:outline-none resize-none"
                    />
                </div>
                <div className={`${!error ? "bg-light_accent" : "danger-color" } h-8 flex items-center`}>
                    <button type="submit" name="submit_button"
                        className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2 underline px-2 py-0.5 font-sorabold"
                    >
                        Submit
                    </button>
                    <button type="submit" name="cancel_button" value="Cancel"
                        className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center mr-2 underline px-2 py-0.5 font-sorabold"
                    >
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
            </form>
        )
    }
}