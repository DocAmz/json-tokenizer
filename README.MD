# @docamz/json-tokenizer

Lightweight and symmetric JSON tokenizer for compression and optimization.
Generates consistent dictionaries and supports reversible tokenization.
Can be used standalone or with MessagePack or Gzip for enhanced compression.

---

### 🚀 Install

```bash
npm install @docamz/json-tokenizer

```

### 🔧 Usage

#### Create a dictionary

If you have a predefined set of keys, you can create a dictionary as follows:
Create a text file `dictionnaries/dict.txt` with the following content:

```text
name
age
city
```

#### Generate dictionary from keys

```typescript
import * as fs from "fs";
import * as path from "path";
import { generateDictionary } from "@yourname/json-tokenizer";

// Load keys from a file or define them directly
const keysPath = path.join(__dirname, "dictionnaries/dict.txt");
const name = "myDict-v1";

// Example keys file content:
const keys = fs.readFileSync(keysPath, 'utf-8').split(/\r?\n/).filter(Boolean);

// Generate dictionary
const dict = generateDictionary(keys);

//write dictionary to files
const outputPath = path.join(__dirname, `${name}.dictionary.json`);
fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2), 'utf-8');

```

#### Tokenize and detokenize JSON

```typescript
import * as fs from "fs";
import * as path from "path";
import { tokenize, detokenize } from "@yourname/json-tokenizer";

const dictPath = path.join(__dirname, './dictionnaries/core-v1.dictionary.json');
const raw = fs.readFileSync(dictPath, 'utf-8');
const dict = JSON.parse(raw) as Dictionary;

// Example data to tokenize
const data     = { name: "Alice", age: 30, city: "Paris" };
const encoded  = tokenize(data, dict.forward);
const decoded  = detokenize(encoded, dict.reverse);

console.log(encoded); // { a: 'Alice', b: 30, c: 'Paris' }
console.log(decoded); // { name: 'Alice', age: 30, city: 'Paris' }
```

### API

| Function                        | Description                      |
| ------------------------------- | -------------------------------- |
| `generateDictionary(keys)`      | Generate a reversible dictionary |
| `tokenize(obj, dict.forward)`   | Replace JSON keys with tokens    |
| `detokenize(obj, dict.reverse)` | Restore original JSON keys       |

### Benchmarks

📘 Benchmarking model1.json...
  • Raw: 83.8 KB | Gzip: 6.9 KB
  • Tokenized: 29.6 KB | +gzip: 3.1 KB
  • MsgPack: 33.3 KB | +gzip: 4.0 KB
  • Tok+Msg: 19.9 KB | +gzip: 3.1 KB
  • Encode/Decode (Tok): 0.45 / 0.54 ms
  • Encode/Decode (Msg): 1.30 / 0.81 ms
  • Encode/Decode (Tok+Msg): 0.19 / 0.24 ms
  • Symmetry: ✅

📘 Benchmarking model2.json...
  • Raw: 134.4 KB | Gzip: 7.5 KB
  • Tokenized: 46.0 KB | +gzip: 3.6 KB
  • MsgPack: 51.9 KB | +gzip: 4.6 KB
  • Tok+Msg: 30.7 KB | +gzip: 3.3 KB
  • Encode/Decode (Tok): 0.49 / 0.60 ms
  • Encode/Decode (Msg): 0.34 / 0.36 ms
  • Encode/Decode (Tok+Msg): 0.18 / 0.21 ms
  • Symmetry: ✅

📘 Benchmarking model3.json...
  • Raw: 148.7 KB | Gzip: 7.4 KB
  • Tokenized: 49.3 KB | +gzip: 3.2 KB
  • MsgPack: 55.5 KB | +gzip: 4.1 KB
  • Tok+Msg: 32.6 KB | +gzip: 3.1 KB
  • Encode/Decode (Tok): 0.26 / 0.35 ms
  • Encode/Decode (Msg): 0.27 / 0.30 ms
  • Encode/Decode (Tok+Msg): 0.18 / 0.22 ms
  • Symmetry: ✅

📘 Benchmarking model4.json...
  • Raw: 33.1 KB | Gzip: 3.5 KB
  • Tokenized: 10.0 KB | +gzip: 1.9 KB
  • MsgPack: 11.9 KB | +gzip: 2.7 KB
  • Tok+Msg: 5.9 KB | +gzip: 1.9 KB
  • Encode/Decode (Tok): 0.08 / 0.12 ms
  • Encode/Decode (Msg): 0.22 / 0.12 ms
  • Encode/Decode (Tok+Msg): 0.06 / 0.09 ms
  • Symmetry: ✅

📊 Summary Table:

┌─────────────┬───────────┬────────────┬───────────┬───────────┬────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┬──────────────────┬──────────┬─────┐
│ Model       │ Raw→Tok % │ Tok+Gzip % │ MsgPack % │ Tok+Msg % │ Tok+Msg+Gzip % │ Tok Enc (ms) │ Tok Dec (ms) │ Msg Enc (ms) │ Msg Dec (ms) │ Tok+Msg Enc (ms) │ Tok+Msg Dec (ms) │ Coverage │ Sym │
├─────────────┼───────────┼────────────┼───────────┼───────────┼────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┼──────────┼─────┤
│ model1.json │ 64.6      │ 55.5       │ 60.3      │ 76.3      │ 55.5           │ 0.4          │ 0.5          │ 1.3          │ 0.8          │ 0.2              │ 0.2              │ 100.0%   │ ✅  │
├─────────────┼───────────┼────────────┼───────────┼───────────┼────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┼──────────┼─────┤
│ model2.json │ 65.7      │ 51.8       │ 61.3      │ 77.2      │ 55.7           │ 0.5          │ 0.6          │ 0.3          │ 0.4          │ 0.2              │ 0.2              │ 100.0%   │ ✅  │
├─────────────┼───────────┼────────────┼───────────┼───────────┼────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┼──────────┼─────┤
│ model3.json │ 66.9      │ 56.5       │ 62.7      │ 78.0      │ 57.4           │ 0.3          │ 0.3          │ 0.3          │ 0.3          │ 0.2              │ 0.2              │ 100.0%   │ ✅  │
├─────────────┼───────────┼────────────┼───────────┼───────────┼────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────┼──────────────────┼──────────┼─────┤
│ model4.json │ 69.9      │ 45.6       │ 64.1      │ 82.2      │ 46.2           │ 0.1          │ 0.1          │ 0.2          │ 0.1          │ 0.1              │ 0.1              │ 100.0%   │ ✅  │
└─────────────┴───────────┴────────────┴───────────┴───────────┴────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┴──────────────────┴──────────┴─────┘

📈 Averages:
┌──────────────────┬─────────┐
│ (index)          │ Values  │
├──────────────────┼─────────┤
│ Raw→Tok (%)      │ '66.78' │
│ Tok+Gzip (%)     │ '52.36' │
│ MsgPack (%)      │ '62.11' │
│ Tok+Msg (%)      │ '78.42' │
│ Tok+Msg+Gzip (%) │ '53.68' │
│ Tok Enc (ms)     │ '0.32'  │
│ Tok Dec (ms)     │ '0.40'  │
│ Msg Enc (ms)     │ '0.53'  │
│ Msg Dec (ms)     │ '0.40'  │
│ Tok+Msg Enc (ms) │ '0.15'  │
│ Tok+Msg Dec (ms) │ '0.19'  │
└──────────────────┴─────────┘

### 📄 License

MIT License © 2025 DocAmz
