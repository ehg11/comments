export const ACTIONS = {
    INIT: "init",
    SUBMIT: "submit",
    ADD_NEWCARD: "add-newcard",
    REMOVE: "remove",
    STAR: "star",
    ADD_SUBCARD: "add-subcard",
    UPVOTE: "upvote",
    DOWNVOTE: "downvote",
    EDIT: "edit",
    TOGGLE_DISPLAY: "toggle-display",
    ADD_NEWCOLLECTION: "add-newcollection",
    CHANGE_COLOR: "change-color",
    CHANGE_COLOR_OPTIONS: "change-color-option",
}

export const PAGES = {
    CARDS: "cards",
    LOGIN: "login",
    PREFS: "prefs",
}

export const colors = {
    light: '#F6F6F7',
    light_accent: '#61AFA9',
    main: '#61AFA9',
    dark_accent: '#92939D',
    dark: '#474752',
    primary: '#989692',
    important: '#474752',
    success: '#63a864',
    warning: '#e0972c',
    danger: '#f44336',
}

export const test_card = {
    id: 0,
    title: "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain...",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce scelerisque tellus urna, et suscipit odio interdum eu. Nam sed sapien tempor, vehicula quam et, scelerisque dui. Proin accumsan urna eget lacinia tempor. Cras cursus, quam ut hendrerit scelerisque, mi ligula ultrices lorem, in aliquet urna elit at lorem. Morbi dictum risus nec interdum placerat. In vitae odio ante. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla facilisi. In eu purus vestibulum leo accumsan eleifend ac id nulla. Nunc sodales ultrices elit vel convallis. Nunc ultrices lorem eget porta mattis. Integer consequat congue elit sed feugiat. Pellentesque condimentum nulla vel risus tincidunt tincidunt. Sed ac quam vel diam laoreet tempor..",
    score: 0,
    starred: false,
    finalized: true,
    display: true,
    parents: [],
    collection: false,
}

export function getChildren(cards, parentID) {
    return cards.filter(card => card.parents?.includes(parentID));
}

export function colors2hex(r, g, b) {
    const hex = "0123456789abcdef";
    let colors = [r, g, b];
    colors.forEach((color, index) => {
        const tens = Math.floor(color / 16);
        const ones = color % 16;
        colors[index] = `${hex[tens]}${hex[ones]}`;
    })
    return `#${colors.join("")}`;
}

export function hex2colors(hex) {
    let r = hex.slice(1, 3);
    let g = hex.slice(3, 5);
    let b = hex.slice(5);
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

export function isLight(hex) {
    return hex2colors(hex).reduce((prev, curr) => prev + curr) / 3 > 128
}
 