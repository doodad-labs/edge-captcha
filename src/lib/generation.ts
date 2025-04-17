import { createCanvas } from 'canvas';

export const styles = [
    'emoji',
    'text'
]

export function generateAnswer(style: typeof styles[number]): string | null {
    if (style === 'emoji') {
        return '😀';
    }

    if (style === 'text') {
        return 'Hello World';
    }

    return null;
}

const width: number = 1000;
const height: number = 250;

export default function (style: typeof styles[number], answer: string): Buffer {

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.font = `100px Sans Not-Rotated`
    ctx.fillText(answer, width/2, (height/2) + (100/2))

    return canvas.toBuffer('image/png');
}