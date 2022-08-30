import { useState } from 'react';
import { CircleFill } from '@styled-icons/bootstrap';

export default function MenuButton({ display_icon, menu_contents }) {
    const icon = display_icon ?? <CircleFill className="h-6 w-6"/>
    const contents = menu_contents ?? <div />
    const [show, set_show] = useState(false);

    function toggleVisibility() {
        set_show(!show);
    }

    return (
        <div className="flex h-full items-center">
            { show && contents }
            <button onClick={ () => toggleVisibility() } className="hover:brightness-90 w-fit h-fit bg-inherit rounded-full flex items-center">
                { icon }
            </button>
        </div>
    )
}