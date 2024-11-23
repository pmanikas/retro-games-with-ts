const SPEED = 5;

const BASE_PADDING = 20;

const LEVELS = {
    1: {
        enemies: {
            rows: 1,
            columns: 6,
            speed: 0.5,
        },
    },
    2: {
        enemies: {
            rows: 3,
            columns: 11,
            speed: 0.75,
        },
    },
    3: {
        enemies: {
            rows: 4,
            columns: 11,
            speed: 2,
        },
    },
    4: {
        enemies: {
            rows: 7,
            columns: 11,
            speed: 2,
        },
    },
    5: {
        enemies: {
            rows: 7,
            columns: 12,
            speed: 2,
        },
    },
    6: {
        enemies: {
            rows: 7,
            columns: 13,
            speed: 3,
        },
    },
};

const SPACING = 10;

export { SPEED, BASE_PADDING, LEVELS, SPACING };
