import * as math from 'mathjs';

// Assuming playerMap is a global constant mapping player IDs to indices
const playerMap: Record<number, number> = {
    // ... mapping of player IDs to indices ...
};

// function transformInputData(rawData: number[][], numPlayers: number): { x: number[], y: number }[] {
//     const transformedData = rawData.map((row) => {
//         const vector = new Array(numPlayers * 2).fill(0); // Initialize a vector of 1000 elements
//         const outcome = row[0];

//         // Set values for offensive players
//         for (let i = 1; i <= 5; i++) {
//             vector[row[i]] = 1;
//         }

//         // Set values for defensive players
//         for (let i = 6; i <= 10; i++) {
//             vector[row[i] + numPlayers] = -1;
//         }

//         return { x: vector, y: outcome };
//     });

//     return transformedData;
// }

function combineAndTransformData(rawData: number[][], numPlayers: number): { x: number[], y: number, weight: number }[] {
    const combinedData = new Map<string, { x: number[], totalY: number, count: number }>();

    rawData.forEach(row => {
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



// function combineAndTransformData(rawData: number[][], numPlayers: number): { x: number[], y: number }[] {
//     const combinedData = new Map<string, { x: number[], totalY: number, count: number }>();

//     rawData.forEach((row) => {
//         const key = row.slice(1, 11).sort().join(',');

//         if (!combinedData.has(key)) {
//             combinedData.set(key, { x: new Array(numPlayers * 2).fill(0), totalY: 0, count: 0 });
//         }

//         const data = combinedData.get(key);
//         if (data) {
//             // Sum the outcomes and count the occurrences
//             data.totalY += row[0];
//             data.count += 1;

//             for (let i = 1; i <= 5; i++) {
//                 data.x[row[i]] = 1;
//             }
//             for (let i = 6; i <= 10; i++) {
//                 data.x[row[i] + numPlayers] = -1;
//             }
//         }
//     });

//     // Calculate the average outcome and return the transformed data
//     return Array.from(combinedData.values()).map(({ x, totalY, count }) => {
//         return { x: x, y: (totalY / count) * 100 };
//     });
// }


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


// function ridgeRegression(data: { x: number[], y: number }[], lambda: number, numPlayers: number): math.Matrix {
//     const X = math.matrix(data.map((d) => d.x));
//     const Y = math.matrix(data.map((d) => d.y));
    
//     // console.log("X Matrix:", X.toString());
//     // console.log("Y Matrix:", Y.toString());
//     console.log("S");

//     const Xt = math.transpose(X);
//     const XtX = math.multiply(Xt, X);
//     // console.log("XtX Matrix:", XtX.toString());
//     console.log("MID");

//     const lambdaI = math.multiply(lambda, math.identity(numPlayers));
//     const XtX_plus_lambdaI = math.add(XtX, lambdaI);
//     // console.log("XtX + lambdaI Matrix:", XtX_plus_lambdaI.toString());

//     const inverse = math.inv(XtX_plus_lambdaI);
//     const XtY = math.multiply(Xt, Y);
//     const coefficients = math.multiply(inverse, XtY);

//     return coefficients;
// }

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

// function remapPlayerIDs(rawData: number[][], playerCounts: Record<number, number>, minOccurrences: number): [number[][], Record<number, number>] {
//     let newID = 1; // Start from 1 as per your requirement
//     const playerIDMap: Record<number, number> = {};

//     const filteredData = rawData.map(row => 
//         row.map((playerID, index) => {
//             if (index === 0 || playerCounts[playerID] >= minOccurrences) {
//                 if (!playerIDMap[playerID]) {
//                     playerIDMap[playerID] = newID++;
//                 }
//                 return playerIDMap[playerID];
//             }
//             return 0;
//         })
//     );

//     return [filteredData, playerIDMap];
// }

// function createReverseMapping(playerIDMap: Record<number, number>): Record<number, number> {
//     const reverseMapping: Record<number, number> = {};
//     Object.entries(playerIDMap).forEach(([originalID, mappedID]) => {
//         reverseMapping[mappedID] = parseInt(originalID);
//     });
//     return reverseMapping;
// }




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

    // let playerCounts = countPlayerOccurrences(rawData);
    // console.log(maxPlayerID);

    // // Filter player IDs based on occurrence count
    // const filteredData = rawData.map(row => 
    //     row.map((playerID, index) => 
    //         index === 0 || playerCounts[playerID] >= MIN_OCCURRENCES ? playerID : 0
    //     )
    // );

    // maxPlayerID = 0;
    // filteredData.forEach((row) => {
    //     // Check the maximum ID in offensive and defensive player IDs
    //     for (let i = 1; i <= 10; i++) {
    //         if (row[i] > maxPlayerID) {
    //             maxPlayerID = row[i];
    //         }
    //     }
    // });

    // const MIN_OCCURRENCES = 250;
    // const playerCounts = countPlayerOccurrences(rawData.slice(0, 60000));

    // const [filteredData, playerIDMap] = remapPlayerIDs(rawData.slice(0, 60000), playerCounts, MIN_OCCURRENCES);
    // const maxPlayerID = Math.max(...Object.values(playerIDMap));

    const transformedData = combineAndTransformData(rawData, maxPlayerID + 1);

    // playerCounts = countPlayerOccurrences(rawData);
    // console.log("len", filteredData.length, maxPlayerID);
    // const transformedData = combineAndTransformData(filteredData.slice(0, 10000), maxPlayerID + 1, playerCounts);


    console.log("len", rawData.length, maxPlayerID);
    console.log("transformed", transformedData.length)
    const lambda = 20; // Regularization parameter, adjust as needed
    const coefficientMatrix = ridgeRegression(transformedData, lambda, maxPlayerID + 1);
    
    // console.log('Player Contributions:', coefficients);

    //     // Create reverse mapping
    //     // const reverseMapping = createReverseMapping(playerIDMap);

    //     // Apply reverse mapping to coefficients
    //     const originalCoefficients: Record<number, number> = {};
        // coefficients.forEach((coeff, index) => {
        //     const originalID = reverseMapping[index];
        //     if (originalID) {
        //         originalCoefficients[originalID] = coeff;
        //     }
        // });

            // Convert matrix to array
    const coefficients = coefficientMatrix.valueOf() as number[];

    return coefficients;
}

