
export default function render(data: Array<string>) {
    console.log(data.join('\n').split('\n').map(ii => '  ' + ii).join('\n'));
}
