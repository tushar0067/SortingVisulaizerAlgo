myCanvas.width = 500;
myCanvas.height = 400;
const margin = 30;
let n = 30; // Initial array size
const array = [];
let moves = [];
const cols = [];
let spacing = (myCanvas.width - margin * 2) / n;
const ctx = myCanvas.getContext("2d");

const maxColumnHeight = 200;

let speed = 50;
let animationFrameId = null;

init();

let audioCtx = null;

function playNote(freq, type) {
    if (audioCtx == null) {
        audioCtx = new (
            AudioContext ||
            webkitAudioContext ||
            window.webkitAudioContext
        )();
    }
    const dur = 0.2;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.type = type;
    osc.stop(audioCtx.currentTime + dur);

    const node = audioCtx.createGain();
    node.gain.value = 0.4;
    node.gain.linearRampToValueAtTime(
        0, audioCtx.currentTime + dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    array.length = 0;
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    moves = [];
    updateColumns();
    animate();
}

function updateColumns() {
    cols.length = 0;
    spacing = (myCanvas.width - margin * 2) / n;
    for (let i = 0; i < array.length; i++) {
        const x = i * spacing + spacing / 2 + margin;
        const y = myCanvas.height - margin - i * 3;
        const width = spacing - 4;
        const height = maxColumnHeight * array[i];
        cols[i] = new Column(x, y, width, height);
    }
}

function startSorting(sortFunction) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    const arrayCopy = array.slice();
    moves = sortFunction(arrayCopy);
    animate();
}

function playBubbleSort() {
    startSorting(bubbleSort);
}

function playInsertionSort() {
    startSorting(insertionSort);
}

function playHeapSort() {
    startSorting(heapSort);
}

function playMergeSort() {
    startSorting(mergeSort);
}

function playQuickSort() {
    startSorting(quickSort);
}

function playSelectionSort() {
    startSorting(selectionSort);
}

function bubbleSort(arr) {
    const moves = [];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            moves.push({ indices: [j, j + 1], swap: arr[j] > arr[j + 1] });
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return moves;
}

function insertionSort(arr) {
    const moves = [];
    for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0 && arr[j - 1] > arr[j]) {
            moves.push({ indices: [j - 1, j], swap: true });
            [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
            j--;
        }
        if (j > 0) {
            moves.push({ indices: [j - 1, j], swap: false });
        }
    }
    return moves;
}

function heapSort(arr) {
    const moves = [];

    function heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest !== i) {
            moves.push({ indices: [i, largest], swap: true });
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapify(n, largest);
        } else {
            moves.push({ indices: [i, largest], swap: false });
        }
    }

    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
        heapify(arr.length, i);
    }

    for (let i = arr.length - 1; i > 0; i--) {
        moves.push({ indices: [0, i], swap: true });
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(i, 0);
    }

    return moves;
}

function mergeSort(arr) {
    const moves = [];
    const tempArray = arr.slice();

    function merge(start, mid, end) {
        let i = start;
        let j = mid + 1;
        let k = start;

        while (i <= mid && j <= end) {
            moves.push({ indices: [i, j], swap: false });
            if (arr[i] <= arr[j]) {
                tempArray[k++] = arr[i++];
            } else {
                tempArray[k++] = arr[j++];
            }
        }

        while (i <= mid) {
            moves.push({ indices: [i, i], swap: false });
            tempArray[k++] = arr[i++];
        }

        while (j <= end) {
            moves.push({ indices: [j, j], swap: false });
            tempArray[k++] = arr[j++];
        }

        for (let p = start; p <= end; p++) {
            arr[p] = tempArray[p];
            moves.push({ indices: [p, p], swap: true });
        }
    }

    function mergeSortRecursive(start, end) {
        if (start < end) {
            const mid = Math.floor((start + end) / 2);
            mergeSortRecursive(start, mid);
            mergeSortRecursive(mid + 1, end);
            merge(start, mid, end);
        }
    }

    mergeSortRecursive(0, arr.length - 1);
    return moves;
}

function quickSort(arr) {
    const moves = [];

    function partition(low, high) {
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            moves.push({ indices: [j, high], swap: false });
            if (arr[j] < pivot) {
                i++;
                moves.push({ indices: [i, j], swap: true });
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        moves.push({ indices: [i + 1, high], swap: true });
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

        return i + 1;
    }

    function quickSortRecursive(low, high) {
        if (low < high) {
            const pi = partition(low, high);
            quickSortRecursive(low, pi - 1);
            quickSortRecursive(pi + 1, high);
        }
    }

    quickSortRecursive(0, arr.length - 1);
    return moves;
}

function selectionSort(arr) {
    const moves = [];

    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < arr.length; j++) {
            moves.push({ indices: [i, j], swap: false });
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            moves.push({ indices: [i, minIndex], swap: true });
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }

    return moves;
}

function animate() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    let changed = false;
    for (let i = 0; i < cols.length; i++) {
        changed = cols[i].draw(ctx) || changed;
    }

    if (!changed && moves.length > 0) {
        const move = moves.shift();
        const [i, j] = move.indices;
        const waveformType = move.swap ? "square" : "sine";
        const baseFreq = 200;
        const maxFreq = 2000;
        const freq = baseFreq + (maxFreq - baseFreq) * (speed / 100);
        playNote(freq, waveformType);
        if (move.swap) {
            cols[i].moveTo(cols[j]);
            cols[j].moveTo(cols[i], -1);
            [cols[i], cols[j]] = [cols[j], cols[i]];
            [array[i], array[j]] = [array[j], array[i]];
        } else {
            cols[i].jump();
            cols[j].jump();
        }
    }

    const delay = Math.max(1, 101 - speed);
    animationFrameId = setTimeout(() => {
        requestAnimationFrame(animate);
    }, delay);
}

function updateSpeed() {
    speed = parseInt(document.getElementById('speedControl').value);
    document.getElementById('speedValue').textContent = speed;
}

function updateArraySize() {
    n = parseInt(document.getElementById('arraySizeControl').value);
    document.getElementById('arraySizeValue').textContent = n;
    init();
}

document.getElementById('speedControl').addEventListener('input', updateSpeed);
document.getElementById('arraySizeControl').addEventListener('input', updateArraySize);