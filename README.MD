# @docamz/json-tokenizer

Lightweight and symmetric JSON tokenizer for compression and optimization.
Generates consistent dictionaries and supports reversible tokenization.

---

### 🚀 Install

```bash
npm install @docamz/json-tokenizer

```

### 🔧 Usage

```typescript
import { generateDictionary, tokenize, detokenize } from "@yourname/json-tokenizer";

const keysPath= path.join(__dirname, "dictionnaries/dict.txt");
const keys = fs.readFileSync(keysPath, 'utf-8').split(/\r?\n/).filter(Boolean);

const dict = generateDictionary(keys);

const data = { name: "Alice", age: 30, city: "Paris" };
const encoded = tokenize(data, dict.forward);
const decoded = detokenize(encoded, dict.reverse);

console.log(encoded); // { a: 'Alice', b: 30, c: 'Paris' }
console.log(decoded); // { name: 'Alice', age: 30, city: 'Paris' }
```

### API

| Function                        | Description                      |
| ------------------------------- | -------------------------------- |
| `generateDictionary(keys)`      | Generate a reversible dictionary |
| `tokenize(obj, dict.forward)`   | Replace JSON keys with tokens    |
| `detokenize(obj, dict.reverse)` | Restore original JSON keys       |

### 📄 License

MIT License © 2025 DocAmz
