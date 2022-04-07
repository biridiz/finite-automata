const { tokens, grammars } = require('./inputs');

const INITIAL_STATE = 'S';
const CLOSING_STATE = '*';
const MAJOR = '::=';
const stateTokens = [
    INITIAL_STATE,
    'A', 'B', 'C', 'D', 'E', 
    'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'
];
const finiteAutomata = [];
const states = { index: 0 };

const Tokens = () => {
    const tokenArray = [];
    let line = 0;
    for (let token of tokens) {
        tokenArray.push(token.split(''));
    }
    for (line=0; line<tokenArray.length; line++) {
        for (let column=0; column<tokenArray[line].length; column++) {
            if (column == 0 && line !== 0) {
                finiteAutomata.push(
                    { [`${CLOSING_STATE}${stateTokens[states.index]}` ] : tokenArray[line-1] });
                finiteAutomata.push(
                    { [`${INITIAL_STATE}/${tokenArray[line][column]}`] : stateTokens[states.index+1] }); 
            }
            finiteAutomata.push(
                { [`${stateTokens[states.index]}/${tokenArray[line][column]}`] : stateTokens[states.index+1] });
            states.index++;
        }
        
    }
    finiteAutomata.push({ [`${CLOSING_STATE}${stateTokens[states.index]}` ] : tokenArray[line-1] });
    states.index++;
}

const Grammars = () => {
    const grammarArray = [];
    for (let grammar of grammars) { 
        grammarArray.push(
            grammar.replace(/\s/g, '')
            .replace(/\</g, '')
            .replace(/\>/g, '')
            .split('|'));
    }
    for (let line=0; line<grammarArray.length; line++) {
        for (let item=0; item<grammarArray[line].length; item++) {
            if (grammarArray[line][item].includes(MAJOR)) {
                const [ state, first ] = grammarArray[line][item].split(MAJOR);
                const [ value, nextState ] = first.split('');
                let firstStateOfLine;
                if (state === INITIAL_STATE) {
                    firstStateOfLine = state;

                } else if (state !== INITIAL_STATE) {
                    states[state] = stateTokens[states.index];
                    firstStateOfLine = stateTokens[states.index];
                    states.index++;       
                }
                if (Object.keys(states).includes(state)) {
                    firstStateOfLine = states[state];
                }

                if (Object.keys(states).includes(nextState)) {
                    grammarArray[line][item] = firstStateOfLine + MAJOR + value + states[nextState];

                } else if (nextState !== INITIAL_STATE) {
                    grammarArray[line][item] = firstStateOfLine + MAJOR + value + stateTokens[states.index];
                    states[state] = stateTokens[states.index];

                } else if (nextState === INITIAL_STATE) {
                    grammarArray[line][item] = firstStateOfLine + MAJOR + value + INITIAL_STATE;
                    states[state] = stateTokens[states.index];
                }

            } else {
                const [ value, state ] = grammarArray[line][item].split('');
                if (Object.keys(states).includes(state)) {
                    grammarArray[line][item] = value + states[state];

                } else if (state !== INITIAL_STATE) {
                    grammarArray[line][item] = value + stateTokens[states.index];
                    states[state] = stateTokens[states.index];
                }
                if (state === INITIAL_STATE) {
                    grammarArray[line][item] = value + INITIAL_STATE;
                    states[state] = stateTokens[states.index];
                }
            }
        }
        for (let column=0; column<grammarArray[line].length; column++) {
            if (column === 0) {
                const [state, first ] = grammarArray[line][column].split(MAJOR);
                const [value, nextState] = first.split('');
                states.stateInicial = state;
                finiteAutomata.push({ [`${state}/${value}` ] : nextState });

            } else {
                const [value, nextState] = grammarArray[line][column].split('');
                finiteAutomata.push({ [`${states.stateInicial}/${value}` ] : nextState });
            }
        }
    }
    states.index++;
};

const Determination = () => {
    let cont = 0;
    let newStates = [];
    let deleteKeys = [];

    for (let i = 0; i<finiteAutomata.length; i++) {
        for (let j = 0; j<finiteAutomata.length; j++) {
            if (Object.keys(finiteAutomata[i])[0] == Object.keys(finiteAutomata[j])[0]) {
                if (cont > 0) {
                    if (Object.values(finiteAutomata[i])[0] != Object.values(finiteAutomata[j])[0]) {
                        newStates.push({ [`${Object.keys(finiteAutomata[i])[0]}`]: stateTokens[states.index] });
                    }
                    deleteKeys.push(Object.keys(finiteAutomata[i])[0]);
                    states.index++;
                }
                cont++;            
            }
        }
        cont = 0;
    }
    if (deleteKeys.length > 0) {
        for (let deleteKey of deleteKeys) {
            for (let i = 0; i<finiteAutomata.length; i++) {
                if (Object.keys(finiteAutomata[i])[0] == deleteKey) {
                    finiteAutomata.splice(i, 1);
                }
            }
        }
    }
    if (newStates.length > 0) {
        for (let newState of newStates) {
            finiteAutomata.push(newState);
        }
    }
}

Tokens();
Grammars();
Determination();

console.log("FINITE AUTOMATA: ", finiteAutomata);