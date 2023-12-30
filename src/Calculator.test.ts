import {Interval} from "./Calculator";
import type {IAnnotatedDocument} from "./Interfaces";

const doc = (dateStart: string, dateEnd: string): IAnnotatedDocument => {
    return {
        filename: 'xxx',
        dateStart: dateStart,
        dateEnd: dateEnd,
        checked: true,
        references: [],
        annotations: [],
    };
}

describe('test simple interval overlapping', () => {
    it.each([
        [
            Interval.fromStrings('2022-02-02', '2022-02-02'),
            [
                doc('2022-02-02', '2022-02-02'),
            ]
        ],
        [
            Interval.fromStrings('2023-02-02', '2023-02-02'),
            [
                doc('2023-01-02', '2023-03-02'),
            ]
        ],
        [
            Interval.fromStrings('2024-01-02', '2024-03-02'),
            [
                doc('2024-02-02', '2024-02-02'),
            ]
        ],
        [
            Interval.fromStrings('2025-02-02', '2025-02-03'),
            [
                doc('2025-02-01', '2025-02-02'),
                doc('2025-02-03', '2025-02-04'),
            ]
        ],
    ])("all documents overlap '%s'", (interval, documents) => {
        expect(interval.getOverlapping(documents)).toEqual(documents);
    });
});

describe('test simple interval coverage', () => {
    it.each([
        [
            Interval.fromStrings('2022-02-02', '2022-02-02'),
            [
                doc('2022-02-02', '2022-02-02'),
            ],
            true
        ],
        [
            Interval.fromStrings('2023-02-02', '2023-02-02'),
            [
                doc('2023-01-02', '2023-03-02'),
            ],
            true
        ],
        [
            Interval.fromStrings('2024-01-02', '2024-03-02'),
            [
                doc('2024-02-02', '2024-02-02'),
            ],
            false
        ],
        [
            Interval.fromStrings('2025-02-02', '2025-02-03'),
            [
                doc('2025-02-01', '2025-02-02'),
                doc('2025-02-03', '2025-02-04'),
            ],
            true
        ],
        [
            Interval.fromStrings('2026-02-02', '2026-02-03'),
            [
                doc('2026-02-01', '2025-02-02'),
                // gap
                doc('2026-02-04', '2025-02-05'),
            ],
            false
        ],
        [
            Interval.fromStrings('2027-01-30', '2027-02-03'),
            [
                doc('2027-02-04', '2027-02-04'),
                doc('2027-02-03', '2027-02-03'),
                doc('2027-02-02', '2027-02-02'),
                doc('2027-02-01', '2027-02-01'),
                doc('2027-01-31', '2027-01-31'),
                doc('2027-01-30', '2027-01-30'),
                doc('2027-01-29', '2027-01-29'),
            ],
            true
        ],
    ])("test '%#': do all documents cover '%s'?", (interval, documents, expected) => {
        expect(interval.isCoveredBy(documents)).toEqual(expected);
    });
});
