import { X, Plus, ArrowUpShort, ArrowDownShort, Star, StarFill } from "@styled-icons/bootstrap";
import { ModeEdit } from "@styled-icons/material"
import styled from 'styled-components';
import { ACTIONS, colors } from "./utils.js";

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