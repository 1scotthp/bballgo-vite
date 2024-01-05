import * as math from 'mathjs';


function combineAndTransformData(rawData: number[][], numPlayers: number): { x: number[], y: number, weight: number }[] {
    const combinedData = new Map<string, { x: number[], totalY: number, count: number }>();

    rawData.forEach(row => {
        //const remappedRow = row.map((id, index) => index === 0 ? id : playerIDMap[id] || 0);
        const key = row.slice(1, 11).sort().join(',');

        if (!combinedData.has(key)) {
            combinedData.set(key, { x: new Array(numPlayers).fill(0), totalY: 0, count: 0 });
        }

        const data = combinedData.get(key);
        if (data) {
            data.totalY += row[0]; // Sum outcomes
            data.count += 1; // Count possessions

            for (let i = 1; i <= 5; i++) {
                data.x[row[i]] = 1;
            }
            for (let i = 6; i <= 10; i++) {
                data.x[row[i]] = -1;
            }
        }
    });

    // Incorporate possession weighting in the transformed data
    return Array.from(combinedData.values()).map(({ x, totalY, count }) => ({ 
        x: x, 
        y: (totalY / count) * 100, // Average outcome
        weight: count // Weight by number of possessions
    }));
}



function ridgeRegression(data: { x: number[], y: number, weight: number }[], lambda: number, numPlayers: number): math.Matrix {
    // Scaling X and Y by the square root of the weight
    const weightedX = data.map(d => d.x.map(x => x * d.weight));
    const weightedY = data.map(d => d.y * d.weight);

    const X = math.matrix(weightedX);
    const Y = math.matrix(weightedY);

    console.log("S");
    
    // Remaining part of the regression remains the same
    const Xt = math.transpose(X);
    const XtX = math.multiply(Xt, X);
    const lambdaI = math.multiply(lambda, math.identity(numPlayers));

    console.log("MID");
    const XtX_plus_lambdaI = math.add(XtX, lambdaI);
    const inverse = math.inv(XtX_plus_lambdaI);
    const XtY = math.multiply(Xt, Y);
    const coefficients = math.multiply(inverse, XtY);

    return coefficients;
}


function countPlayerOccurrences(rawData: number[][]): Record<number, number> {
    const playerCounts: Record<number, number> = {};

    rawData.forEach(row => {
        for (let i = 1; i <= 10; i++) {
            const playerID = row[i];
            playerCounts[playerID] = (playerCounts[playerID] || 0) + 1;
        }
    });

    return playerCounts;
}

function createReverseMapping(playerIDMap: Record<number, number>): Record<number, number> {
    const reverseMapping: Record<number, number> = {};
    Object.entries(playerIDMap).forEach(([originalID, mappedID]) => {
        // Only add to reverse mapping if originalID is not 0
        if (parseInt(originalID) !== 0) {
            reverseMapping[mappedID] = parseInt(originalID);
        }
    });
    return reverseMapping;
}

function remapPlayerIDs(rawData: number[][], playerCounts: Record<number, number>, minOccurrences: number): [number[][], Record<number, number>] {
    let newID = 1; // Start from 1 for valid players
    const playerIDMap: Record<number, number> = {};

    const filteredData = rawData.map(row => 
        row.map((playerID, index) => {
            if (index === 0 || (playerCounts[playerID] >= minOccurrences && playerID !== 0)) {
                if (!playerIDMap.hasOwnProperty(playerID)) {
                    playerIDMap[playerID] = newID++;
                }
                return playerIDMap[playerID];
            }
            return 0; // Map players with less than minOccurrences (or ID = 0) to 0
        })
    );

    return [filteredData, playerIDMap];
}


export function runRAPM(rawData: number[][]): number[] {
    // const MIN_OCCURRENCES = 50;
    let maxPlayerID = 0;
    rawData.forEach((row) => {
        // Check the maximum ID in offensive and defensive player IDs
        for (let i = 1; i <= 10; i++) {
            if (row[i] > maxPlayerID) {
                maxPlayerID = row[i];
            }
        }
    });

    console.log(maxPlayerID);
    const MIN_OCCURRENCES = 50;
    let playerCounts = countPlayerOccurrences(rawData);

    // const [filteredData, playerIDMap] = remapPlayerIDs(rawData, playerCounts, MIN_OCCURRENCES);
    //console.log(playerIDMap);

    // maxPlayerID = 0;
    // filteredData.forEach((row) => {
    //     // Check the maximum ID in offensive and defensive player IDs
    //     for (let i = 1; i <= 10; i++) {
    //         if (row[i] > maxPlayerID) {
    //             maxPlayerID = row[i];
    //         }
    //     }
    // });

    console.log(maxPlayerID);

    const transformedData = combineAndTransformData(rawData, maxPlayerID + 1);

    console.log("len", rawData.length, maxPlayerID);
    console.log("transformed", transformedData.length)
    const lambda = 20; // Regularization parameter, adjust as needed
    const coefficientMatrix = ridgeRegression(transformedData, lambda, maxPlayerID + 1);
    const coefficients = coefficientMatrix.valueOf() as number[];
    // const reverseMap = createReverseMapping(playerIDMap);

   // console.log(reverseMap, playerIDMap, reverseMap[playerIDMap[1]])

    // Initialize an array of length numPlayers filled with 0

    // Find the maximum original player ID
    //const maxOriginalID = Math.max(...Object.keys(reverseMap).map(id => parseInt(id)));

    // Initialize an array of length maxOriginalID + 1 filled with 0
    // let retCoefficients = Array(maxOriginalID + 1).fill(0);

        
    //     // Populate retCoefficients based on reverseMap and coefficients
    //     for (let i = 1; i < coefficients.length; i++) { // Start from 1 since 0 is mapped to players with few occurrences
    //         const originalID = reverseMap[i];
    //         console.log(originalID, i)
    //         if (originalID !== undefined) {
    //             retCoefficients[originalID] = coefficients[i];
    //         }
    //     }
    
    return coefficients;
}

