export default function scale(domain: [number, number], range: [number, number]) {
    const [ostart, ostop] = range;
    const [istart, istop] = domain;
    return (value: number) => {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    };
};
