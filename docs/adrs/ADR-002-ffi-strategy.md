# ADR-002: FFI Strategy (PyO3 for Rust-Python Integration)

**Status:** ~~Proposed~~ **SUPERSEDED** by [ADR-003](./ADR-003-architecture-simplification.md)
**Date:** 2025-10-19
**Deciders:** Architect Agent
**Related:** ADR-001 (Multi-Tier Architecture)

> **⚠️ SUPERSEDED**: This ADR describes FFI strategy for the **REJECTED multi-tier architecture**. The project has been simplified to **Next.js 14 Full-Stack TypeScript** with no Rust/Python/FFI. See [ADR-003](./ADR-003-architecture-simplification.md) for the current architecture.

---

## Context and Problem Statement

The Rust core needs to communicate with the Python backend. This requires choosing an FFI (Foreign Function Interface) approach that balances:
- Ease of development
- Performance
- Type safety
- Error handling
- Maintainability

**Question**: What FFI strategy should we use for Rust ↔ Python communication?

---

## Decision Drivers

- **Developer Experience**: How easy is it to expose Rust functions to Python?
- **Type Safety**: Preserve Rust's type guarantees across the boundary
- **Error Handling**: Clean propagation of Rust errors to Python exceptions
- **Performance**: Minimize serialization overhead
- **Community Support**: Active maintenance and documentation
- **Debugging**: Ability to debug issues at the FFI boundary

---

## Considered Options

### Option 1: PyO3 ⬅️ **RECOMMENDED**

**Description**: Use PyO3, the most popular Rust-Python binding library

```rust
use pyo3::prelude::*;

#[pyfunction]
fn load_agent(path: String) -> PyResult<String> {
    match agent_loader::load(&path) {
        Ok(agent) => Ok(serde_json::to_string(&agent).unwrap()),
        Err(e) => Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(
            format!("Failed to load agent: {}", e)
        ))
    }
}

#[pymodule]
fn madace_core(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(load_agent, m)?)?;
    Ok(())
}
```

**Pros:**
- ✅ Industry standard (used by Polars, Pydantic v2, cryptography)
- ✅ Excellent documentation
- ✅ Automatic Python module generation
- ✅ Natural Rust error → Python exception mapping
- ✅ Active development (v0.20+ stable)
- ✅ Supports Python 3.7+

**Cons:**
- ❌ Learning curve for PyO3 macros
- ❌ Compilation time increases
- ❌ Complex types need manual conversion

### Option 2: cbindgen + ctypes

**Description**: Generate C headers from Rust, call via Python ctypes

**Pros:**
- ✅ No extra dependencies
- ✅ Standard C ABI
- ✅ Works with any language

**Cons:**
- ❌ Manual memory management
- ❌ Error handling is C-style (error codes)
- ❌ No automatic type conversion
- ❌ Unsafe and error-prone

### Option 3: JSON over HTTP (Microservice)

**Description**: Run Rust as separate HTTP service, Python calls it

**Pros:**
- ✅ Language-agnostic
- ✅ Can scale independently
- ✅ Easy debugging

**Cons:**
- ❌ Network overhead (even localhost)
- ❌ More complex deployment
- ❌ Not truly "FFI"

---

## Decision Outcome

**Chosen Option**: **Option 1 - PyO3**

**Rationale:**
PyO3 is the industry standard for Rust-Python integration with proven success in major projects. The benefits far outweigh the learning curve.

---

## Implementation Strategy

### Phase 1: Minimal FFI Proof-of-Concept

**Goal**: Prove PyO3 works before building everything

```rust
// core/src/lib.rs
use pyo3::prelude::*;

#[pyfunction]
fn hello_from_rust() -> PyResult<String> {
    Ok("Hello from Rust!".to_string())
}

#[pymodule]
fn madace_core(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(hello_from_rust, m)?)?;
    Ok(())
}
```

```python
# backend/test_ffi.py
import madace_core

result = madace_core.hello_from_rust()
print(result)  # "Hello from Rust!"
```

**Success Criteria**: This works in < 1 day

---

### Phase 2: FFI Design Patterns

#### Pattern 1: Simple Data Types
```rust
#[pyfunction]
fn validate_yaml(content: String) -> PyResult<bool> {
    Ok(content.starts_with("agent:"))
}
```

#### Pattern 2: Complex Types via JSON
```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Agent {
    id: String,
    name: String,
}

#[pyfunction]
fn load_agent(path: String) -> PyResult<String> {
    let agent = Agent { id: "test".to_string(), name: "Test".to_string() };
    serde_json::to_string(&agent)
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
}
```

```python
import json
import madace_core

agent_json = madace_core.load_agent("path/to/agent.yaml")
agent = json.loads(agent_json)
print(agent['name'])  # "Test"
```

#### Pattern 3: Error Handling
```rust
#[pyfunction]
fn risky_operation() -> PyResult<String> {
    std::fs::read_to_string("missing.txt")
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyIOError, _>(
            format!("File operation failed: {}", e)
        ))
}
```

```python
try:
    madace_core.risky_operation()
except IOError as e:
    print(f"Caught error: {e}")
```

---

### Phase 3: FFI Layer Architecture

