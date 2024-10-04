const createParams = (paramsObject: object) => {
    return Object.fromEntries(Object.entries(paramsObject).filter(([_, v]) => v !== undefined));
};

export const paramsUtil = {
    createParams
}

