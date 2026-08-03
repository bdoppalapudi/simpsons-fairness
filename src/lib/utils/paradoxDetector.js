import { generateAdData, CATEGORIES } from "./dataGenerator.js";

function rate(arr) {
    if (!arr.length) return 0;
    return (arr.filter((r) => r.delivered).length / arr.length) * 100;
}

//Tolerance Band:
//treat rates within this many percentages as "nearly equal" rather than a real directional
//difference. Real data is noisy and so without this even a 0.1% of gap would count as a 
//direction 

const TOLERENCE = 3;

function direction(rateA, rateB) {
    if (Math.abs(rateA - rateB) <= TOLERENCE) return 'tie';
    return rateA > rateB ? 'A' : 'B';
}

//Given a set of records, determine if Simpson's Paradox is currently present; 
//Every category agrees with one direction (or ties); but aggregate disagrees with it

export function detectParadox(records) {
    const categoryDirections = CATEGORIES.map((cat) => {
        const inCat = records.filter((r) => r.category === cat);
        return {
            category: cat,
            direction: direction(
                rate(inCat.filter((r) => r.group === 'A')),
                rate(inCat.filter((r) => r.group === 'B'))

            )
        };
    });
    const aggDirection = direction(
        rate(records.filter((r) => r.group === 'A')),
        rate(records.filter((r) => r.group === 'B'))
    );

    //Non-tie category directions. if they dont all agree with each other, this isn't 
    //really a "clean" paradox case either

    const nonTieDirections = categoryDirections.map((c) => c.direction).filter((d) => d !== 'tie');

    const categoriesAgree = new Set(nonTieDirections).size <= 1;
    const categoryConsensus = nonTieDirections[0] || 'tie';

    const paradoxPresent = categoriesAgree && aggDirection !== 'tie' && categoryConsensus !== aggDirection;

    return {
        categoryDirections,
        aggDirection,
        categoryConsensus,
        paradoxPresent
    };

}

//Sweep imbalance between 0and 1 and then record the agg gap
// Group A rate - Group B rate at each step so we can plot where the cross over into 
//"paradox category" happens
// Averages a few trails per step to smooth out random noise.

export function sweepImbalance({
    totalImpressions = 4000,
    steps = 21,
    trailsPerStep = 3
} = {}) {
    const results = [];

    for (let i=0; i < steps; i++ ){
        const imbalanceValue = i / (steps - 1);
        let gapSum = 0;

        for (let t = 0; t < trailsPerStep; t++) {
            const records = generateAdData({ totalImpressions, imbalance: imbalanceValue });
            const rA = rate(records.filter((r) => r.group === 'A'));
            const rB = rate(records.filter((r) => r.group === 'B'));
            gapSum += rA - rB;

        }

        results.push({
            imbalance: imbalanceValue,
            gap: gapSum / trailsPerStep
        });

    }
    return results;

}