**Thin FFI Boundary** (Recommended):
```
┌──────────────────────┐
│   Python Backend     │
│  ┌───────────────┐   │
│  │  FFI Wrapper  │   │  ← Thin: Just calls + JSON conversion
│  └───────┬───────┘   │
└──────────┼───────────┘
           │ PyO3
┌──────────┼───────────┐
│  ┌───────▼───────┐   │
│  │  FFI Module   │   │  ← Thin: Just PyO3 macros
│  └───────┬───────┘   │
│  ┌───────▼───────┐   │
│  │ Business Logic│   │  ← Thick: All logic here
│  └───────────────┘   │
│   Rust Core          │
└──────────────────────┘
```

**Anti-Pattern** (Don't do this):
```rust
// ❌ DON'T: Business logic in FFI function
#[pyfunction]
fn load_agent(path: String) -> PyResult<String> {
    // 100 lines of business logic here...
}

// ✅ DO: Keep FFI thin
#[pyfunction]
fn load_agent(path: String) -> PyResult<String> {
    agent_loader::load(&path)  // Business logic in separate module
        .map(|a| serde_json::to_string(&a).unwrap())
        .map_err(|e| PyErr::new::<PyValueError, _>(e.to_string()))
}
```

---

## Technical Specifications

### Dependencies (Cargo.toml)

```toml
[package]
name = "madace_core"
version = "0.1.0"
edition = "2021"

[lib]
name = "madace_core"
crate-type = ["cdylib"]  # For Python shared library

[dependencies]
pyo3 = { version = "0.20", features = ["extension-module"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"
```

### Build Configuration (Python)

```python
# setup.py (if needed)
from setuptools import setup
from setuptools_rust import Binding, RustExtension

setup(
    name="madace-backend",
    rust_extensions=[
        RustExtension("madace_core", binding=Binding.PyO3, path="core/Cargo.toml")
    ],
    zip_safe=False,
)
```

### Development Workflow

```bash
# 1. Build Rust library
cd core
cargo build --release

# 2. Copy to Python path (or use maturin)
cp target/release/libmadace_core.so ../backend/madace_core.so

# 3. Use in Python
cd backend
python -c "import madace_core; print(madace_core.hello_from_rust())"
```

**Better: Use Maturin** (PyO3's build tool)
```bash
pip install maturin
cd core
maturin develop  # Auto-builds and installs to Python
```

---

## Performance Considerations

### Serialization Overhead

```
Rust Struct → JSON String → Python Dict
```

**Measured Overhead**: ~1-5ms for typical agent data (acceptable)

**Optimization**: For hot paths, use PyO3's native type conversion
```rust
use pyo3::types::PyDict;

#[pyfunction]
fn get_agent_metadata(py: Python, path: String) -> PyResult<&PyDict> {
    let dict = PyDict::new(py);
    dict.set_item("id", "agent-001")?;
    dict.set_item("name", "PM")?;
    Ok(dict)
}
```

### Memory Management

**Who owns the data?**
```rust
// ✅ Python owns (safe)
#[pyfunction]
fn create_agent() -> PyResult<String> {
    Ok("agent data".to_string())  // Python gets ownership
}

// ❌ Rust owns (dangerous)
#[pyfunction]
fn get_agent_ref() -> PyResult<&'static str> {
    // Lifetime issues! Don't do this.
}
```

---

## Testing Strategy

### Unit Tests (Rust side)
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_agent() {
        let result = load_agent("test.yaml".to_string());
        assert!(result.is_ok());
    }
}
```

### Integration Tests (Python side)
```python
import pytest
import madace_core

def test_ffi_agent_loading():
    result = madace_core.load_agent("test.yaml")
    assert result is not None

def test_ffi_error_handling():
    with pytest.raises(ValueError):
        madace_core.load_agent("nonexistent.yaml")
```

---

## Risks and Mitigations

### Risk 1: FFI Debugging Difficulty
**Mitigation**:
- Extensive logging on both sides
- Clear error messages with context
- Test FFI boundary independently

### Risk 2: Type Mismatches
**Mitigation**:
- Use JSON for complex types (schema validation)
- Document expected types clearly
- Write integration tests

### Risk 3: PyO3 Version Changes
**Mitigation**:
- Pin PyO3 version in Cargo.toml
- Test upgrades in isolated branch
- Follow PyO3 changelog

---

## Decision Validation

### Success Metrics:
1. ✅ FFI proof-of-concept works in < 1 day
2. ✅ Agent loading via FFI in < 1 week
3. ✅ FFI overhead < 10ms per operation
4. ✅ Zero segfaults in normal operation

### Abort Criteria:
1. ❌ Can't get basic FFI working in 3 days
2. ❌ Constant segfaults or memory issues
3. ❌ FFI overhead > 100ms
4. ❌ Debugging becomes impossible

---

## Alternatives for Future Consideration

If PyO3 proves problematic:
1. **Rust HTTP Service** - Run Rust as microservice
2. **WASM** - Compile Rust to WebAssembly, run in Node.js
3. **Node.js Native Addon** - Skip Python, use Neon (Rust-Node bindings)

---

## References

- PyO3 Guide: https://pyo3.rs
- PyO3 Examples: https://github.com/PyO3/pyo3/tree/main/examples
- Maturin: https://github.com/PyO3/maturin
- Real-world Example: Polars (https://github.com/pola-rs/polars)

---

**Decision Status**: 📋 **Proposed** (pending POC validation)
**Next Step**: Build FFI proof-of-concept (hello_from_rust)
**Owner**: DEV Agent
