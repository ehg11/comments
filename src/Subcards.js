import { getChildren } from "./utils.js";
import Card from "./Card.js";

export default function Subcards({cards, children, card_level, dispatch}) {

    const level = card_level;

    function levelBars() {
        if (level > 1) {
            return <div className="w-1 bg-dark_accent mr-3 hover:brightness-50 rounded-full drop-shadow-md"/>;
        }
    }

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
                                dispatch={ dispatch }
                            />
                        )
                    })
                }
            </div>
        </div>
    )

}