import {calculateSemesterId, euro, formatDate, getWorstAnnotationLevel} from "./util";
import {AnnotationLevel} from "./Interfaces";
import {Interval} from "./Calculator";

describe("test getWorstAnnotationLevel", () => {
    it.each([
        [[], AnnotationLevel.Ok],
        [[AnnotationLevel.Error], AnnotationLevel.Error],
        [[AnnotationLevel.Unchecked], AnnotationLevel.Unchecked],
        [[AnnotationLevel.Warning], AnnotationLevel.Warning],
        [[AnnotationLevel.Ok], AnnotationLevel.Ok],
        [[AnnotationLevel.Error, AnnotationLevel.Unchecked], AnnotationLevel.Error],
        [[AnnotationLevel.Unchecked, AnnotationLevel.Warning], AnnotationLevel.Unchecked],
        [[AnnotationLevel.Warning, AnnotationLevel.Ok], AnnotationLevel.Warning],
        [[AnnotationLevel.Error, AnnotationLevel.Unchecked, AnnotationLevel.Warning, AnnotationLevel.Ok], AnnotationLevel.Error],
    ])("worst level of '%s' is '%s'", (levels, expected) => {
        expect(getWorstAnnotationLevel(levels)).toBe(expected);
    });
});

describe("test Euro formatting", () => {
    it.each(
        [
            [undefined, '0,00 €'],
            [11, '11,00 €'],
            [12.34, '12,34 €'],
            [0.005, '0,01 €'],
            [1.23456789, '1,23 €'],
        ]
    )("'%s' is formatted as '%s'", (value, expected) => {
        expect(euro(value)).toBe(expected);
    });
});

describe("test date formatting", () => {
    it.each(
        [
            [new Date('2022-12-24'), '24.12.2022'],
            [new Date('2022-02-01'), '01.02.2022'],
            [new Date('2022-02-01T11:11:11.111'), '01.02.2022'],
        ]
    )("'%s' is formatted as '%s'", (value, expected) => {
        expect(formatDate(value)).toBe(expected);
    });
});

it('recognize summer semester', () => {
    const interval = Interval.fromStrings('2020-04-01', '2020-09-30');
    expect(calculateSemesterId(interval)).toBe('2020-SoSe');
});

it('recognize winter semester', () => {
    const interval = Interval.fromStrings('2020-09-30', '2021-04-01');
    expect(calculateSemesterId(interval)).toBe('2020-WiSe');
});

it('calculateSemesterId garbage in garbage out', () => {
    expect(calculateSemesterId(null)).toBe(undefined);
    expect(calculateSemesterId(undefined)).toBe(undefined);
});
