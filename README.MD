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
import { generateDictionary } from "@docamz/json-tokenizer";

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
import { tokenize, detokenize } from "@docamz/json-tokenizer";

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

#### Benchmark Results

| Model | Raw Size | Raw→Tok | Tok+Gzip | MsgPack | Tok+Msg | Tok+Msg+Gzip | Tok Enc/Dec | Msg Enc/Dec | Tok+Msg Enc/Dec |
|-------|----------|---------|----------|---------|---------|--------------|-------------|-------------|------------------|
| model1.json | 83.8 KB | 64.6% | 55.5% | 60.3% | 76.3% | 55.5% | 0.4/0.5 ms | 1.3/0.8 ms | 0.2/0.2 ms |
| model2.json | 134.4 KB | 65.7% | 51.8% | 61.3% | 77.2% | 55.7% | 0.5/0.6 ms | 0.3/0.4 ms | 0.2/0.2 ms |
| model3.json | 148.7 KB | 66.9% | 56.5% | 62.7% | 78.0% | 57.4% | 0.3/0.3 ms | 0.3/0.3 ms | 0.2/0.2 ms |
| model4.json | 33.1 KB | 69.9% | 45.6% | 64.1% | 82.2% | 46.2% | 0.1/0.1 ms | 0.2/0.1 ms | 0.1/0.1 ms |
| **Average** | - | **66.8%** | **52.4%** | **62.1%** | **78.4%** | **53.7%** | **0.32/0.40 ms** | **0.53/0.40 ms** | **0.15/0.19 ms** |

**Key:**
- Raw→Tok: Tokenization compression ratio
- Tok+Gzip: Tokenized with Gzip compression
- MsgPack: MessagePack compression ratio
- Tok+Msg: Combined tokenization + MessagePack
- Tok+Msg+Gzip: Best compression (tokenization + MessagePack + Gzip)
- Enc/Dec: Encoding/Decoding performance in milliseconds

### 📄 License

MIT License © 2025 DocAmz
